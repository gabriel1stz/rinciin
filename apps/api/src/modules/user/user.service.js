import * as repository from "./repositories/user.repository.js";
import { normalizePhoneNumber } from "../../helpers/phone.helper.js";

export async function findByPhone(phone) {
  return repository.findByPhone(normalizePhoneNumber(phone));
}

export async function findUserByPhone(phone) {
  return repository.findByPhone(normalizePhoneNumber(phone));
}

export async function createTrialUser(phone, name = "") {
  const cleanPhone = normalizePhoneNumber(phone);
  return repository.createUser({
    phone: cleanPhone,
    name,
    tier: "free",
    wallets: {
      create: [{ name: "Cash", type: "cash", balance: 0, isDefault: true }]
    }
  });
}

export async function updateProfile(userId, data) {
  return repository.updateUser(userId, data);
}

export async function getOrCreateUser(phone, name = "") {
  const cleanPhone = normalizePhoneNumber(phone);
  let user = await repository.findByPhone(cleanPhone);

  if (user) {
    return user;
  }

  return createTrialUser(cleanPhone, name);
}

