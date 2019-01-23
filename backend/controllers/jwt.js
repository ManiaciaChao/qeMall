const crypto = require("crypto");
const crypter = require("./crypter");
const base64url = require("base64-url");

class JWTHeader {
  constructor() {
    this.alg = "HS256";
    this.typ = "jwt";
  }
}
class JWTPayload {
  constructor(query) {
    this.iss = config.siteName || "qeMall";
    this.exp = Date.now() + config.jwt.expHours * 3600 * 1000;
    this.jti = crypter.genSalt();
    this.uid = query.id;
    this.usn = query.username;
    this.rol = query.role;
  }
}
module.exports = {
  role: {
    normal: 1,
    vip: 2,
    trader: 4,
    admin: 8
  },
  login(ctx, query) {
    let header = base64url.encode(JSON.stringify(new JWTHeader(query)));
    let payload = base64url.encode(JSON.stringify(new JWTPayload(query)));
    let signature = this.sign(`${header}.${payload}`);
    let token = `${header}.${payload}.${signature}`;
    ctx.cookies.set("jwt", token);
  },
  parse(ctx) {
    let token = ctx.cookies.get("jwt") || null;
    if (!token) {
      return ctx.throw(400);
    }
    let [header, payload, oldSgn] = token.split(".");
    let newSgn = this.sign(`${header}.${payload}`);
    if (newSgn !== oldSgn) {
      ctx.throw(400);
    }
    let jwtBody;
    try {
      jwtBody = JSON.parse(base64url.decode(payload));
    } catch (e) {
      ctx.throw(400);
    }

    if (jwtBody.exp <= Date.now()) {
      ctx.throw(400);
    }
    return jwtBody;
  },
  sign(string) {
    let hmac = crypto.createHmac("sha256", config.jwt.secret);
    return hmac.update(string).digest("hex");
  }
};
