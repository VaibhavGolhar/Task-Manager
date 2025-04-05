const {constants} = require('../constants');

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;

    switch(statusCode) {
        case constants.BAD_REQUEST:
            res.json({ title: "Bad Request", message: err.message, statusCode });
            break;
        case constants.UNAUTHORIZED:
            res.json({ title: "Unauthorized", message: err.message, statusCode });
            break;
        case constants.FORBIDDEN:
            res.json({ title: "Forbidden", message: err.message, statusCode });
            break;
        case constants.NOT_FOUND:
            res.json({ title: "Not Found", message: err.message, statusCode });
            break;
        case constants.SERVER_ERROR:
            res.json({ title: "Server Error", message: err.message, statusCode });
            break;
        default:
            console.log("No error.");
            break;
    }
}

module.exports = errorHandler;