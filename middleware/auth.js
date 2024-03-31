const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const UserModel = require("../model/userModel");
dotenv.config();

const authMiddleware = async (req, res, next) => {
  try {
    const tokenFromHeaders = req.headers.authorization;
    if(!tokenFromHeaders){
        return res.json({
            success: false,
            message:"Token missing"
        })
    }
    const data = jwt.verify(tokenFromHeaders, process.env.JWT_SECRET_KEY);
    if(!data || !data._id){
        return res.json({
            success: false,
            message: "Invalid Token"
        })

    }
    const user = await UserModel.findById(data._id);
    if(!user){
        return res.json({
            success: false,
            message: "User not found"
        })
    }
    req.user = user;
    next();
  } catch (error) {
    res.json({
      success: false,
      message: "Something went wrong",
    });
  }
};
module.exports = {
    authMiddleware
}