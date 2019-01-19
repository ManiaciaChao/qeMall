const jwt = require('./jwt');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const MsgModel = require('../models/MsgModel')
const UserModel = require('../models/UserModel')


module.exports = {

    async auth(ctx, next) {
        ctx.jwt = jwt.parse(ctx);
        next();
        console.log(ctx.body)
    },
    // {
    //     "to": "5c41c79842580748a1dc00c9"
    // }
    async pullHistory(ctx, next) {
        ctx.jwt = jwt.parse(ctx);
        const userExist = UserModel.findById(ctx.params.to);
        if (!userExist) {
            ctx.throw(400);
        }
        page = ctx.request.body.page || 1;
        num = ctx.request.body.num || 10;
        try {
            const history = await MsgModel.find({
                from: new ObjectId(ctx.jwt.uid),
                to: new ObjectId(ctx.params.to),
            }).limit(num).skip((page - 1) * num);
            ctx.body = history;
        } catch (e) {
            ctx.throw(400);
        }
    },
    async status(ctx, next) {
        // ctx.jwt = jwt.parse(ctx);
        const userExist = UserModel.findById(ctx.params.uid);
        if (!userExist) {
            ctx.throw(400);
        }
        ctx.body = ctxs.has(ctx.params.uid) ? 1 : 0;
    },
    async pullConvs(ctx, next) {
        ctx.jwt = jwt.parse(ctx);
        const convs = await UserModel.findById(ctx.jwt.uid).convs;
        ctx.body = convs;
    },
    async saveConvs(ctx, next) {
        ctx.jwt = jwt.parse(ctx);
        try {
            const convs = await UserModel.findById(ctx.jwt.uid).convs;
        } catch { }
    },

    // {
    //     "to": "5c41c79842580748a1dc00c9",
    //     "type": "text",
    //     "msg": "Hello"
    // }
    async ws(ctx, next) {
        console.log(ctx.jwt.uid);
        ctxs.set(ctx.jwt.uid, ctx);

        ctx.websocket.send(JSON.stringify({
            code: 0
        }));

        ctx.websocket.on('message', msg => {
            msg = JSON.parse(msg);
            const msgDoc = new MsgModel({
                from: ctx.jwt.uid,
                to: msg.to,
                type: msg.type,
                msg: msg.msg
            });
            const userExist = UserModel.findById(msg.to);
            if (!userExist) {
                ctx.websocket.send(JSON.stringify({ code: 5 }));
                return;
            }
            let to = ctxs.get(msg.to);
            try {
                msgDoc.save();
                ctx.websocket.send(msgDoc.createdAt);
                if (to) {
                    to.websocket.send(JSON.stringify(msgDoc));
                }
            } catch (e) {
                ctx.websocket.send(JSON.stringify({ code: 10, }));
            }
        });

        ctx.websocket.on('close', () => { });
    }
}