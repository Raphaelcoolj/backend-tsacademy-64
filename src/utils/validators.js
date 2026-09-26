const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

function validateRegisterInput(body = {}) {
  const errors = [];

  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (body.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  }

  if (!body.email || typeof body.email !== 'string' || !body.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!EMAIL_REGEX.test(body.email.trim())) {
    errors.push({ field: 'email', message: 'Email must be a valid email address' });
  }

  if (!body.password || typeof body.password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (body.password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  } else if (body.password.length > 72) {
    errors.push({ field: 'password', message: 'Password must be at most 72 characters' });
  }

  if (body.role !== undefined && body.role !== null && body.role !== '') {
    if (typeof body.role !== 'string' || !['employee', 'manager'].includes(body.role)) {
      errors.push({ field: 'role', message: 'Role must be either employee or manager' });
    }
  }

  return errors;
}

function validateLoginInput(body = {}) {
  const errors = [];

  if (!body.email || typeof body.email !== 'string' || !body.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!EMAIL_REGEX.test(body.email.trim())) {
    errors.push({ field: 'email', message: 'Email must be a valid email address' });
  }

  if (!body.password || typeof body.password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return errors;
}

module.exports = { validateRegisterInput, validateLoginInput, EMAIL_REGEX };
