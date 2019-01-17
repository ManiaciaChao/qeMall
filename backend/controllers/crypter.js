const crypto = require('crypto');


const crypter = {
    genSalt() { return Math.random().toString(36).slice(2, 10); },
    cryptPwd(pwd, salt) {
        let saltedPwd = pwd + salt;
        return crypto.createHash('sha1').update(saltedPwd).digest('hex');
    }
}

module.exports = crypter;