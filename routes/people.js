const express = require("express");
const mongoose = require("mongoose");
const formidable = require("formidable");
const UserModel = require("../models/User");
const { getUserData } = require("../middleware/authentication");

const router = express.Router();

router.get("/", getUserData, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
