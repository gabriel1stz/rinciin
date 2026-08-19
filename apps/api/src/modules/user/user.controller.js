import { createTrialUser, findUserByPhone } from "./user.service.js";
import { success, fail } from "../../utils/response.js";
import { normalizePhone, isValidIndonesianPhone } from "../../utils/phone.js";

export async function registerTrial(req, res) {
  try {
    const { phone, name } = req.body;

    if (!isValidIndonesianPhone(phone)) {
      return fail(res, "Nomor WhatsApp tidak valid", 400);
    }

    const normalizedPhone = normalizePhone(phone);
    const user = await createTrialUser(normalizedPhone, name);

    return success(res, "Trial aktif", user);
  } catch (error) {
    return fail(res, error.message, 500);
  }
}

export async function getUser(req, res) {
  try {
    const { phone } = req.params;
    const normalizedPhone = normalizePhone(phone);

    const user = await findUserByPhone(normalizedPhone);

    if (!user) {
      return fail(res, "User tidak ditemukan", 404);
    }

    return success(res, "User ditemukan", user);
  } catch (error) {
    return fail(res, error.message, 500);
  }
}