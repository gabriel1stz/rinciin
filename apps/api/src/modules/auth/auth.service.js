import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../../lib/prisma.js";
import { getOrCreateUser } from "../user/user.service.js";
import * as userRepository from "../user/repositories/user.repository.js";
import * as authRepository from "./repositories/auth.repository.js";
import { isDevOtpEnabled, buildDevOtpResponse } from "../../helpers/dev.helper.js";
import { sendWhatsAppNotification } from "../../helpers/whatsapp.helper.js";
import { normalizePhoneNumber } from "../../helpers/phone.helper.js";


const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY_DAYS = 30;
const OTP_EXPIRY_MINUTES = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;
const GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v1/certs";


function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, phone: user.phone, tier: user.tier, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

function generateRefreshToken() {
  return crypto.randomBytes(40).toString("hex");
}

async function issueTokens(user, req, createRefresh = authRepository.createRefreshToken) {
  const accessToken = generateAccessToken(user);
  const token = generateRefreshToken();

  const refreshRecord = await createRefresh({
    token,
    userId: user.id,
    device: req?.headers?.["user-agent"] || null,
    ip: req?.ip || null,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
  });

  return { user, accessToken, refreshToken: refreshRecord.token };
}

const DEFAULT_CATEGORIES = [
  { name: "Food", icon: "\uD83C\uDF7D\uFE0F" },
  { name: "Transportation", icon: "\uD83D\uDE97" },
  { name: "Shopping", icon: "\uD83D\uDECD\uFE0F" },
  { name: "Bills", icon: "\uD83D\uDCC4" },
  { name: "Salary", icon: "\uD83D\uDCB0" },
  { name: "Investment", icon: "\uD83D\uDCC8" },
  { name: "Entertainment", icon: "\uD83C\uDFAC" },
  { name: "Health", icon: "\uD83C\uDFE5" },
  { name: "Education", icon: "\uD83D\uDCDA" },
  { name: "Other", icon: "\uD83D\uDCC1" },
];

async function createDefaultCategories(userId) {
  const existing = await authRepository.findDefaultCategory(userId);
  if (existing) return;

  await authRepository.createDefaultCategories(userId, DEFAULT_CATEGORIES);
}

async function verifyGoogleToken(idToken) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID not configured");

  const certsRes = await fetch(GOOGLE_CERTS_URL);
  const certs = await certsRes.json();

  const decoded = jwt.decode(idToken, { complete: true });
  if (!decoded || !decoded.header.kid) throw new Error("Invalid Google token");

  const key = certs[decoded.header.kid];
  if (!key) throw new Error("Google public key not found");

  return jwt.verify(idToken, key, {
    algorithms: ["RS256"],
    audience: clientId,
  });
}

export async function googleLogin(idToken, req = null) {
  const payload = await verifyGoogleToken(idToken);

  const googleSub = payload.sub;
  const email = payload.email || `google_${googleSub}@rinci.in`;
  const name = payload.name || email.split("@")[0];
  const avatar = payload.picture || null;
  const syntheticPhone = `google_${googleSub}`;

  return prisma.$transaction(async (tx) => {
    let user = await authRepository.findUserByPhoneTx(tx, syntheticPhone);

    if (!user) {
      user = await authRepository.createUserTx(tx, {
        phone: syntheticPhone,
        name,
        email,
        googleId: googleSub,
        avatar,
        tier: "free",
        wallets: {
          create: [{ name: "Cash", type: "cash", balance: 0, isDefault: true }],
        },
      });

      await authRepository.createDefaultCategoriesTx(tx, user.id, DEFAULT_CATEGORIES);
    }

    return issueTokens(user, req, (data) => authRepository.createRefreshTokenTx(tx, data));
  });
}

export async function sendOtp(phone, req = null) {
  if (!phone) throw new Error("Nomor WhatsApp wajib diisi");
  const cleanPhone = normalizePhoneNumber(phone);

  const lastOtp = await authRepository.findLastOtp(cleanPhone);

  if (lastOtp) {
    const secondsSinceLastOtp = (Date.now() - lastOtp.createdAt.getTime()) / 1000;
    if (secondsSinceLastOtp < OTP_RESEND_COOLDOWN_SECONDS) {
      const remaining = Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLastOtp);
      throw new Error(`Mohon tunggu ${remaining} detik sebelum meminta ulang OTP`);
    }
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await authRepository.createOtp({
    phone: cleanPhone,
    code,
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
  });

  // Kirim kode OTP langsung ke nomor WhatsApp user via internal bot
  const otpMessage = [
    `🔐 *KODE VERIFIKASI RINCI.IN*`,
    `━━━━━━━━━━━━━━`,
    `Kode OTP login Dashboard kamu adalah:`,
    ``,
    `👉 *${code}* 👈`,
    ``,
    `⏱️ Kode ini hanya berlaku selama *${OTP_EXPIRY_MINUTES} menit*.`,
    `⚠️ *JANGAN BERIKAN* kode ini kepada siapa pun demi keamanan akunmu.`
  ].join("\n");

  sendWhatsAppNotification(cleanPhone, otpMessage).catch((err) => {
    console.warn("⚠️ [Auth] Gagal mengirim OTP WA:", err.message);
  });

  const result = { phone: cleanPhone, expiresIn: OTP_EXPIRY_MINUTES * 60 };


  if (isDevOtpEnabled()) {
    Object.assign(result, buildDevOtpResponse(code));
  }

  return result;
}

