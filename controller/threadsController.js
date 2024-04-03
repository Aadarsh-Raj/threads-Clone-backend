const ThreadModel = require("../model/threadsModel");
const UserModel = require("../model/userModel");

// post new threads
const createThreads = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    await UserModel.create({ ...req.body, userName: req.user._id });
    res.json({
      success: true,
      message: "Threads created",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Server crashed",
    });
  }
};



// get threads with threadId
const getThreadsWithId = async (req, res)=>{
try {
    const user = await UserModel.findById(req.user._id);
    if(!user){
        return res.json({
            success:false,
            message:"User not found"
        })
    }

    const threads = await ThreadModel.findById(req.params.threadsId);
    if(!threads){
        return res.json({
            success:false,
            message: "Post not found"
        })
    }

    res.json({
        success:true,
        message:"Post found",
        result: threads
    })
} catch (error) {
    res.json({
        success:false,
        message:"Server crashed"
    })
}
}


// get threads with userName
const getThreadsWithUserName = async(req, res) =>{
    try {
        const user = await UserModel.findById(req.user._id);
        if(!user){
            return res.json({
                success:false,
                message: "User not found"
            })
        }

        const threads = await ThreadModel.findOne({userName:user.userName});

        res.json({
            success:true,
            message:threads
        })
    } catch (error) {
        res.json({
            success:false,
            message:"Server crashed"
        })
    }
}

// update the threads
const updateThreads = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }
    const threads = await ThreadModel.findById(req.params.threadsId);
    if (!threads) {
      return res.json({
        success: false,
        message: "Post not found",
      });
    }
    if (user.userName !== threads.userName) {
      return res.json({
        success: false,
        message: "You are not authorized to change post",
      });
    }
    if (!req.body.description || !req.body.image || !req.body.gif) {
      return res.json({
        success: false,
        message: "Other fields cannot be change",
      });
    }
    const updateFields = {};
    if (req.body.description) {
      updateFields.description = req.body.description;
    }
    if (req.body.image) {
      updateFields.image = req.body.image;
    }
    if (req.body.gif) {
      updateFields.gif = req.body.gif;
    }

    await ThreadModel.findByIdAndUpdate(req.params.threadsId, updateFields);
    res.json({
      success: false,
      message: "Post updated",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Server crashed",
    });
  }
};

// delete the threads
const deleteThreads = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }
    const threads = await ThreadModel.findById(req.params.threadsId);
    if (!threads) {
      return res.json({
        success: false,
        message: "Post not found",
      });
    }
    if (user.userName !== threads.userName) {
      return res.json({
        success: false,
        message: "You are not authorized to change post",
      });
    }
    await ThreadModel.findByIdAndDelete(req.params.threadsId);
    res.json({
      success: false,
      message: "Post have been deleted",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Server crashed",
    });
  }
};

// reply to the threads
const repliesForThreads = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }
    const threads = await ThreadModel.findById(req.params.threadsId);
    if (!threads) {
      return res.json({
        success: false,
        message: "Post not found",
      });
    }

    if (!req.body.replies) {
      return res.json({
        success: false,
        message: "Other fields cannot be change",
      });
    }
    const reply = {};
    reply.description = req.body.replies.description;
    reply.image = req.body.replies.image;
    reply.gif = req.body.replies.git;
    reply.userName = user.userName;

    await ThreadModel.findByIdAndUpdate(req.params.threadsId, reply);
    res.json({
      success: true,
      message: "Reply sent successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Server crashed",
    });
  }
};
module.exports = {
  createThreads,
  getThreadsWithId,
  getThreadsWithUserName,
  updateThreads,
  deleteThreads,
  repliesForThreads,

};
