const shell = require("shelljs");
const fs = require("fs");
const moment = require("moment");
const ConfigModel = require("./../models/Config.js");
const UserModel = require("./../models/User.js");

module.exports = (io) => {
  var terminal = io.of("/terminal").on("connection", async (socket) => {
    // var log = fs.readFileSync(__dirname + '/../relay.log')
    // socket.emit('log', log)

    socket.on("config", async (data) => {
      var newConfig = await ConfigModel.findOne({ find: "this" });
      await newConfig.overwrite(data.config);
      await newConfig.save();
    });

    socket.on("ban", async (data) => {
      var User = await UserModel.findOne({ username: data.username });
      User.banned = data.value;
      await User.save();
      console.log(
        "\x1b[32m",
        "[  TERM  ]",
        "\x1b[31m",
        moment().format("MM/DD/YYYY, HH:MM:SS"),
        "\x1b[34m",
        // data.username,
        "\x1b[0m",
        data.value ? "banned" : "unbanned",
        "\x1b[34m",
        User.username
      );
    });

    socket.on("rights.admin", async (data) => {
      var User = await UserModel.findOne({ username: data.username });
      User.rights.admin = data.value;
      await User.save();
      console.log(
        "\x1b[32m",
        "[  TERM  ]",
        "\x1b[31m",
        moment().format("MM/DD/YYYY, HH:MM:SS"),
        "\x1b[34m",
        // data.username,
        "\x1b[0m",
        "gave admin rights to",
        "\x1b[34m",
        User.username
      );
    });

    socket.on("rights.author", async (data) => {
      var User = await UserModel.findOne({ username: data.username });
      User.rights.author = data.value;
      await User.save();
      console.log(
        "\x1b[32m",
        "[  TERM  ]",
        "\x1b[31m",
        moment().format("MM/DD/YYYY, HH:MM:SS"),
        "\x1b[34m",
        // data.username,
        "\x1b[0m",
        "gave author rights to",
        "\x1b[34m",
        User.username
      );
    });

    socket.on("rights.asteroid", async (data) => {
      var User = await UserModel.findOne({ username: data.username });
      User.rights.asteroid = data.value;
      await User.save();
      console.log(
        "\x1b[32m",
        "[  TERM  ]",
        "\x1b[31m",
        moment().format("MM/DD/YYYY, HH:MM:SS"),
        "\x1b[34m",
        // data.username,
        "\x1b[0m",
        "gave asteroid rights to",
        "\x1b[34m",
        User.username
      );
    });

    socket.on("kick", async (username) => {
      io.emit("kick", username);
      console.log(
        "\x1b[32m",
        "[  TERM  ]",
        "\x1b[31m",
        moment().format("MM/DD/YYYY, HH:MM:SS"),
        "\x1b[34m",
        // data.username,
        "\x1b[0m",
        "kicked",
        "\x1b[34m",
        username
      );
    });

    socket.on("kill", async (username) => {
      io.emit("kill", username);
    });

    socket.on("mrocks", async (data) => {
      var User = await UserModel.findOne({ username: data.username });
      User.moonrocks += data.value;
      User.save();
      console.log(
        "\x1b[32m",
        "[  TERM  ]",
        "\x1b[31m",
        moment().format("MM/DD/YYYY, HH:MM:SS"),
        "\x1b[34m",
        // data.username,
        "\x1b[0m",
        "gave",
        "\x1b[34m",
        data.value,
        "\x1b[0m",
        "moonrocks to",
        "\x1b[34m",
        User.username
      );
    });

    socket.on("nuke", async () => {
      await io.emit("nuke");
      shell.exec("sudo shutdown -h now");
      console.log(
        "\x1b[32m",
        "[  TERM  ]",
        "\x1b[31m",
        moment().format("MM/DD/YYYY, HH:MM:SS"),
        "\x1b[34m",
        // data.username,
        "\x1b[0m",
        "nuked the server"
      );
    });

    socket.on("ip", async (ip) => {
      var Config = await ConfigModel.findOne({ find: "this" });
      Config.banned.push(ip);
      await Config.save();
      console.log(
        "\x1b[32m",
        "[  TERM  ]",
        "\x1b[31m",
        moment().format("MM/DD/YYYY, HH:MM:SS"),
        "\x1b[34m",
        // data.username,
        "\x1b[0m",
        "banned",
        "\x1b[34m",
        ip
      );
    });
  });
};
