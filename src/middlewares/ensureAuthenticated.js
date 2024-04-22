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
  let token;
  try {
    token = authHeader.cookie.split("token=")[1].split(";")[0];
  } catch (error) {
    throw new AppError("Erro na extração do token do cookie", 400);
  }

  if (!token) {
    throw new AppError("JWT Token não informado", 401);
  }

  try {
    // Verifica o token
    const decodedToken = verify(token, authConfig.jwt.secret);
    req.user = {
      id: Number(decodedToken.sub),
      role: decodedToken.role,
    };
    next();
  } catch (error) {
    throw new AppError("JWT Token inválido", 401);
  }
}

module.exports = ensureAuthenticated;
