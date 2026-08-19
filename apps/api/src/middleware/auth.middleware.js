import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
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

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = payload;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token sudah kadaluarsa",
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
