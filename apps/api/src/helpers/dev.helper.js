export function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

export function isDevOtpEnabled() {
  if (process.env.NODE_ENV === "production") return false;
  return isDevelopment() || process.env.ENABLE_DEV_OTP === "true";
}

export function buildDevOtpResponse(otp) {
  return {
    development: {
      otp,
      expiresIn: 300,
    },
  };
}
