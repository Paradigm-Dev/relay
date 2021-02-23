const express = require("express");
const fs = require("fs");
const _path = require("path");
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
      type:
        mime.lookup(`${decodeURIComponent(path)}/${item.name}`) ||
        _path.extname(item.name) + " file",
      path: `${decodeURIComponent(path)}/${item.name}`,
    });
  });

  return stats;
}

router.get("/:uid/:path", async (req, res) => {
  const path = decodeURIComponent(req.params.path);
  if (path.substring(0, 11) == "/mnt/drawer") {
    res.json({ files: files(path) });
  } else {
    res.sendStatus(403);
  }
});

router.get("/:uid", async (req, res) => {
  const path = decodeURIComponent(req.params.path);
  if (path.substring(0, 11) == "/mnt/drawer") {
    res.json({ files: files(`/mnt/drawer/${req.params.uid}`) });
  } else {
    res.sendStatus(403);
  }
});

router.get("/:uid/download/:path", async (req, res) => {
  const path = decodeURIComponent(req.params.path);
  if (path.substring(0, 11) == "/mnt/drawer") {
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

  if (path.substring(0, 11) == "/mnt/drawer") {
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
  if (req.body.old.substring(0, 11) == "/mnt/drawer") {
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

  if (path.substring(0, 11) == "/mnt/drawer") {
    let User = await UserModel.findOne({ _id: req.params.uid });

    if (fs.statSync(path).isDirectory()) {
      fs.rmdir(
        path,
        { maxRetries: 3, retryDelay: 100, recursive: true },
        function (err) {
          if (err) console.error(err);
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
            "deleted folder",
            "\x1b[34m",
            path
          );
          res.json({ files: files(path.substring(0, path.lastIndexOf("/"))) });
        }
      );
    } else {
      fs.unlink(path, async (error) => {
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
        res.json({ files: files(path.substring(0, path.lastIndexOf("/"))) });
      });
    }
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

router.post("/:uid/:path", async (req, res) => {
  let User = await UserModel.findOne({ _id: req.params.uid });
  const file_path = decodeURIComponent(req.params.path);

  const form = formidable({
    multiples: true,
    uploadDir: file_path,
    keepExtensions: true,
    maxFileSize: 100 * 1024 * 1024 * 1024,
  });

  form.on("file", (filename, file) => {
    fs.rename(file.path, `${file_path}/${file.name}`, () => {
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
        `${file_path}/${file.name}`
      );
    });
  });

  form.once("end", () => {
    res.json({ files: files(file_path) });
  });

  form.parse(req);
});

router.put("/:uid/:path", (req, res) => {
  const path = decodeURIComponent(req.params.path);

  if (path.substring(0, 11) == "/mnt/drawer") {
    if (fs.existsSync(path + "/New folder")) {
      res.json({ error: "New folder already exists!" });
    } else {
      fs.mkdirSync(path + "/New folder");
      res.json({ files: files(path) });
    }
  } else {
    res.sendStatus(403);
  }
});

module.exports = router;
