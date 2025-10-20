const path = require("node:path");
/**
 * @typedef { import('../../server/services/libs/shared/logger') } Log
 * @type { Log }
 */
const Log = require(path.resolve(
    __dirname,
    "../../server/services/libs/shared/logger"
));
function requestLogger(req, res, next) {

    // 打印日志信息
    Log.info(`[${req.method} '${req.url}'] `);

    // 将控制权传递给下一个中间件
    next();
}

function errLogger(err, req, res, next) {
    Log.error(`[${req.method} '${req.url}'] `, err);
    res.status(500).send("Something broke!");
    next();
}

module.exports = { requestLogger, errHandler: errLogger };

if (require.main === module) {
    Log.info("This is a test message");
}
