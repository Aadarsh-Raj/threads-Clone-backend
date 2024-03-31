const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const userRouter = require("./route/userRoute.js");
const {initSocket} =require("./socket/socket.js");
const dotenv = require("dotenv");
const multer = require("multer");
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
// io.on("connection",(socket)=>{
//     console.log(socket);
//     console.log("A user connected");
//     socket.on("disconnect", ()=>{
//         console.log("User disconnected");
//     })
// })
// user api
server.use("/api/user", userRouter);





server.listen(process.env.PORT, ()=>{
    console.log(`Server is running at http://localhost:${process.env.PORT}`);
})