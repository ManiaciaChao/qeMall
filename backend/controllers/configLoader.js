const fs = require("fs");

function loadConfig(callback) {
    const data = fs.readFileSync(`${__dirname}/../config.json`);
    return JSON.parse(data.toString());
}

module.exports = loadConfig();
