const { dataSource } = require("../db/data-source");
const appError = require("../utils/appError");
const { verifyJWT } = require("../utils/jwtUtils");
const logger = require("../utils/logger")("isAuth");

const isAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      next(appError(401, "你尚未登入!"));
      return;
    }

    const token = authHeader.split(" ")[1];

    const decoded = await verifyJWT(token);

    const currentUser = await dataSource.getRepository("User").findOne({
      where: {
        id: decoded.id,
      },
    });
    if (!currentUser) {
      next(appError(401, "無效的token"));
      return;
    }
    req.user = currentUser;
    next();
  } catch (error) {
    logger.error(error.message);
    next(error);
  }
};

module.exports = isAuth;
