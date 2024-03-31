const express = require("express");
const userController = require("../controller/userController.js");
const { authMiddleware } = require("../middleware/auth.js");
const router = express.Router();

// register user
router.post("/register", userController.registerUser);
// login user
router.get("/login", userController.getUser);
// get other user with userName with details -> (userName, description,following, followers, profilePhoto, threads, replies, reposts, otherLinks)
router.get("/search/:userName", authMiddleware, userController.getOtherUser);


// add userName to following (here we will push userName)
// push other's userName to own field following and push own userName to followers of other user
router.post("/follow/:userName",authMiddleware,userController.followOther)

// remove userName from following (here we will pull userName)
router.post("/unfollow/:userName", authMiddleware,userController.unfollowOther);
// logout
router.post("/logout", authMiddleware, userController.logout);

module.exports = router;
