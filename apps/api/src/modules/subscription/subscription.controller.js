import { success, fail } from "../../utils/response.js";
import { getSubscriptionByPhone, activateSubscriptionByPhone } from "./subscription.service.js";

export async function getSubscription(req, res) {
  try {
    const subscription = await getSubscriptionByPhone(req.params.phone);
    return success(res, "Subscription ditemukan", subscription);
  } catch (err) {
    return fail(res, err.message, err.status || 500);
  }
}

export async function activateSubscription(req, res) {
  try {
    const subscription = await activateSubscriptionByPhone(
      req.body.phone,
      req.body.plan
    );

    return success(res, "Subscription berhasil diaktifkan", subscription);
  } catch (err) {
    return fail(res, err.message, err.status || 500);
  }
}