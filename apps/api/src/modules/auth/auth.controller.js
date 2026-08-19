import prisma from "../../lib/prisma.js";
import { success, fail } from "../../utils/response.js";
import {
  sendOtp,
  validateOtpAndLogin,
  googleLogin,
  refreshAccessToken,
  logout,
  getMe,
} from "./auth.service.js";
import * as authRepository from "./repositories/auth.repository.js";
import { updateProfile } from "../user/user.service.js";

export async function requestOtp(req, res) {
  try {
    const { phone } = req.body;
    const result = await sendOtp(phone, req);
    return success(res, "OTP berhasil dikirim", result);
  } catch (err) {
    return fail(res, err.message, 400);
  }
}

export async function verifyOtp(req, res) {
  try {
    const { phone, otp } = req.body;
    const result = await validateOtpAndLogin(phone, otp, req);

    await req.audit({
      action: "AUTH_LOGIN",
      entityType: "User",
      entityId: result.user.id,
      metadata: { method: "otp", phone },
    });

    return success(res, "Login berhasil", result);
  } catch (err) {
    return fail(res, err.message, 401);
  }
}

export async function googleAuth(req, res) {
  try {
    const { idToken } = req.body;
    if (!idToken) return fail(res, "idToken required", 400);
    const result = await googleLogin(idToken, req);

    await req.audit({
      action: "AUTH_GOOGLE_LOGIN",
      entityType: "User",
      entityId: result.user.id,
      metadata: { method: "google" },
    });

    return success(res, "Google login berhasil", result);
  } catch (err) {
    return fail(res, err.message, 401);
  }
}

export async function refreshToken(req, res) {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return fail(res, "refreshToken required", 400);
    const result = await refreshAccessToken(token, req);

    await req.audit({
      action: "AUTH_REFRESH",
      entityType: "User",
      entityId: result.user.id,
      metadata: { tokenRotated: true },
    });

    return success(res, "Token berhasil diperbarui", result);
  } catch (err) {
    return fail(res, err.message, 401);
  }
}

export async function logoutHandler(req, res) {
  try {
    const { refreshToken: token } = req.body;
    await logout(token);

    if (req.user?.id) {
      await req.audit({
        action: "AUTH_LOGOUT",
        entityType: "User",
        entityId: req.user.id,
      });
    }

    return success(res, "Logout berhasil");
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

export async function updateProfileHandler(req, res) {
  try {
    const { name, email, currency, avatar } = req.body;
    const allowed = {};
    if (name !== undefined) allowed.name = name;
    if (email !== undefined) allowed.email = email;
    if (currency !== undefined) allowed.currency = currency;
    if (avatar !== undefined) allowed.avatar = avatar;
    if (Object.keys(allowed).length === 0) {
      return fail(res, "Tidak ada data yang diubah", 400);
    }
    const user = await updateProfile(req.user.id, allowed);
    return success(res, "Profil berhasil diperbarui", user);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

export async function getSessions(req, res) {
  try {
    const sessions = await authRepository.findSessionsByUserId(req.user.id);
    return success(res, "Sesi aktif", sessions);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

export async function deleteAccount(req, res) {
  try {
    await prisma.user.delete({ where: { id: req.user.id } });
    return success(res, "Akun berhasil dihapus");
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

export async function revokeSession(req, res) {
  try {
    const { id } = req.params;
    const result = await authRepository.revokeSessionById(id, req.user.id);
    if (result.count === 0) {
      return fail(res, "Sesi tidak ditemukan", 404);
    }
    return success(res, "Sesi dicabut");
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

export async function me(req, res) {
  try {
    const user = await getMe(req.user.id);
    if (!user) return fail(res, "User not found", 404);
    return success(res, "User ditemukan", user);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

export async function sessionFromOrder(req, res) {
  try {
    const { orderId } = req.body;
    if (!orderId) return fail(res, "orderId wajib diisi", 400);

    const { sessionFromOrderId } = await import("./auth.service.js");
    const result = await sessionFromOrderId(orderId, req);

    return success(res, "Login via order berhasil", result);
  } catch (err) {
    return fail(res, err.message, 400);
  }
}

