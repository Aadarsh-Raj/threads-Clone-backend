const mongoose = require("mongoose");

const repostsSchema = new mongoose.Schema({
    threadsId:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
    },
    userName:{
        type:mongoose.Schema.Types.ObjectId,
        require: true
    }
});


const RepostsModel = mongoose.model("reposts",repostsSchema);
module.exports = RepostsModel;