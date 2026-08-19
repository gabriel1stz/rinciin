import jwt from "jsonwebtoken";

export function requireInternalAuth(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      code: "NO_TOKEN"
    });
  }

  try {
    const token = auth.replace("Bearer ", "");
    const payload = jwt.verify(token, process.env.JWT_INTERNAL_SECRET);

    if (!payload || !payload.id || !payload.role) {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid",
        code: "TOKEN_INVALID"
      });
    }

    req.internalUser = payload;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Sesi internal telah kadaluarsa. Silakan login ulang.",
        code: "TOKEN_EXPIRED"
      });
    }

    return res.status(401).json({
      success: false,
      message: "Token tidak valid",
      code: "TOKEN_INVALID"
    });
  }
}
