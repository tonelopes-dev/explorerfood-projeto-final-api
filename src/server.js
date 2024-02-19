require("express-async-errors");
const express = require("express");
const errorHandler = require("./utils/errorHandler");
const uploadConfig = require("./configs/upload");
const routes = require("./routes");
const cookieParser = require("cookie-parser");

const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173/"], credentials: true }));

app.use(cookieParser());
const PORT = process.env.PORT || 3333;
app.use("/files", express.static(uploadConfig.UPLOADS_FOLDER));

app.use(routes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
