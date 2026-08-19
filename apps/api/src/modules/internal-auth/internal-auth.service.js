import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma.js";
import { metricsCollector } from "../../lib/metrics.collector.js";

const ACCESS_TOKEN_EXPIRY = "7d";


function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_INTERNAL_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

const userSelect = {
  id: true, name: true, email: true, role: true, avatar: true, lastLoginAt: true, createdAt: true,
};

export async function login(email, password) {
  if (!email || !password) {
    throw new Error("Email dan password wajib diisi");
  }

  const user = await prisma.internalUser.findUnique({ where: { email } });

  if (!user) {
    metricsCollector.recordSecurityEvent("FAILED_ADMIN_LOGIN", { email, reason: "User not found" });
    await prisma.internalNotification.create({
      data: {
        type: "FAILED_LOGIN",
        title: "Percobaan Login Admin Gagal",
        message: `Percobaan login dengan email non-terdaftar: ${email}`,
      },
    }).catch(() => {});
    throw new Error("Email atau password salah");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    metricsCollector.recordSecurityEvent("FAILED_ADMIN_LOGIN", { email, reason: "Invalid password" });
    await prisma.internalNotification.create({
      data: {
        type: "FAILED_LOGIN",
        title: "Password Admin Salah",
        message: `Percobaan login gagal untuk user admin: ${email}`,
      },
    }).catch(() => {});
    throw new Error("Email atau password salah");
  }

  metricsCollector.recordSecurityEvent("SUCCESSFUL_ADMIN_LOGIN", { email, userId: user.id });

  await prisma.internalUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const accessToken = generateAccessToken(user);

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, lastLoginAt: new Date(), createdAt: user.createdAt },
    accessToken,
  };
}

export async function getMe(userId) {
  const user = await prisma.internalUser.findUnique({
    where: { id: userId },
    select: userSelect,
  });

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  return user;
}

export async function updatePassword(userId, currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    throw new Error("Password lama dan baru wajib diisi");
  }

  if (newPassword.length < 6) {
    throw new Error("Password baru minimal 6 karakter");
  }

  const user = await prisma.internalUser.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!valid) {
    throw new Error("Password lama salah");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.internalUser.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { message: "Password berhasil diubah" };
}
