const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const userRouter = require("./route/userRoute.js");
const userUpdationRoute = require("./route/userUpdationRoute.js");
const reposts = require("./route/repostRoute.js")
const {initSocket} =require("./socket/socket.js");
const dotenv = require("dotenv");
const multer = require("multer");
const { authMiddleware } = require("./middleware/auth.js");
const server = express();
// getting access for secret keys through dotenv
const httpServer = http.createServer(server);
const io = initSocket(httpServer);
dotenv.config();
// connecting to mongodb
mongoose.connect(process.env.MONGODB_URI).then(()=>{
    console.log("Database connected");
}).catch((e)=>{
    console.log(e);
});
// parsing requested data to json format for express server
server.use(express.json());

// user api
server.use("/api/user", userRouter);

// user profile updation
server.use("/api/userUpdation", authMiddleware, userUpdationRoute);

// for threads
server.use("/api/threads",authMiddleware,threadsRoute)

// for reposts
server.use("/api/reposts", authMiddleware, )

server.listen(process.env.PORT, ()=>{
    console.log(`Server is running at http://localhost:${process.env.PORT}`);
})