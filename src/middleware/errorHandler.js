const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error
  let error = { ...err };
  error.message = err.message || "Server Error";

  // MySQL duplicate entry error
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(400).json({
      success: false,
      message: "Duplicate entry found",
    });
  }

  // MySQL foreign key constraint error
  if (err.code === "ER_ROW_IS_REFERENCED_2") {
    return res.status(400).json({
      success: false,
      message: "Cannot delete because it is referenced by other records",
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
