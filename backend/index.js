const express = require("express");
const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser")
const cors = require("cors");
const { initDb } = require("./model/db");
const {verifyAccessToken} = require("./middlewares/verifyToken")
const authRouter = require("./routes/auth");
const courseRouter = require("./routes/course");
const paymentRouter = require("./routes/payment");
const {webhookHandler} = require("./controllers/payment");
require("dotenv").config();

app.use(morgan(":method :url :status :res[content-length] - :response-time ms"));
const PORT = process.env.PORT;


app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(cookieParser());

app.post('/api/payments/stripe-webhook', 
    express.raw({ type: 'application/json' }), 
    webhookHandler
);

app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/courses", verifyAccessToken, courseRouter);
app.use("/api/payments", verifyAccessToken, paymentRouter);


app.listen(PORT, async () => {
  await initDb();
  console.log(`Server is listening to PORT:${PORT}`);
});