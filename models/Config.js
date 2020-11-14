const mongoose = require("mongoose");

const DownloadsSchema = new mongoose.Schema({
  capture: {
    win: String,
    mac: String,
  },
  intelligence: {
    win: String,
    mac: String,
  },
});

const ConfigSchema = new mongoose.Schema(
  {
    auth: {
      sign_in: Boolean,
      sign_up: Boolean,
      recover: Boolean,
    },
    shutdown: Boolean,
    apps: mongoose.Mixed,
    find: String,
    banned: [String],
    downloads: DownloadsSchema,
    landing: {
      date: String,
      title: String,
      body: String,
    },
  },
  { collection: "config" }
);

const ConfigModel = mongoose.model("config", ConfigSchema);

module.exports = ConfigModel;
