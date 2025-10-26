import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    req.flash('error_msg', 'Please login');
    return res.redirect('/login');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.locals.user = decoded;
    next();
  } catch (error) {
    req.flash('error_msg', 'Session ended, please login again.');
    res.clearCookie('token');
    return res.redirect('/login');
  }
};

export const optAuthMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.locals.user = decoded;
    } catch (error) {
      res.clearCookie('token');
    }
  }

  next();
};