export function notFound(req, res) {
  return res.status(404).json({
    success: false,
    code: 404,
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan`
  });
}