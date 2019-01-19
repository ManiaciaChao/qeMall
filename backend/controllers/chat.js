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
        const page = ctx.request.body.page || 1;
        const num = ctx.request.body.num || 10;
        const user1 = new ObjectId(ctx.jwt.uid);
        const user2 = new ObjectId(ctx.params.to);
        try {
            const history = await MsgModel.find({
                $or: [{ from: user1, to: user2 }, { from: user2, to: user1 }]
            }).skip((page - 1) * num).limit(num);
            ctx.body = history;
        } catch (e) {
            ctx.throw(400);
        }
    },
    async status(ctx, next) {
        // ctx.jwt = jwt.parse(ctx);
        const user = await UserModel.findById(ctx.params.uid);
        if (!user) {
            ctx.throw(400, 'user not found');
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
            const res = await UserModel.findById(ctx.jwt.uid);
            const newConvs = ctx.request.body.filter(async v => {
                await UserModel.findById(v)
            });
            const set = new Set([...newConvs, ...res.convs]);
            res.convs = Array.from(set).slice(0, 9);
            res.save();
            ctx.body = res.convs;
        } catch {
            ctx.throw(400);
        }
    },
    async friendList(ctx, next) {
        ctx.jwt = jwt.parse(ctx);
        const user = await UserModel.findById(ctx.jwt.uid);
        if (!user) {
            ctx.throw(400, "user not found");
        }
        ctx.body = user.friends;
    },
    async friendInvite(ctx, next) {
        ctx.jwt = jwt.parse(ctx);
        const targetUser = await UserModel.findById(ctx.params.uid);
        if (!targetUser) {
            ctx.throw(400, 'user not found');
        }
        const isFriend = targetUser.friends.map(u => u.uid).has(new ObjectId(ctx.jwt.uid));
        if (isFriend) {
            ctx.throw(400, 'already been friend');
        }
        const invited = await MsgModel.findOne({
            from: ctx.jwt.uid,
            to: ctx.params.uid,
            type: 'f_invite'
        });
        if (invited) {
            ctx.throw(400, 'already invited');
        }
        const msgDoc = new MsgModel({
            from: ctx.jwt.uid,
            to: ctx.params.uid,
            type: 'f_invite',
            msg: `friend invitation`
        });
        try {
            await msgDoc.save();
        } catch {
            ctx.throw(400);
        }
    },
    async friendAccept(ctx, next) {
        ctx.jwt = jwt.parse(ctx);
        const targetUser = await UserModel.findById(ctx.params.uid); // from
        if (!targetUser) {
            ctx.throw(400, 'user not found');
        }
        const isFriend = targetUser.friends
            .map(u => u.uid.toString())
            .has(ctx.jwt.uid);
        if (isFriend) {
            ctx.throw(400, 'already been friend');
        }
        const query = {
            from: ctx.params.uid,
            to: ctx.jwt.uid,
            type: 'f_invite'
        };
        const invited = await MsgModel.findOne(query);
        if (!invited) {
            ctx.throw(400, 'invitation not found');
        }
        try {
            const thisUser = await UserModel.findById(ctx.jwt.id); // to
            thisUser.friends.push({ uid: new ObjectId(ctx.params.uid) });
            targetUser.friends.push({ uid: new ObjectId(ctx.jwt.uid) });
            await thisUser.save();
            await targetUser.save();
            await MsgModel.deleteOne(query);
            ctx.body = ctx.params.uid;
        } catch {
            ctx.throw(400);
        }
    },
    async friendDelete(ctx, next) {
        ctx.jwt = jwt.parse(ctx);
        const targetUser = await UserModel.findById(ctx.params.uid); // from
        if (!targetUser) {
            ctx.throw(400, 'user not found');
        }
        const isFriend = targetUser.friends
            .map(u => u.uid.toString())
            .has(ctx.jwt.uid);
        if (!isFriend) {
            ctx.throw(400, 'not friends');
        }
        try {
            const thisUser = await UserModel.findById(ctx.jwt.id); // to
            thisUser.friends.filter(o => o.uid.toString() !== ctx.params.id);
            targetUser.friends.filter(o => o.uid.toString() !== ctx.jwt.id)
            await thisUser.save();
            await targetUser.save();
            await MsgModel.deleteOne(query);
            ctx.body = ctx.params.uid;
        } catch {
            ctx.throw(400);
        }
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