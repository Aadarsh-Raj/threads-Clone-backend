const express = require("express");
const userController = require("../controller/userController.js");
const { authMiddleware } = require("../middleware/auth.js");
const router = express.Router();

// register user -- done
router.post("/register", userController.registerUser);
// login user -- done
router.post("/login", userController.getUser);
// get my profile -- done
router.get("/myProfile", authMiddleware, userController.myProfile);
// search suggestions -done
router.post("/search", authMiddleware, userController.searchSuggestions)
// get other user with userName with details -> (userName, description,following, followers, profilePhoto, threads, replies, reposts, otherLinks) -- done
router.get("/search/:userName", authMiddleware, userController.getOtherUser);
// add userName to following (here we will push userName)
// push other's userName to own field following and push own userName to followers of other user -- done
router.post("/follow/:userName", authMiddleware, userController.followOther);
// remove userName from following (here we will pull userName) -- done
router.post(
  "/unfollow/:userName",
  authMiddleware,
  userController.unfollowOther
);
// get follwers list
router.get("/followers/:userName", authMiddleware, userController.getAllFollowers);

// get following list
router.get("/following/:userName", authMiddleware, userController.getAllFollowing)
// logout -- done
router.post("/logout", authMiddleware, userController.logout);
module.exports = router;

/*
register, login, logout --> done
followers, following  --> done


profile updation --> (fullName, profileDescription, profilePhoto, phoneNumber) --> done
privateAccount --> done 


threads/post management -->   post thread (description, image, gif, #, poll, replies, myId) -- done
replies management --> post thread (description, image, gif, #, poll, replies, myId) -->
reposts management --> if I posted then it will shown to my account (threads id, myId)

*/
