const { verify } = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const authConfig = require("../configs/auth");

function ensureAuthenticated(req, res, next) {
  const authHeader = req.headers;

  if (!authHeader.cookie || !authHeader.cookie.includes("token=")) {
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

const { verify } = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const authConfig = require("../configs/auth");

function ensureAuthenticated(req, res, next) {
  const authHeader = req.headers.cookie;

  if (!authHeader || !authHeader.includes("token=")) {
    throw new AppError("JWT Token não informado", 401);
  }

  // Utiliza uma abordagem mais robusta para extrair o token.
  const tokenMatch = authHeader.match(/token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;

  if (!token) {
    throw new AppError("JWT Token não informado", 401);
  }

  try {
    const { role, sub: user_id } = verify(token, authConfig.jwt.secret);
    req.user = {
      id: Number(user_id),
      role,
    };
    return next();
  } catch (error) {
    // Log do erro pode ajudar a diagnosticar problemas.
    throw new AppError("JWT Token inválido", 401);
  }
}

module.exports = ensureAuthenticated;
