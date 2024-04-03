const express = require("express");
const threadsController = require("../controller/threadsController.js");
const router = express.Router();


// create thread

router.post("/create", threadsController.createThreads);


// get threads with id
router.get("/:threadId", threadsController.getThreadsWithId)
// update thread
router.put("/update/:threadsId",threadsController.updateThreads);


// delete thread
router.delete("/delete/threadsId", threadsController.deleteThreads);
// replies for thread

router.post("/replies/:threadsId", threadsController.repliesForThreads);


module.exports = router;