const ConfigModel = require("../models/Config.js");
const UserModel = require("../models/User.js");
const moment = require("moment");

let connections = [];
module.exports = {
  socket: (io) => {
    io.on("connection", async (socket) => {
      console.log(
        "\x1b[32m",
        "[ SOCKET ]",
        "\x1b[31m",
        moment().format("MM/DD/YYYY, HH:MM:SS"),
        "\x1b[33m",
        socket.handshake.address,
        "\x1b[0m",
        "connected"
      );

      var Config = await ConfigModel.find({});
      socket.emit("config", Config[0]);
      setInterval(async () => {
        var newConfig = await ConfigModel.find({});
        if (newConfig != Config) {
          Config = newConfig;
          socket.emit("config", Config[0]);
        }
      }, 2000);

      socket.on("login", async (user) => {
        if (typeof user == "string") {
          let data = {
            username: user,
          };
          data.socket = socket;
          connections.push(data);
          let User = await UserModel.findOne({ username: user });
          User.in = true;
          await User.save();
          console.log(
            "\x1b[32m",
            "[  AUTH  ]",
            "\x1b[31m",
            moment().format("MM/DD/YYYY, HH:MM:SS"),
            "\x1b[33m",
            socket.handshake.address,
            "\x1b[34m",
            user,
            "\x1b[0m",
            "signed in"
          );
          setInterval(async () => {
            var newUser = await UserModel.findOne({ username: user });
            if (newUser != User) {
              User = newUser;
              socket.emit("user", User);
            }
          }, 2000);
        } else {
          user.socket = socket;
          connections.push(user);
          var User = await UserModel.findOne({ username: user.username });
          User.in = true;
          await User.save();
          console.log(
            "\x1b[32m",
            "[  AUTH  ]",
            "\x1b[31m",
            moment().format("MM/DD/YYYY, HH:MM:SS"),
            "\x1b[33m",
            socket.handshake.address,
            "\x1b[34m",
            user.username,
            "\x1b[0m",
            "signed in"
          );
          setInterval(async () => {
            var newUser = await UserModel.findOne({ username: user.username });
            if (newUser != User) {
              User = newUser;
              socket.emit("user", User);
            }
          }, 2000);
        }
      });

      socket.on("logout", async (data) => {
        var index = connections.findIndex((connection) => {
          return connection._id == data._id;
        });
        connections.splice(index, 1);
        await UserModel.findByIdAndUpdate(data._id, { $set: { in: false } });
        console.log(
          "\x1b[32m",
          "[  AUTH  ]",
          "\x1b[31m",
          moment().format("MM/DD/YYYY, HH:MM:SS"),
          "\x1b[33m",
          socket.handshake.address,
          "\x1b[34m",
          data.username,
          "\x1b[0m",
          "signed out"
        );
        socket.emit("logout");
      });

      socket.on("list", async (query) => {
        var data = [];
        for (var i = 0; i < connections.length; i++) {
          data.push({
            username: connections[i].username,
            socket: connections[i].socket.id,
          });
        }
        socket.emit("list", data);
      });

      socket.on("disconnect", async () => {
        var index = await connections.findIndex((connection) => {
          return connection.socket.id == socket.id;
        });
        if (index > -1) {
          var data = connections[index];
          console.log(
            "\x1b[32m",
            "[  AUTH  ]",
            "\x1b[31m",
            moment().format("MM/DD/YYYY, HH:MM:SS"),
            "\x1b[34m",
            data.username,
            "\x1b[0m",
            "disconnected"
          );
          connections.splice(index, 1);
          var User = await UserModel.findOne({ username: data.username });
          User.in = false;
          await User.save();
        }

        console.log(
          "\x1b[32m",
          "[ SOCKET ]",
          "\x1b[31m",
          moment().format("MM/DD/YYYY, HH:MM:SS"),
          "\x1b[33m",
          socket.handshake.address,
          "\x1b[0m",
          "disconnected"
        );
      });

      socket.on("new_chatroom", () => {
        require("./wire.js")(io);
      });

      socket.on("kick", (user) => io.emit("kick", user));

      socket.on("transmit_begin", (data) => {
        var to_index = connections.findIndex((connection) => {
          return connection._id == data.to;
        });

        connections[to_index].socket.emit("transmit_received", data);
      });
    });
  },
  connections,
};
