export function success(res, message = "OK", data = null, code = 200) {
  return res.status(code).json({
    success: true,
    code,
    message,
    data
  });
}

export function fail(res, message = "Error", code = 400, errors = null) {
  return res.status(code).json({
    success: false,
    code,
    message,
    errors
  });
}