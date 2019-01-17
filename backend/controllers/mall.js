const jwt = require('./jwt');
const CartModel = require('../models/CartModel')

module.exports = {
    async hello(ctx, next) {
        const jwtBody = jwt.parse(ctx);
        if (jwtBody) {
            ctx.response.body = `<h1>Hello!, ${jwtBody.uid}</h1>`;
        } else {
            ctx.response.body = `<h1>Please Login!</h1>`;
        }
    },
    async getCart(ctx, next) {
        const jwtBody = jwt.parse(ctx);
        const req = ctx.request.body;
        await CartModel.findOne({ uid: jwtBody.uid })
            .then(data => {
                if (!data) throw new Error();
                if (data.good.length === 0) { ctx.body = data; }
                else {
                    ctx.body = data;
                }
            }).catch(err => {
                const cart = new CartModel({
                    uid: jwtBody.uid,
                    goods: new Array()
                });
                cart.save().catch(e => ctx.throw(e));
                ctx.body = null;
            })
    },
    async addCart(ctx, next) {
        const jwtBody = jwt.parse(ctx);
        const req = ctx.request.body;
        await CartModel.findOne({ uid: jwtBody.uid })
            .then(data => {
                if (!data) throw new Error();
                if (data.good.length === 0) { ctx.body = data; }
                else {
                    ctx.body = data;
                }
            }).catch(err => {
                const cart = new CartModel({
                    uid: jwtBody.uid,
                    goods: new Array()
                });
                cart.save().catch(e => ctx.throw(e));
                ctx.body = null;
            })
    }
}