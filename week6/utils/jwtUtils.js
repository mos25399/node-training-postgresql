const jwt = require("jsonwebtoken");
const config = require("../config/index");
const appError = require("./appError");
const secret = require("../config/secret");

const generateJWT = (payload) => {
  return jwt.sign(payload, config.get("secret.jwtSecret"), {
    expiresIn: config.get("secret.jwtExpiresDay"),
  });
};

const verifyJWT = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.get("secret.jwtSecret"), (err, decoded) => {
      if (err) {
        switch (err.name) {
          case "TokenExpiredError":
            reject(appError(401, "Token 已過期"));
            break;
          default:
            reject(appError(401, "無效的 token"));
            break;
        }
      } else {
        resolve(decoded);
      }
    });
  });
};

module.exports = {
  generateJWT,
  verifyJWT,
};
