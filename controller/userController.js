const UserModel = require("../model/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const io = require("../socket/socket.js");
// const io = require("");
// register user
const registerUser = async (req, res) => {
  try {
    const email = req.body.email;
    const fullName = req.body.fullName;
    const userName = req.body.userName.toLowerCase();
    const password = req.body.password;
    const userNameExistOrNot = await UserModel.findOne({ userName: userName });
    if (userNameExistOrNot) {
      return res.json({
        success: false,
        message: "Try another User Name, user already exist",
      });
    }
    const user = await UserModel.findOne({ email: email });
    if (user) {
      return res.json({
        success: false,
        message: "User already exist",
      });
    }
    await UserModel.create({ ...req.body, userName: userName });
    res.json({
      success: true,
      message: "User Registered",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Something went wrong",
    });
  }
};
// login user
const getUser = async (req, res) => {
  try {
    const userId = req.body.userId;
    if (userId) {
      const user = await UserModel.findOne({
        $or: [
          { email: userId },
          { phoneNumber: userId },
          { userName: userId.toLowerCase() },
        ],
      });
      if (!user) {
        return res.json({
          success: false,
          message: "User not found",
        });
      }
      const isPasswordCorrect = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if(!isPasswordCorrect){
        return res.json({
          success: false,
          message: "UserName or password incorrect",
        });
      }
        // if token exist in db then first logout
        // if token does not exist then set token to db

        const expiryDateTime = Math.floor(new Date().getTime() / 1000) + 100000;
        const payload = {
          _id: user._id,
          fullName: user.fullName,
          exp: expiryDateTime,
        };
        let token;
        if (user.token) {
          // verify for token validation
         try {
          const data = jwt.verify(user.token, process.env.JWT_SECRET_KEY);
          if (data) {
            return res.json({
              success: false,
              message: "First log out please",
            });
          }
         } catch (error) {
           token = jwt.sign(payload, process.env.JWT_SECRET_KEY);
          
         }
        }
        await UserModel.findByIdAndUpdate(user._id, { token: token });
        res.json({
          success: true,
          message: "User found",
          token: token,
        });
    } else {
      res.json({
        success: false,
        message: "Invalid inputs",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// get other user with userName with details -> (userName, description,following, followers, profilePhoto, threads, replies, reposts, otherLinks)
const getOtherUser = async (req, res) => {
  const user = await UserModel.findOne({ userName: req.params.userName });
  if (!user) {
    return res.json({
      success: false,
      message: "User not found",
    });
  }
  const result = {
    userName: user.userName,
    fullName: user.fullName,
    profileDescription: user.profileDescription,
    followers: user.followers,
    following: user.following,
    threads: user.threads,
    replies: user.replies,
    reposts: user.reposts,
    otherLinks: user.otherLinks,
    profileImage: user.profileImage,
  };
  res.json({
    success: true,
    message: "User found",
    result: result,
  });
};

// add userName to following (here we will push userName)
// push other's userName to own field following and push own userName to followers of other user
const followOther = async (req, res) => {
  try {
    const selfUser = await UserModel.findById(req.user._id);
    const otherUser = await UserModel.findOne({
      userName: req.params.userName,
    });
    if (!selfUser || !otherUser) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (
      selfUser.following.includes(req.params.userName) ||
      otherUser.followers.includes(selfUser.userName)
    ) {
      return res.json({
        success: false,
        message: "You already have followed",
      });
    }
    await Promise.all([
      await UserModel.findByIdAndUpdate(req.user._id, {
        $push: { following: req.params.userName },
      }),
      await UserModel.findOneAndUpdate(
        { userName: req.params.userName },
        { $push: { followers: selfUser.userName } }
      ),
    ]);
    const getSocket = io.getSocket();
    getSocket.emit("follow", {
      followers: selfUser.userName,
      following: otherUser.userName,
    });

    res.json({
      success: true,
      message: `You have followed ${otherUser.userName}`,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Something went wrong",
    });
  }
};


// unfollow other

const unfollowOther = async (req, res)=>{
  try {
    // verify users
    const selfUser = await UserModel.findById(req.user._id);
    const otherUser = await UserModel.findOne({
      userName: req.params.userName,
    });
    if (!selfUser || !otherUser) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }
    // verify following
    if (
      !selfUser.following.includes(req.params.userName) ||
      !otherUser.followers.includes(selfUser.userName)
    ) {
      return res.json({
        success: false,
        message: "You have not followed the user",
      });
    }

    // 
    await Promise.all([
      await UserModel.findByIdAndUpdate(req.user._id, {
        $pull: { following: req.params.userName },
      }),
      await UserModel.findOneAndUpdate(
        { userName: req.params.userName },
        { $pull: { followers: selfUser.userName } }
      ),
    ]);
    const getSocket = io.getSocket();
    getSocket.emit("follow", {
      followers: selfUser.userName,
      following: otherUser.userName,
    });

    res.json({
      success: true,
      message: `You have unfollowed ${otherUser.userName}`,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Something went wrong",
    });
  }
}

// logout

const logout = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.token) {
      return res.json({
        success: false,
        message: "User already loggeed out",
      });
    }
    await UserModel.findByIdAndUpdate(req.user._id, { token: null });
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  registerUser,
  getUser,
  logout,
  getOtherUser,
  followOther,
  unfollowOther
};
