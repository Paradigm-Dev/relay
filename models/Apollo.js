const mongoose = require("mongoose");

const ApolloSchema = new mongoose.Schema(
  {
    code: String,
    username: String,
    uid: String,
    name: String,
    dev: String,
    used: Boolean,
  },
  { collection: "apollo" }
);

const ApolloModel = mongoose.model("apollo", ApolloSchema);

module.exports = ApolloModel;
