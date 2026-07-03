// Email validation
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Password validation: min 8 chars, 1 uppercase, 1 lowercase, 1 number
export const isValidPassword = (password) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
};

// Name validation: 2-50 characters
export const isValidName = (name) => {
  return name && name.length >= 2 && name.length <= 50;
};

// Phone validation (basic)
export const isValidPhone = (phone) => {
  if (!phone) return true;
  return /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(phone);
};

// Check required fields
export const checkRequired = (fields, data) => {
  const missing = fields.filter((field) => !data[field]);
  if (missing.length > 0) {
    return {
      valid: false,
      message: `Missing required fields: ${missing.join(", ")}`,
    };
  }
  return { valid: true };
};
