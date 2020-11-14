/*
  Copyright (c) 2020, Paradigm. All rights reserved.
  NOTE: By accessing data in our database, you agree to the Terms and Conditions:
  https://github.com/Paradigm-Dev/paradigm/blob/master/TERMS.md
  All files within this directory and subdirectories adhere to these terms,
  and so do YOU!
*/

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const bodyParser = require("body-parser");
const socket = require("socket.io");
const https = require("https");
const fs = require("fs");
const moment = require("moment");
const path = require("path");

const ConfigModel = require("./models/Config.js");
const UserModel = require("./models/User.js");

const port = 443;
const host = "192.168.1.247";
const app = express();

process.title = process.argv[2];

const server = https
  .createServer(
    {
      key: fs.readFileSync(
        "/etc/letsencrypt/live/theparadigmdev.com/privkey.pem"
      ),
      cert: fs.readFileSync(
        "/etc/letsencrypt/live/theparadigmdev.com/fullchain.pem"
      ),
    },
    app
  )
  .listen(port, host);
console.log(
  "\x1b[32m",
  "[ SERVER ]",
  "\x1b[31m",
  moment().format("MM/DD/YYYY, HH:MM:SS"),
  "\x1b[34m",
  `https://${host}:${port}`,
  "\x1b[0m",
  "listening"
);
server.timeout = 1000000000;

const io = socket(server, {
  // path: '/socket'
});

require("./sockets/index.js").socket(io);
require("./sockets/flamechat.js")(io);
require("./sockets/terminal.js")(io);
require("./sockets/transmission.js")(io);

mongoose.promise = global.Promise;

app.use(
  cors({
    origin: [
      "https://www.theparadigmdev.com",
      "https://theparadigmdev.com",
      "https://localhost:8080",
      "http://localhost:8080",
      "https://192.168.1.178:8080",
      "app://.",
    ],
  })
);

app.use(bodyParser.json({ limit: "1000gb" }));

require("./config/passport")(passport);

app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// CAMPAIGN
// app.use('/campaign', express.static(__dirname + '/campaign'))

// RELAY
app.use("/relay", express.static(__dirname + "/files"));
app.use("/relay/movies", express.static("/mnt/movies"));

// ROUTES
app.use("/api/users", require("./routes/users.js"));
app.use("/api/flamechat", require("./routes/flamechat.js"));
app.use("/api/paradox", require("./routes/paradox.js"));
app.use("/api/media", require("./routes/media.js"));
app.use("/api/drawer", require("./routes/drawer.js"));
app.use("/api/terminal", require("./routes/terminal.js"));
app.use("/api/patriot", require("./routes/patriot.js"));
app.use("/api/broadcast", require("./routes/broadcast.js"));
app.use("/api/apollo", require("./routes/apollo.js"));
app.use("/api/bugs", require("./routes/bugs.js"));
app.use("/api/satellite", require("./routes/satellite.js"));
app.use("/api/notifications", require("./routes/notifications.js"));
app.use("/api", require("./routes/index.js"));

// PARADIGM
app.use("/", express.static(__dirname + "/dist"));

mongoose
  .connect(`mongodb://${host}:27017/paradigm`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() =>
    console.log(
      "\x1b[32m",
      "[   DB   ]",
      "\x1b[31m",
      moment().format("MM/DD/YYYY, HH:MM:SS"),
      "\x1b[34m",
      `mongodb://${host}:27017`,
      "\x1b[0m",
      "connected"
    )
  )
  .catch((error) => console.error(error));

async function fixUsers() {
  let in_users = [];
  in_users = await UserModel.find({ in: true });
  console.log(
    "\x1b[32m",
    "[  AUTH  ]",
    "\x1b[31m",
    moment().format("MM/DD/YYYY, HH:MM:SS"),
    "\x1b[34m",
    in_users.length.toString(),
    "\x1b[0m",
    in_users.length == 1
      ? "incorrectly logged in user"
      : "incorrectly logged in users"
  );
  if (in_users.length > 0) {
    await Promise.all(
      in_users.map(async (User) => {
        User.in = false;
        await User.save();
      })
    );
  }
}

fixUsers();

console.log(
  "\x1b[32m",
  "[  NOTE  ]",
  "\x1b[31m",
  moment().format("MM/DD/YYYY, HH:MM:SS"),
  "\x1b[34m",
  "By accessing our database,",
  "\x1b[0m",
  "you agree to the Terms and Conditions"
);
