const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");
const { jwt_secret } = require("../config/vapid");

function requireAuth(req, res, next) {
  const token = req.cookies.jwt;

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, jwt_secret, (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect("/login");
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    res.redirect("/login");
  }
}

// check current user
function getUserData(req, res, next) {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwt_secret, async (err, decodedToken) => {
      if (err) {
        console.log(err);
        req.user = null;
        next();
      } else {
        let user = await UserModel.findById(decodedToken.id);
        req.user = user;
        next();
      }
    });
  } else {
    req.user = null;
    next();
  }
}

module.exports = { requireAuth, getUserData };
