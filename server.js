const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const userRouter = require("./route/userRoute.js");
const bodyParser = require("body-parser");
const userUpdationRoute = require("./route/userUpdationRoute.js");
// const threadsRoute = require("./route/threadsRoute.js");
const repostsRouter = require("./route/repostRoute.js");
const { initSocket } = require("./socket/socket.js");
const dotenv = require("dotenv");
const multer = require("multer");
const { authMiddleware } = require("./middleware/auth.js");
const server = express();
// getting access for secret keys through dotenv
const httpServer = http.createServer(server);
const io = initSocket(httpServer);
dotenv.config();
// connecting to mongodb
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Database connected");
  })
  .catch((e) => {
    console.log(e);
  });

server.use(cors({ origin: "*" }));

// parsing requested data to json format for express server
server.use(express.json());

// server.use(bodyParser.json());
server.use(express.urlencoded({ extended: true }));
// user api
server.use("/api/user", userRouter);

// user profile updation
server.use("/api/userUpdation", authMiddleware, userUpdationRoute);

// for threads
// server.use("/api/threads",authMiddleware,threadsRoute);

// for reposts
server.use("/api/reposts", authMiddleware, repostsRouter);

server.listen(process.env.PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
});
