const { verify } = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const authConfig = require("../configs/auth");

function ensureAuthenticated(req, res, next) {
  const authHeader = req.headers.cookie;

  if (!authHeader) {
    throw new AppError("JWT Token não informado", 401);
  }

  const [_, token] = authHeader.split("token=");

  try {
    const { role, sub: user_id } = verify(token, authConfig.jwt.secret);
    req.user = {
      id: Number(user_id),
      role,
    };
    return next();
  } catch {
    throw new AppError("JWT Token inválido", 401);
  }
}

module.exports = ensureAuthenticated;
