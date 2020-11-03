const mongoose = require("mongoose");

const SupporterSchema = new mongoose.Schema({
  f_name: String,
  l_name: String,
  email: String,
  phone: String,
  notify: Boolean,
  wishes: String,
});

const SupporterModel = mongoose.model("supporter", SupporterSchema);

module.exports = SupporterModel;
