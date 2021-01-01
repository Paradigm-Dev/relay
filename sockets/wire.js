const ChatroomModel = require("../models/Chatroom.js");
const DMModel = require("../models/DM.js");
const UserModel = require("../models/User.js");
const mongoose = require("mongoose");
const fs = require("fs");
const webpush = require("web-push");
const moment = require("moment");

module.exports = (io) => {
  ChatroomModel.find({}, (error, data) => {
    if (error) console.error(error);
    else {
      data.forEach((chatroom) => {
        let typers = [];
        var namespace = io
          .of(`/wire/${chatroom.id}`)
          .on("connection", async (socket) => {
            var chatroom_id = chatroom.id;
            var Chatroomed = await ChatroomModel.findOne({ id: chatroom_id });
            socket.emit("data", Chatroomed);
            socket.on("send", async (data) => {
              var data = data;
              var Chatroom = await ChatroomModel.findOne({ id: chatroom_id });
              data._id = mongoose.Types.ObjectId();
              await Chatroom.messages.push(data);
              await Chatroom.save();
              namespace.emit("send", data);
              console.log(
                "\x1b[32m",
                "[  CHAT  ]",
                "\x1b[31m",
                moment().format("MM/DD/YYYY, HH:MM:SS"),
                "\x1b[34m",
                data.username,
                "\x1b[0m",
                "sent",
                "\x1b[34m",
                `"${data.content}"`,
                "\x1b[0m",
                "in",
                "\x1b[34m",
                `${chatroom.name} (${chatroom.id})`
              );
            });
            socket.on("delete", async (id) => {
              var Chatroom = await ChatroomModel.findOne({ id: chatroom_id });
              var Message = await Chatroom.messages.id(id);
              if (Message.type == "file")
                await fs.unlinkSync(
                  __dirname +
                    `/../files/wire/chatroom/${Chatroom.id}/${Message.content}`
                );
              await Message.remove();
              await Chatroom.save();
              namespace.emit("delete", id);
              console.log(
                "\x1b[32m",
                "[  CHAT  ]",
                "\x1b[31m",
                moment().format("MM/DD/YYYY, HH:MM:SS"),
                "\x1b[34m",
                Message.username,
                "\x1b[0m",
                "deleted",
                "\x1b[34m",
                `"${Message.content}"`,
                "\x1b[0m",
                "in",
                "\x1b[34m",
                `${chatroom.name} (${chatroom.id})`
              );
            });
            socket.on("kill", () => {
              namespace.emit("kill");
            });
            socket.on("people", async (id) => {
              var Chatroom = await ChatroomModel.findOne({ id: id });
              namespace.emit("people", Chatroom.people);
            });
            socket.on("edit", async (data) => {
              var Chatroom = await ChatroomModel.findOne({ id: chatroom_id });
              var MessageIndex = Chatroom.messages.findIndex((message) => {
                return message._id == data._id;
              });
              var Message = await Chatroom.messages.id(data._id);
              var oldID = Message._id;
              var Data = {
                _id: mongoose.Types.ObjectId(),
                color: data.color,
                username: data.username,
                user_id: data.user_id,
                content: data.content,
                timestamp: data.timestamp,
                edits: data.edits + 1,
                type: data.type,
              };
              Chatroom.messages[MessageIndex] = Data;
              await Chatroom.save();
              Data.oldID = oldID;
              namespace.emit("edit", Data);
              console.log(
                "\x1b[32m",
                "[  CHAT  ]",
                "\x1b[31m",
                moment().format("MM/DD/YYYY, HH:MM:SS"),
                "\x1b[34m",
                data.username,
                "\x1b[0m",
                "edited",
                "\x1b[34m",
                `"${Message.content}"`,
                "\x1b[0m",
                "to",
                "\x1b[34m",
                `"${data.content}"`,
                "\x1b[0m",
                "in",
                "\x1b[34m",
                `${chatroom.name} (${chatroom.id})`
              );
            });
            socket.on("typing", async (data) => {
              let exists = false;
              typers.forEach((typer) => {
                if (typer.user == data.user) exists = true;
              });
              if (exists && data.is === false) {
                const index = typers.findIndex((typer) => {
                  return typer == data.user;
                });
                typers.splice(index, 1);
              } else if (!exists && data.is === true) {
                typers.splice(typers.length, 0, data);
              }
              namespace.emit("typing", typers);
            });
            socket.on("purge", () => {
              namespace.emit("purge");
              // console.log(
              //   "\x1b[32m",
              //   "[  CHAT  ]",
              //   "\x1b[31m",
              //   moment().format("MM/DD/YYYY, HH:MM:SS"),
              //   "\x1b[34m",
              //   data.username,
              //   "\x1b[0m",
              //   "purged all messages in",
              //   "\x1b[34m",
              //   `${chatroom.name} (${chatroom.id})`
              // );
            });
          });
      });
    }
  });

  DMModel.find({}, (error, data) => {
    if (error) console.error(error);
    else {
      data.forEach((dm) => {
        let typers = [];
        var namespace = io
          .of(`/wire/${dm._id}`)
          .on("connection", async (socket) => {
            var DMed = await DMModel.findOne({ _id: dm._id });
            socket.emit("data", DMed);
            socket.on("send", async (data) => {
              var data = data;
              var dm_send = await DMModel.findOne({ _id: dm._id });
              data._id = mongoose.Types.ObjectId();
              await dm_send.messages.push(data);
              await dm_send.save();
              namespace.emit("send", data);

              const sender_index = dm_send.people.findIndex(
                (person) => person._id == data.user_id
              );
              const recipient = await UserModel.findOne({
                _id:
                  sender_index == 0
                    ? dm_send.people[1]._id
                    : dm_send.people[0]._id,
              });
              const payload = JSON.stringify({
                title: `DM from ${dm_send.people[sender_index].username}`,
                body: data.content,
              });
              recipient.notifications.forEach((subscription) => {
                webpush
                  .sendNotification(subscription, payload)
                  .catch((err) => console.error(err));
              });
              console.log(
                "\x1b[32m",
                "[  CHAT  ]",
                "\x1b[31m",
                moment().format("MM/DD/YYYY, HH:MM:SS"),
                "\x1b[34m",
                data.username,
                "\x1b[0m",
                "sent",
                "\x1b[34m",
                `"${data.content}"`,
                "\x1b[0m",
                "to",
                "\x1b[34m",
                recipient.username
              );
            });
            socket.on("delete", async (id) => {
              var dm_delete = await DMModel.findOne({ _id: dm._id });
              var Message = await dm_delete.messages.id(id);
              if (Message.type == "file")
                await fs.unlinkSync(
                  __dirname + `/../files/wire/dm/${dm._id}/${Message.content}`
                );
              await Message.remove();
              await dm_delete.save();
              namespace.emit("delete", id);

              const sender_index = dm_delete.people.findIndex(
                (person) => person._id == data.user_id
              );
              const recipient = await UserModel.findOne({
                _id:
                  sender_index == 0
                    ? dm_delete.people[1]._id
                    : dm_delete.people[0]._id,
              });
              console.log(
                "\x1b[32m",
                "[  CHAT  ]",
                "\x1b[31m",
                moment().format("MM/DD/YYYY, HH:MM:SS"),
                "\x1b[34m",
                Message.username,
                "\x1b[0m",
                "deleted",
                "\x1b[34m",
                `"${Message.content}"`,
                "\x1b[0m",
                "from",
                "\x1b[34m",
                recipient.username
              );
            });
            socket.on("kill", () => {
              namespace.emit("kill");
            });
            socket.on("edit", async (data) => {
              var dm_edit = await DMModel.findOne({ _id: dm._id });
              var MessageIndex = dm_edit.messages.findIndex((message) => {
                return message._id == data._id;
              });
              var Message = await dm_edit.messages.id(data._id);
              var oldID = Message._id;
              var Data = {
                _id: mongoose.Types.ObjectId(),
                color: data.color,
                username: data.username,
                user_id: data.user_id,
                content: data.content,
                timestamp: data.timestamp,
                edits: data.edits + 1,
                type: data.type,
              };
              dm_edit.messages[MessageIndex] = Data;
              await dm_edit.save();
              Data.oldID = oldID;
              namespace.emit("edit", Data);

              const sender_index = dm_edit.people.findIndex(
                (person) => person._id == data.user_id
              );
              const recipient = await UserModel.findOne({
                _id:
                  sender_index == 0
                    ? dm_edit.people[1]._id
                    : dm_edit.people[0]._id,
              });
              console.log(
                "\x1b[32m",
                "[  CHAT  ]",
                "\x1b[31m",
                moment().format("MM/DD/YYYY, HH:MM:SS"),
                "\x1b[34m",
                data.username,
                "\x1b[0m",
                "edited",
                "\x1b[34m",
                `"${Message.content}"`,
                "\x1b[0m",
                "to",
                "\x1b[34m",
                `"${data.content}"`,
                "\x1b[0m",
                "with",
                "\x1b[34m",
                recipient.username
              );
            });
            socket.on("typing", async (data) => {
              let exists = false;
              typers.forEach((typer) => {
                if (typer.user == data.user) exists = true;
              });
              if (exists && data.is === false) {
                const index = typers.findIndex((typer) => {
                  return typer == data.user;
                });
                typers.splice(index, 1);
              } else if (!exists && data.is === true) {
                typers.splice(typers.length, 0, data);
              }
              namespace.emit("typing", typers);
            });
          });
      });
    }
  });
};
