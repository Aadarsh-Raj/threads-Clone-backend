const mongoose = require("mongoose");

const repliesSchema = new mongoose.Schema({
    description:{
        type:String,
        require: true,
    },
    image:{
        data:Buffer,
        contentType:String
    },
    gif:{
        data: Buffer,
        contentType:String
    },
    replies:{
        type:[repliesSchema],
        require:false,
    },
    userName:{
        type:String,
        requier:true,
        ref:"users"
    }
},{timestamps:true})


const threadsSchema = new mongoose.Schema({
    description:{
        type:String,
        require: true,
    },
    image:{
        data:Buffer,
        contentType:String,
        require:false
    },
    gif:{
        data: Buffer,
        contentType:String,
        require: false
    },
    replies:{
        type:[repliesSchema],
        require:false,
    },
    userName:{
        type:String,
        requier:true,
        ref:"users"
    }
},{timestamps:true});


const ThreadModel = mongoose.model("threads",threadsSchema);

module.exports = ThreadModel;