const mongoose = require("mongoose");

const DownloadSchema = new mongoose.Schema({
  title: String,
  description: String,
  icon: String,
  github: String,
  win: String,
  mac: String,
});

const ConfigSchema = new mongoose.Schema(
  {
    auth: {
      sign_in: Boolean,
      sign_up: Boolean,
      recover: Boolean,
      landing: Boolean,
    },
    shutdown: Boolean,
    apps: Object,
    find: String,
    banned: [String],
    downloads: [DownloadSchema],
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
