const UserModel = require("../models/User");

module.exports = async (io) => {
  const allUsers = await UserModel.find({});

  for (let user of allUsers) {
    let current;
    let current_path = "/";
    io.of(`/drawer/${user._id}`).on("connection", async (socket) => {
      socket.emit("current", current, current_path);
      socket.on("init", (files) => {
        current = files;
        socket.broadcast.emit("files", files);
      });
    });
  }
};
