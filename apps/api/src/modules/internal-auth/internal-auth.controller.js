import { success, fail } from "../../utils/response.js";
import * as authService from "./internal-auth.service.js";

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return success(res, "Login berhasil", result);
  } catch (err) {
    return fail(res, err.message, 401);
  }
}

export async function me(req, res) {
  try {
    const user = await authService.getMe(req.internalUser.id);
    return success(res, "User", user);
  } catch (err) {
    return fail(res, err.message, 404);
  }
}

export async function logout(_req, res) {
  return success(res, "Logout berhasil");
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.updatePassword(req.internalUser.id, currentPassword, newPassword);
    return success(res, result.message);
  } catch (err) {
    return fail(res, err.message, 400);
  }
}
