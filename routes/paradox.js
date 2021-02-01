const express = require("express");
const router = express.Router();

const NewsModel = require("../models/News.js");

// Get news articles
router.get("/get", (req, res) => {
  NewsModel.find({}, (error, data) => {
    var articles = [];

    data.forEach((article) => {
      articles.push(article);
    });

    res.json(articles);
  });
});

router.post("/add", (req, res) => {
  NewsModel.create(req.body, (error, data) => {
    if (error) {
      console.error(error);
      res.end();
    } else {
      console.log(
        "\x1b[32m",
        "[  NEWS  ]",
        "\x1b[31m",
        moment().format("MM/DD/YYYY, HH:MM:SS"),
        "\x1b[33m",
        req.connection.remoteAddress,
        "\x1b[0m",
        "new paradox story:",
        "\x1b[34m",
        req.body.title
      );
      res.json(data);
    }
  });
});

module.exports = router;
