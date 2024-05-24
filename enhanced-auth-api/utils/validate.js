const { check, validationResult } = require('express-validator');

// Validation rules for user registration
exports.validateRegister = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
];

// Validation rules for user login
exports.validateLogin = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
];

// Validation rules for profile update
exports.validateUpdateProfile = [
  check('name', 'Name is required').optional().not().isEmpty(),
  check('email', 'Please include a valid email').optional().isEmail(),
  check('password', 'Password must be at least 6 characters').optional().isLength({ min: 6 }),
  check('phone', 'Please include a valid phone number').optional().isMobilePhone(),
  check('bio', 'Bio must be less than 200 characters').optional().isLength({ max: 200 }),
  check('isPublic', 'isPublic must be a boolean').optional().isBoolean(),
];

// Middleware to check for validation errors
exports.checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
