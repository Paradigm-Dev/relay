const UserModel = require("../models/User.js");
const connections = require("./index.js").connections;

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("call-user", (data) => {
      console.log("got call-user");
      const connection = connections.find((item) => item._id == data.to);
      socket.to(connection.socket.id).emit("call-made", {
        offer: data.offer,
        socket: socket.id,
      });
    });

    socket.on("make-answer", (data) => {
      console.log("got make-answer");
      socket.to(data.to).emit("answer-made", {
        socket: socket.id,
        answer: data.answer,
      });
    });

    socket.on("ice", (data) => {
      console.log("got ice");
      socket.to(data.to).emit("ice", {
        socket: socket.id,
        candidate: data.candidate,
      });
    });

    socket.on("end-call", (data) => {
      console.log("got end-call");
      socket.to(data.to).emit("end-call");
    });
  });
};