export async function validateOtpAndLogin(phone, inputOtp, req = null) {
  const cleanPhone = normalizePhoneNumber(phone);

  const record = await authRepository.findLastOtp(cleanPhone);

  if (!record) throw new Error("OTP tidak ditemukan. Silakan minta OTP terlebih dahulu.");

  if (new Date() > record.expiresAt) {
    throw new Error("OTP sudah kadaluarsa. Silakan minta OTP baru.");
  }

  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    throw new Error("Terlalu banyak percobaan. Silakan minta OTP baru.");
  }

  const isValidOtp = record.code === String(inputOtp);

  if (!isValidOtp) {
    await authRepository.incrementOtpAttempts(record.id);
    const remaining = OTP_MAX_ATTEMPTS - record.attempts - 1;
    throw new Error(
      remaining > 0
        ? `Kode OTP salah. ${remaining} percobaan tersisa.`
        : "Terlalu banyak percobaan. Silakan minta OTP baru."
    );
  }

  await authRepository.deleteOtpsByPhone(cleanPhone);

  return prisma.$transaction(async (tx) => {
    let user = await authRepository.findUserByPhoneTx(tx, cleanPhone);

    if (!user) {
      user = await authRepository.createUserTx(tx, {
        phone: cleanPhone,
        tier: "free",
        wallets: {
          create: [{ name: "Cash", type: "cash", balance: 0, isDefault: true }],
        },
      });

      await authRepository.createDefaultCategoriesTx(tx, user.id, DEFAULT_CATEGORIES);
    }

    return issueTokens(user, req, (data) => authRepository.createRefreshTokenTx(tx, data));
  });
}


export async function refreshAccessToken(refreshToken, req = null) {
  if (!refreshToken) throw new Error("Refresh token required");

  const record = await authRepository.findRefreshToken(refreshToken);

  if (!record) throw new Error("Refresh token tidak valid");
  if (record.revoked) throw new Error("Refresh token sudah digunakan");
  if (new Date() > record.expiresAt) throw new Error("Refresh token sudah kadaluarsa. Silakan login ulang.");

  await authRepository.revokeRefreshToken(record.id);

  const accessToken = generateAccessToken(record.user);
  const token = generateRefreshToken();

  const newRefreshRecord = await authRepository.createRefreshToken({
    token,
    userId: record.user.id,
    device: req?.headers?.["user-agent"] || null,
    ip: req?.ip || null,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
  });

  const { password: _, ...user } = record.user;

  return { user, accessToken, refreshToken: newRefreshRecord.token };
}

export async function logout(refreshToken) {
  if (!refreshToken) return;

  await authRepository.revokeRefreshTokenByToken(refreshToken);
}

export async function getMe(userId) {
  return userRepository.findById(userId);
}

export async function sessionFromOrderId(orderId, req = null) {
  if (!orderId) throw new Error("Order ID wajib diisi");

  const payment = await prisma.payment.findUnique({
    where: { orderId }
  });

  if (!payment) throw new Error("Pembayaran tidak ditemukan");
  if (payment.status !== "PAID") throw new Error("Pembayaran belum berstatus PAID");

  let user = null;
  if (payment.userId) {
    user = await userRepository.findById(payment.userId);
  }
  if (!user && payment.phone) {
    const cleanPhone = normalizePhoneNumber(payment.phone);
    user = await userRepository.findByPhone(cleanPhone);
    if (!user) {
      user = await userRepository.findByPhone(payment.phone);
    }
    if (!user) {
      user = await authRepository.createUser({
        phone: cleanPhone || payment.phone,
        tier: payment.plan || "PRO",
        wallets: {
          create: [{ name: "Cash", type: "cash", balance: 0, isDefault: true }],
        },
      });
      await authRepository.createDefaultCategories(user.id, DEFAULT_CATEGORIES);
    }
  }

  if (!user) throw new Error("User dari transaksi ini tidak ditemukan");

  return issueTokens(user, req);
}

