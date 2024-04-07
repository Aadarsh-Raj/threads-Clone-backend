const express = require("express");
const repostsController = require("../controller/repostsController.js");
const router = express.Router();

// create reposts

router.post("/create/:threadsId", repostsController.createReposts)
// get all reposts with userName
router.get("/", repostsController.getRepostsWithUserName)
// get reposts with id
router.get("/:repostsId",repostsController.getRepostsWithId)

// delete reposts
router.delete("/delete/:repostsId",)

module.exports = router;