const { validationResult } = require("express-validator");

const validateMiddleware = (req, res, next) => {
  const errors = validationResult(req).array({ onlyFirstError: true });
  if (errors.length) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  return next();
};

module.exports = validateMiddleware;
