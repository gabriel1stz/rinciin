export function errorHandler(err, req, res, next) {

    console.error(err);

    return res.status(err.status || 500).json({
        success: false,
        code: err.status || 500,
        message: err.message || "Internal Server Error"
    });

}