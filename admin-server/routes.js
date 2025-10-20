const path = require('node:path');
const express = require("express");
const router = express.Router();

// Define routes
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "./views/index.html"));
});
router.get("/map", (req, res) => {
    res.sendFile(path.join(__dirname, "./views/map.html"));
});
module.exports = router;
