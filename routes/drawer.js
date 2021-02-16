const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");
const moment = require("moment");
const prettyBytes = require("pretty-bytes");
const mime = require("mime-types");
const UserModel = require("../models/User.js");

const router = express.Router();

function files(path) {
  const dir = fs.readdirSync(path, { withFileTypes: true });

  let stats = [];
  dir.forEach(async (item) => {
    let stat = fs.statSync(`${decodeURIComponent(path)}/${item.name}`);

    stats.push({
      name: item.name,
      size: prettyBytes(stat.size),
      modified: moment(stat.mtime).format("M/D/YYYY [at] h:mm"),
      dir: stat.isDirectory(),
      type: mime.lookup(`${decodeURIComponent(path)}/${item.name}`),
      path: `${decodeURIComponent(path)}/${item.name}`,
    });
  });

  return stats;
}

router.get("/:uid/:path", async (req, res) => {
  const path = decodeURIComponent(req.params.path);
  if (path.substring(0, 12) == "/mnt/drawer/") {
    res.json({ files: files(path) });
  } else {
    res.sendStatus(403);
  }
});

router.get("/:uid", async (req, res) => {
  const path = decodeURIComponent(req.params.path);
  if (path.substring(0, 12) == "/mnt/drawer/") {
    res.json({ files: files(`/mnt/drawer/${req.params.uid}`) });
  } else {
    res.sendStatus(403);
  }
});

router.get("/:uid/download/:path", async (req, res) => {
  const path = decodeURIComponent(req.params.path);
  if (path.substring(0, 12) == "/mnt/drawer/") {
    const User = await UserModel.findOne({ _id: req.params.uid });
    console.log(
      "\x1b[32m",
      "[ DRAWER ]",
      "\x1b[31m",
      moment().format("MM/DD/YYYY, HH:MM:SS"),
      "\x1b[33m",
      req.connection.remoteAddress,
      "\x1b[0m",
      "file",
      "\x1b[34m",
      path,
      "\x1b[0m",
      "belonging to",
      "\x1b[34m",
      User.username,
      "\x1b[0m",
      "was downloaded"
    );
    res.download(path);
  } else {
    res.sendStatus(403);
  }
});

router.get("/:uid/get/:path", async (req, res) => {
  const path = decodeURIComponent(req.params.path);

  if (path.substring(0, 12) == "/mnt/drawer/") {
    const User = await UserModel.findOne({ _id: req.params.uid });
    console.log(
      "\x1b[32m",
      "[ DRAWER ]",
      "\x1b[31m",
      moment().format("MM/DD/YYYY, HH:MM:SS"),
      "\x1b[33m",
      req.connection.remoteAddress,
      "\x1b[0m",
      "file",
      "\x1b[34m",
      path,
      "\x1b[0m",
      "belonging to",
      "\x1b[34m",
      User.username,
      "\x1b[0m",
      "was downloaded"
    );
    res.sendFile(path);
  } else {
    res.sendStatus(403);
  }
});

router.post("/:uid/rename", async (req, res) => {
  if (req.body.old.substring(0, 12) == "/mnt/drawer/") {
    let User = await UserModel.findOne({ _id: req.params.uid });

    fs.rename(req.body.old, req.body.new, async (err) => {
      if (err) throw err;
      console.log(
        "\x1b[32m",
        "[ DRAWER ]",
        "\x1b[31m",
        moment().format("MM/DD/YYYY, HH:MM:SS"),
        "\x1b[33m",
        req.connection.remoteAddress,
        "\x1b[34m",
        User.username,
        "\x1b[0m",
        "renamed file",
        "\x1b[34m",
        req.body.old,
        "\x1b[0m",
        "to",
        "\x1b[34m",
        req.body.new
      );
      res.json({
        files: files(req.body.new.substring(0, req.body.new.lastIndexOf("/"))),
      });
    });
  } else {
    res.sendStatus(403);
  }
});

router.delete("/:uid/:path", async (req, res) => {
  const path = decodeURIComponent(req.params.path);

  if (path.substring(0, 12) == "/mnt/drawer/") {
    let User = await UserModel.findOne({ _id: req.params.uid });

    fs.unlink(path, async (error) => {
      console.log(path.substring(0, path.lastIndexOf("/")));
      res.json({ files: files(path.substring(0, path.lastIndexOf("/"))) });
      console.log(
        "\x1b[32m",
        "[ DRAWER ]",
        "\x1b[31m",
        moment().format("MM/DD/YYYY, HH:MM:SS"),
        "\x1b[33m",
        req.connection.remoteAddress,
        "\x1b[34m",
        User.username,
        "\x1b[0m",
        "deleted file",
        "\x1b[34m",
        path
      );
      if (error) throw error;
    });
  } else {
    res.sendStatus(403);
  }
});

