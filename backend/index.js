const express = require("express");
const app = express();
const { initDb } = require("./model/db");
const authRouter = require("./routes/auth");
require("dotenv").config();
const PORT = process.env.PORT;

app.use(express.json());
app.use("/auth", authRouter);

app.listen(PORT, async () => {
  await initDb();
  console.log(`Server is listening to PORT:${PORT}`);
});