const jwt = require('./jwt');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const CartModel = require('../models/CartModel');
const GoodModel = require('../models/GoodModel');
const OrderModel = require('../models/OrderModel');

const Mall = {
    async hello(ctx, next) {
        const jwtBody = jwt.parse(ctx);
        if (jwtBody) {
            ctx.response.body = `<h1>Hello, ${jwtBody.usn}</h1>`;
        } else {
            ctx.response.body = `<h1>Please Login!</h1>`;
        }
    },
    async checkCart(ctx, next) {
        ctx.jwt = jwt.parse(ctx);
        ctx.cart = await CartModel.findOne({ uid: ctx.jwt.uid });
        if (!ctx.cart) {
            ctx.cart = new CartModel({
                uid: ctx.jwt.uid,
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
        ctx.cart.save().catch(e => ctx.throw(e));
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
        const i = goods.map(g => g.gid.toString()).indexOf(gid);
        const good = await GoodModel.findById(gid);
        if (!good || !good.active || !good.valid) {
            ctx.throw(400);
        }
        const amount = req.amount <= good.stock ? req.amount : good.stock;
        if (i < 0) {
            console.log('not exist');
            goods.push({
                gid: mongoose.Types.ObjectId(gid),
                amount: amount
            });
            i += goods.length;
        } else {
            goods[i].amount = amount;
        }
        await ctx.cart.save().catch(err => ctx.throw(400));
        ctx.body = goods[i];
        return;
    },
    async delCartItem(ctx, next) {
        const gid = ctx.params.gid;
        let goods = ctx.cart.goods;
        if (!goods.map(g => g.gid).includes(gid)) {
            ctx.throw(400);
        }
        ctx.cart.goods = ctx.cart.goods.filter(g => g.id !== gid);
        await ctx.cart.save().catch(err => ctx.throw(400));
        ctx.body = gid;
    },
    async addCartItem(ctx, next) {
        const gid = ctx.params.gid;
        let goods = ctx.cart.goods;
        if (goods.map(g => g.gid).includes(gid)) {
            ctx.throw(400, 'already in cart!');
        }
        ctx.cart.goods.push({
            gid: new ObjectId(gid)
        });
        await ctx.cart.save().catch(err => {
            ctx.throw(400);
        });
        ctx.body = gid;
        return;
    },
    /**
     *  Orders
     */
    async genOrder(ctx, next) {
        const orders = new Map();
        ctx.body = new Set();
        ctx.cart.goods.forEach(async g => {
            const good = await GoodModel.findById(g.gid.toString());
            const tid = good.traderId.toString();
            if (!orders.has(tid)) {
                orders.set(
                    tid,
                    new OrderModel({
                        customerId: new ObjectId(ctx.jwt.uid),
                        traderId: good.traderId,
                        addressC: ctx.request.body.address,
                        goods: new Array()
                    })
                );
            }
            orders.get(tid).goods.push({
                gid: g.id,
                priceEach: good.price,
                amount: g.amount
            });
        });
        orders.forEach(async o => {
            await o.save().catch(err => {
                console.log(err);
                ctx.throw(400);
            });
            ctx.body.add(o.id);
        });
    },
    async getOrder(ctx, next) {
        ctx.jwt = jwt.parse(ctx);
        if (ctx.jwt.rol < jwt.role.admin) {
            ctx.throw(400);
        }
        const order = await OrderModel.findById(ctx.params.oid);
        if (!order) {
            ctx.throw(400, 'order not found');
        }
        ctx.body = order;
    },
    async delOrder(ctx, next) {
        ctx.jwt = jwt.parse(ctx);
        if (ctx.jwt.rol < jwt.role.trader) {
            ctx.throw(400);
        }
        const order = await OrderModel.findById(ctx.params.oid);
        if (!order) {
            ctx.throw(400, 'order not found');
        }
        ctx.body = order;
    },
    async getCusOrder(ctx, next) {
        ctx.jwt = jwt.parse(ctx);
        const order = await OrderModel.find({
            customerId: new ObjectId(jwt.uid)
        });
        if (!order) {
            ctx.throw(400, 'no order');
        }
        ctx.body = order;
    },
    async getTrdOrder(ctx, next) {
        ctx.jwt = jwt.parse(ctx);
        if (ctx.jwt.rol < jwt.role.trader) {
            ctx.throw(400, 'permisson denid');
        }
        const order = await OrderModel.find({
            traderId: new ObjectId(jwt.uid)
        });
        if (!order) {
            ctx.throw(400, 'no order');
        }
        ctx.body = order;
    },
    async modTrdOrder(ctx, next) {
        ctx.jwt = jwt.parse(ctx);
        const req = ctx.request.body;
        if (ctx.jwt.rol < jwt.role.trader) {
            ctx.throw(400, 'permisson denid');
        }
        const order = await OrderModel.findById(ctx.params.oid);
        if (!order) {
            ctx.throw(400, 'no order');
        }
        if (req.addressC) {
            order.addressC = req.addressC;
        }
        if (req.goods) {
            order.goods = req.goods;
        }
        await order.save().catch(err => ctx.throw(400));
        ctx.body = order;
    }
};

module.exports = Mall;
