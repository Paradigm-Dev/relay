const { Router } = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UserModel = require("../models/User");
const { jwt_secret } = require("../config/vapid");

const router = Router();

const maxAge = 7 * 24 * 60 * 60;
function createToken(id) {
  return jwt.sign({ id }, jwt_secret, {
    expiresIn: maxAge,
  });
}

function handleErrors(err) {
  console.log(err.message, err.code);
  let errors = { username: "", password: "" };

  // incorrect username
  if (err.message === "incorrect username") {
    errors.username = "That username is not registered";
  }

  // incorrect password
  if (err.message === "incorrect password") {
    errors.password = "That password is incorrect";
  }

  // duplicate username error
  if (err.code === 11000) {
    errors.username = "That username is already registered";
    return errors;
  }

  // validation errors
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
}

async function signIn(username, password) {
  const user = await UserModel.findOneAndUpdate(
    { username },
    { in: true },
    { new: true }
  );
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("incorrect password");
  }
  throw Error("incorrect username");
}

router.post("/signin", async (req, res) => {
  const { username, password, sticky } = req.body;

  try {
    const user = await signIn(username, password);
    let token;
    if (sticky) {
      token = createToken(user._id);
      res.cookie("jwt", token, {
        maxAge: maxAge * 1000,
      });
    }
    res.status(200).json({ user, jwt: token });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(req.body.password, salt);

    const user = await UserModel.create({
      username: req.body.username,
      password,
      bio: req.body.bio,
      color: req.body.color,
      rights: req.body.rights,
      moonrocks: req.body.moonrocks,
      code: req.body.code,
      chatrooms: [],
      people: {
        requests: [],
        approved: [],
        blocked: [],
        sent: [],
        blocked_by: [],
      },
      banned: false,
      strikes: 0,
      files: [],
      posts: [],
      pinned_apps: req.body.pinned_apps,
      preflight: false,
      notifications: [],
      in: true,
    });

    await ApolloModel.findOneAndUpdate(
      { code: req.body.code },
      { $set: { used: true, username: newUser.username, uid: newUser._id } }
    );

    fs.mkdirSync("/mnt/drawer/" + newUser._id);
    fs.mkdirSync(__dirname + "/../files/broadcast/" + newUser._id);

    const token = createToken(user._id);
    res.cookie("jwt", token, {
      httpOnly: false,
      // maxAge: maxAge * 1000,
    });

    res.status(201).json(user);
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
});

router.post("/signout", async (req, res) => {
  await UserModel.findByIdAndUpdate(req.body._id, { in: false });
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
});

router.get("/verify", async (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwt_secret, async (err, decodedToken) => {
      if (err) {
        res.cookie("jwt", "", { maxAge: 1 });
        res.statusCode(403);
      } else {
        const user = await UserModel.findById(decodedToken.id);
        if (user)
          res.json({
            valid: true,
            user,
          });
      }
    });
  } else {
    res.json({ valid: false });
  }
});

router.post("/verify", async (req, res) => {
  const token = req.body.jwt;
  if (token) {
    jwt.verify(token, jwt_secret, async (err, decodedToken) => {
      if (err) {
        res.cookie("jwt", "", { maxAge: 1 });
        res.statusCode(403);
      } else {
        const user = await UserModel.findById(decodedToken.id);
        if (user)
          res.json({
            valid: true,
            user,
          });
      }
    });
  } else {
    res.json({ valid: false });
  }
});

// router.post("/regen", async (req, res) => {
//   const salt = await bcrypt.genSalt();
//   const password = await bcrypt.hash(req.body.password, salt);
//   res.json({ password });
// });

module.exports = router;
