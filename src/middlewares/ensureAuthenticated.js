const { verify } = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const authConfig = require("../configs/auth");

function ensureAuthenticated(req, res, next) {
  const authHeader = req.headers;

  // Verifica se o cookie está presente e contém o token
  if (!authHeader.cookie || !authHeader.cookie.includes("token=")) {
    throw new AppError("JWT Token não informado", 401);
  }

  // Extrai o token do cookie
  const token = authHeader.cookie.split("token=")[1].split(";")[0]; // Ajuste para extrair corretamente o token

  try {
    // Verifica o token
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
