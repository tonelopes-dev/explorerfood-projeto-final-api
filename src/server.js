require("express-async-errors");
const express = require("express");
const errorHandler = require("./utils/errorHandler");
const uploadConfig = require("./configs/upload");
const routes = require("./routes");
const cookieParser = require("cookie-parser");

const corsOptions = {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", "https://explorerfood-projeto-final-web.vercel.app"],
  credentials: true, // Permitir cookies e autenticação de sessão
  // Adicione outras opções conforme necessário
};

const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors(corsOptions));

app.use(cookieParser());
const PORT = process.env.PORT || 3334;
app.use("/files", express.static(uploadConfig.UPLOADS_FOLDER));

app.use(routes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
