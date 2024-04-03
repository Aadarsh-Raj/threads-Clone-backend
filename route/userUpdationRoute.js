const express = require("express");
const userUpdationController = require("../controller/userUpdationController.js");
const router = express.Router();

// private account updation
router.put("/privateAccount", userUpdationController.updatePrivateAccount);

// update only (fullName, profileDescription, profilePhoto, phoneNumber)

router.put("/profile", userUpdationController.updateProfile)

module.exports = router;

/* 
      

*/
