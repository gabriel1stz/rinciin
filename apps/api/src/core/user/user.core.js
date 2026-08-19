import { Tier } from "../../config/constants/tier.js";
import { defaultWallets } from "../wallet/wallet.core.js";

export function getTrialEndDate(days = 7) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export function buildTrialUserData(phone, name = null) {
  return {
    phone,
    name,
    tier: Tier.TRIAL,
    trialEnd: getTrialEndDate(7),
    wallets: {
      create: defaultWallets
    }
  };
}