const socketIo = require("socket.io");
const { init } = require("../model/userModel");
let io;

const initSocket = (server)=>{
    io = socketIo(server);
}
const getSocket = ()=>{
    if(!io){
        throw new Error("Socket.io is not initialized");
    }
    return io;
}

module.exports = {initSocket, getSocket};