router.post("/:uid/upload/write", (req, res) => {
  const pathway = `/mnt/drawer/${req.params._uid}/${req.body.title}.write.json`;
  if (fs.existsSync(pathway)) fs.unlinkSync(pathway);
  fs.writeFile(pathway, JSON.stringify(req.body), (error) => {
    if (error) console.error(error);
    fs.stat(pathway, async (error, stats) => {
      if (error) console.error(error);
      var User = await UserModel.findOne({ _id: req.params.uid });
      let exists = false;
      User.files.forEach((file) => {
        if (file.name == req.body.title) exists = true;
      });
      if (!exists)
        User.files.push({
          name: req.body.title,
          type: "workshop/write",
          size: prettyBytes(stats.size),
          date: moment().format("MM/DD/YYYY [at] h:mm a"),
          path: `${req.body.title}.write.json`,
        });
      await User.save();
      res.json(req.body);
    });
  });
});

router.post("/:uid/upload/sales", (req, res) => {
  const pathway = `/mnt/drawer/${req.params.uid}/${req.body.title}.sales.json`;
  if (fs.existsSync(pathway)) fs.unlinkSync(pathway);
  fs.writeFile(pathway, JSON.stringify(req.body), (error) => {
    if (error) console.error(error);
    fs.stat(pathway, async (error, stats) => {
      if (error) console.error(error);
      var User = await UserModel.findOne({ _id: req.params.uid });
      let exists = false;
      User.files.forEach((file) => {
        if (file.name == req.body.title) exists = true;
      });
      if (!exists)
        User.files.push({
          name: req.body.title,
          type: "workshop/sales",
          size: prettyBytes(stats.size),
          date: moment().format("MM/DD/YYYY [at] h:mm a"),
          path: `${req.body.title}.sales.json`,
        });
      await User.save();
      res.json(req.body);
    });
  });
});

router.post("/:uid/upload/intel", (req, res) => {
  const pathway = `/mnt/drawer/${req.params.uid}/${req.body.title}.intel.json`;
  if (fs.existsSync(pathway)) fs.unlinkSync(pathway);
  fs.writeFile(pathway, JSON.stringify(req.body), (error) => {
    if (error) console.error(error);
    fs.stat(pathway, async (error, stats) => {
      if (error) console.error(error);
      var User = await UserModel.findOne({ _id: req.params.uid });
      let exists = false;
      User.files.forEach((file) => {
        if (file.name == req.body.title) exists = true;
      });
      if (!exists)
        User.files.push({
          name: req.body.title,
          type: "workshop/intel",
          size: prettyBytes(stats.size),
          date: moment().format("MM/DD/YYYY [at] h:mm a"),
          path: `${req.body.title}.intel.json`,
        });
      await User.save();
      res.json(req.body);
    });
  });
});

router.post("/:uid/upload/:path", async (req, res) => {
  let User = await UserModel.findOne({ _id: req.params.uid });
  const file_path = decodeURIComponent(req.params.path);

  let IDs = file_path.split("/");
  IDs.shift();
  console.log("IDs", IDs);
  let current_id_index = 0;
  let current = User.files;
  function search() {
    console.log("current_id_index", current_id_index);
    let item = current.find((thing) => thing._id == IDs[current_id_index]);
    if (IDs[current_id_index + 1]) {
      console.log("item", item.files);
      current = item.files;
      current_id_index++;
      search();
    } else {
      console.log("item", item.files);
      current = item;
    }
  }
  search();

  const form = formidable({
    multiples: true,
    // uploadDir: `/mnt/drawer/${req.params.uid}${decodeURIComponent(
    //   req.params.path
    // )}`,
    uploadDir: `/mnt/drawer/${req.params.uid}${current.path}`,
    keepExtensions: true,
    maxFileSize: 100 * 1024 * 1024 * 1024,
  });

  await form.parse(req, async (error, fields, files) => {
    if (error) {
      console.error(error);
      res.end();
    } else {
      Object.keys(files).forEach(async (i) => {
        if (file_path == "/") {
          User.files.push({
            name: files[i].name.slice(0, files[i].name.lastIndexOf(".")),
            type: files[i].type,
            size: prettyBytes(files[i].size),
            date: moment().format("MM/DD/YYYY [at] h:mm a"),
            path: files[i].name,
          });
        } else {
          current.files.push({
            _id: mongoose.Types.ObjectId(),
            name: files[i].name.slice(0, files[i].name.lastIndexOf(".")),
            type: files[i].type,
            size: prettyBytes(files[i].size),
            date: moment().format("MM/DD/YYYY [at] h:mm a"),
            path: `${current.path}/${files[i].name}`,
          });
        }

        fs.rename(
          files[i].path,
          `/mnt/drawer/${req.params.uid}${current.path}/${files[i].name}`,
          () => {
            console.log(
              "\x1b[32m",
              "[ DRAWER ]",
              "\x1b[31m",
              moment().format("MM/DD/YYYY, HH:MM:SS"),
              "\x1b[33m",
              req.connection.remoteAddress,
              "\x1b[34m",
              User.username,
              "\x1b[0m",
              "uploaded file",
              "\x1b[34m",
              current.path
            );
          }
        );
      });
      res.json(
        await UserModel.findByIdAndUpdate(req.params.uid, {
          $set: { files: User.files },
        })
      );
    }
  });
});

module.exports = router;
