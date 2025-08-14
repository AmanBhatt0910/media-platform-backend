require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const helmet = require("helmet");
const redis = require("./config/redis");

const authRoutes = require("./routes/authRoutes");
const mediaRoutes = require("./routes/mediaRoutes");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.set("trust proxy", 1); // if you run behind proxy/load balancer
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/media", mediaRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
