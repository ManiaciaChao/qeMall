const crypter = require('./crypter');
const UserModel = require('../models/UserModel');
const jwt = require('./jwt');

module.exports = {
    // {
    //     "username": "wnj",
    //     "email": "wnjtql@tt.tql",
    //     "pwHash": "dd",
    // }
    async register(ctx, next) {
        const req = ctx.request.body;

        // Check if params are valid
        if (!Reflect.has(req, 'username')
            || !Reflect.has(req, 'email')
            || !Reflect.has(req, 'pwHash')) {
            ctx.throw(400);
        }
        Object.keys(req).forEach(k => {
            if (req[k] === "") {
                ctx.throw(400);
            }
        });
        // Check email or username repeat
        if (await UserModel.exists('email', req.email)) {
            ctx.throw(400, 'email already exists.');
        }
        if (await UserModel.exists('username', req.username)) {
            ctx.throw(400, 'username already exists.');
        }
        // console.log(2);
        const salt = crypter.genSalt();
        const user = new UserModel({
            username: req.username,
            email: req.email,
            pwSalt: salt,
            pwHashSalted: crypter.cryptPwd(req.pwHash, salt),
        });
        user.save();
        ctx.body = {
            message: 'done!'
        };
        return;
    },
    // {
    //     "id": "wnj",
    //     "pwHash": "dd",
    // }
    async login(ctx, next) {
        const req = ctx.request.body;
        if (!Reflect.has(req, 'id')
            || !Reflect.has(req, 'pwHash')) {
            ctx.throw(400);
        }
        Object.keys(req).forEach(k => {
            if (req[k] === "") {
                ctx.throw(400);
            }
        });

        const query = await UserModel.findOne({
            $or: [{ username: req.id }, { email: req.id }]
        });
        if (query && query.pwHashSalted === crypter.cryptPwd(req.pwHash, query.pwSalt)) {
            jwt.login(ctx, query);
            ctx.body = {
                code: 200,
                message: 'logined!'
            }
        } else {
            ctx.throw(400, 'invaild passport.');
        }
        return;
    },
    // {
    //     "username": "wnj",
    //     "email": "wnjtql@tt.tql",
    //     "pwHash": "dd",
    //     "role": 2
    // }
    async userAdd(ctx, next) {
        const req = ctx.request.body;
        const jwtBody = jwt.parse(ctx);
        if (jwtBody.rol < jwt.role.admin) ctx.throw(400);
        // Check if params are valid
        if (!Reflect.has(req, 'username')
            || !Reflect.has(req, 'email')
            || !Reflect.has(req, 'pwHash')) {
            ctx.throw(400);
        }
        Object.keys(req).forEach(k => {
            if (req[k] === "") {
                ctx.throw(400);
            }
        });
        // Check email or username repeat
        if (await UserModel.exists('email', req.email)) {
            ctx.throw(400, 'email already exists.');
        }
        if (await UserModel.exists('username', req.username)) {
            ctx.throw(400, 'username already exists.');
        }
        const salt = crypter.genSalt();
        const user = new UserModel({
            username: req.username,
            email: req.email,
            pwSalt: salt,
            pwHashSalted: crypter.cryptPwd(req.pwHash, salt),
            role: req.role || 1
        });
        user.save();
        ctx.body = {
            message: 'done!'
        };
        return;
    },
    async userDel(ctx, next) {

        const jwtBody = jwt.parse(ctx);
        if (jwtBody.rol < jwt.role.admin) ctx.throw(400);

        const uid = ctx.request.body.uid || null;
        if (!uid) ctx.throw(400);

        await UserModel.findByIdAndRemove(uid).then(data => {
            if (!data) { throw new Error() }
            ctx.body = {
                message: 'done!'
            };
        }).catch(err => {
            ctx.throw(400);
        });
        return;
    }
}