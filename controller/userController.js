const UserModel = require("../model/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const io = require("../socket/socket.js");
// register user
const registerUser = async (req, res) => {
  try {
    const email = req.body.email;
    const fullName = req.body.fullName;
    const userName = req.body.userName.toLowerCase();
    const password = req.body.password;
    const userNameExistOrNot = await UserModel.findOne({ userName: userName });
    if (userNameExistOrNot) {
      return res.status(400).json({
        success: false,
        message: "Try another User Name, user already exist",
      });
    }
    const user = await UserModel.findOne({ email: email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exist",
      });
    }
    await UserModel.create({ ...req.body, userName: userName });
    res.status(200).json({
      success: true,
      message: "User Registered",
    });
  } catch (error) {
    res.status(500).json({
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
        return res.status(400).json({
          success: false,
          message: "User not found",
        });
      }
      const isPasswordCorrect = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!isPasswordCorrect) {
        return res.status(400).json({
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
            return res.status(400).json({
              success: false,
              message: "First log out please",
            });
          }
        } catch (error) {
          token = jwt.sign(payload, process.env.JWT_SECRET_KEY);
        }
      } else {
        token = jwt.sign(payload, process.env.JWT_SECRET_KEY);
      }

      await UserModel.findByIdAndUpdate(user._id, {
        $set: { token: token },
      });

      res.status(200).json({
        success: true,
        message: "User found",
        userName: user.userName,
        token: token,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid inputs",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// get my profile
const myProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const userProfile = {
      fullName: user.fullName,
      userName: user.userName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profileDescription: user.profileDescription,
      followers: user.followers,
      following: user.following,
      threads: user.threads,
      replies: user.replies,
      reposts: user.reposts,
      otherLinks: user.otherLinks,
      privateAccount: user.privateAccount,
      profileImage: user.profileImage,
    };
    res.status(200).json({
      success: true,
      message: "User Profile",
      result: userProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server down",
    });
  }
};
// search suggestions

const searchSuggestions = async (req, res) => {
  if (!req.body.keyword) {
    return res.status(200).json({
      success: true,
      message: "Result found",
      result: [],
    });
  }
  const keyword = req.body.keyword;
  try {
    const myUser = await UserModel.findById(req.user._id);
    if (!myUser) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    const relatedKeywords = await UserModel.find({
      $or: [
        { userName: { $regex: keyword, $options: "i" } },
        { fullName: { $regex: keyword, $options: "i" } },
        // Add more fields here as needed
      ],
    });
    const result = relatedKeywords.map((ele) => {
      const user = {};
      if (ele.followers.includes(myUser.userName)) {
        user.following = true;
      } else {
        user.following = false;
      }
      user.fullName = ele.fullName;
      user.userName = ele.userName;
      user.followers = ele.followers;
      user.profileImage = ele.profileImage;
      return user;
    });
    res.status(200).json({
      success: true,
      message: "Result found",
      result: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// get other user with userName with details -> (userName, description,following, followers, profilePhoto, threads, replies, reposts, otherLinks)
const getOtherUser = async (req, res) => {
  try {
    const user = await UserModel.findOne({ userName: req.params.userName });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    let result = {};
    if (user.privateAccount) {
      result = {
        userName: user.userName,
        fullName: user.fullName,
        profileDescription: user.profileDescription,
        followers: user.followers,
        following: user.following,
        otherLinks: user.otherLinks,
        profileImage: user.profileImage,
        privateAccount:true
      };
    } else {
      result = {
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
    }
    res.status(200).json({
      success: true,
      message: "User found",
      result: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server down",
    });
  }
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
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      selfUser.following.includes(req.params.userName) ||
      otherUser.followers.includes(selfUser.userName)
    ) {
      return res.status(400).json({
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

    res.status(200).json({
      success: true,
      message: `You have followed ${otherUser.userName}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// unfollow other

const unfollowOther = async (req, res) => {
  try {
    // verify users
    const selfUser = await UserModel.findById(req.user._id);
    const otherUser = await UserModel.findOne({
      userName: req.params.userName,
    });
    if (!selfUser || !otherUser) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    // verify following
    if (
      !selfUser.following.includes(req.params.userName) ||
      !otherUser.followers.includes(selfUser.userName)
    ) {
      return res.status(400).json({
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

    res.status(200).json({
      success: true,
      message: `You have unfollowed ${otherUser.userName}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
// get followers list
const getAllFollowers = async (req, res)=>{
try {
  const user = await UserModel.findOne({
    userName: req.params.userName,
  });

if(!user){
  return res.status(400).json({
    success: false,
    message: "User not found"
  })
}

const result = user.followers;

res.status(200).json({
  success: true,
  message: "Result Found",
  result: result
})
} catch (error) {
  res.status(500).json({
    success: false,
    message: "Server down"
  })
}
}

// get following list
const getAllFollowing = async (req, res) =>{
  try {
    const user = await UserModel.findOne({
      userName: req.params.userName,
    });
  
  if(!user){
    return res.status(400).json({
      success: false,
      message: "User not found"
    })
  }
  
  const result = user.following;

res.status(200).json({
  success: true,
  message: "Result Found",
  result: result
})
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server down"
    })
  }
}

// logout

const logout = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.token) {
      res.status(400).json({
        success: false,
        message: "User already loggeed out",
      });
    }
    await UserModel.findByIdAndUpdate(req.user._id, { token: null });
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
module.exports = {
  registerUser,
  getUser,
  myProfile,
  searchSuggestions,
  logout,
  getOtherUser,
  followOther,
  unfollowOther,
  getAllFollowers,
  getAllFollowing
};
