const jwt = require('./jwt');
const mongoose = require('mongoose');
const CartModel = require('../models/CartModel');
const GoodModel = require('../models/GoodModel');

const Mall = {
    async hello(ctx, next) {
        const jwtBody = jwt.parse(ctx);
        if (jwtBody) {
            ctx.response.body = `<h1>Hello!, ${jwtBody.uid}</h1>`;
        } else {
            ctx.response.body = `<h1>Please Login!</h1>`;
        }
    },
    async checkCart(ctx, next) {
        ctx.jwt = jwt.parse(ctx);
        ctx.cart = await CartModel.findOne({ uid: jwtBody.uid });
        if (!ctx.cart) {
            ctx.cart = new CartModel({
                uid: jwtBody.uid,
                goods: new Array()
            });
            ctx.cart.save().catch(e => ctx.throw(e));
        }
        next();
    },
    async getCart(ctx, next) {
        ctx.body = {
            uid: ctx.cart.uid,
            goods: ctx.cart.goods
        };
    },
    async delCart(ctx, next) {
        ctx.cart.goods = new Array();
        ctx.body = ctx.jwt.uid;
    },
    /**
     *  {
     *      amount
     *  }
     */
    async modCartItem(ctx, next) {
        const gid = ctx.params.gid;
        const req = ctx.request.body;
        let goods = ctx.cart.goods;
        const i = goods.map(g => g.id).indexOf(gid);
        const good = await GoodModel.findById(gid);
        if (!good || !good.active || !good.valid) {
            ctx.throw(400);
        }
        const amount = (req.amount <= good.stock) ? req.amount : good.stock;
        if (i < 0) {
            console.log("not exist");
            goods.push({
                id: mongoose.Types.ObjectId(gid),
                amount: amount
            });
            i += goods.length;
        } else {
            goods[i].amount = amount;
        }
        await ctx.cart.save().catch(err => ctx.throw(400));
        ctx.body = goods[i];
    },
    async delCartItem(ctx, next) {
        const gid = ctx.params.gid;
        let goods = ctx.cart.goods;
        if (!goods.map(g => g.id).includes(ctx.params.gid)) {
            ctx.throw(400);
        }
        ctx.cart.goods = ctx.cart.goods.filter(g => g.id !== gid);
        await ctx.cart.save().catch(err => ctx.throw(400));
        ctx.body = gid;
    }
}

module.exports = Mall;