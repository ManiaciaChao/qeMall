const GoodModel = require('../models/GoodModel');
const jwt = require('./jwt');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

module.exports = {
    async add(ctx, next) {
        const jwtBody = jwt.parse(ctx);
        if (jwtBody.rol < jwt.role.trader) {
            ctx.throw(400);
        }
        const req = ctx.request.body;
        req.traderId = new ObjectId(req.traderId);
        console.log(req);
        const good = new GoodModel(req);
        await good
            .save()
            .then(data => {
                ctx.body = {
                    message: 'done!'
                };
            })
            .catch(err => {
                ctx.throw(400);
            });
        return;
    },
    async del(ctx, next) {
        const jwtBody = jwt.parse(ctx);
        if (jwtBody.rol < jwt.role.trader) {
            ctx.throw(400);
        }
        const req = ctx.params;
        console.log(req);
        await GoodModel.findByIdAndDelete(req.goodId)
            .then(data => {
                if (!data) {
                    throw new Error();
                }
                ctx.body = {
                    message: 'done!'
                };
            })
            .catch(err => {
                ctx.throw(400);
            });
        return;
    },
    async info(ctx, next) {
        // jwtBody = jwt.parse(ctx);
        // if (!jwtBody || jwtBody.rol < jwt.role.trader) {
        //     ctx.throw(400);
        // }
        const req = ctx.params;
        console.log(req);
        let info;
        await GoodModel.findById(req.goodId)
            .then(data => {
                if (!data) {
                    throw new Error();
                }
                info = data;
            })
            .catch(err => {
                ctx.throw(400);
            });
        ctx.body = {
            id: info.id,
            name: info.name,
            price: info.price,
            categoryID: info.categoryID,
            keywords: info.keywords,
            traderID: info.traderID,
            stock: info.stock
        };
        return;
    },
    async update(ctx, next) {
        const jwtBody = jwt.parse(ctx);
        if (jwtBody.rol < jwt.role.trader) {
            ctx.throw(400);
        }
        const req = ctx.params;
        const body = ctx.request.body;
        console.log(req);
        await GoodModel.findByIdAndUpdate(req.goodId, body)
            .then(data => {
                if (!data) {
                    throw new Error();
                }
                ctx.body = {
                    message: 'done!'
                };
            })
            .catch(err => {
                ctx.throw(400);
            });
        return;
    },
    async getStock(ctx, next) {},
    async updateStock(ctx, next) {},
    async activate(ctx, next) {
        const jwtBody = jwt.parse(ctx);
        if (jwtBody.rol < jwt.role.trader) {
            ctx.throw(400);
        }
        const req = ctx.params;
        const isActive = !!+ctx.query.isActive || null;
        if (!(isActive == true || isActive == false)) {
            ctx.throw(400);
        }
        await GoodModel.findByIdAndUpdate(req.goodId, { active: isActive })
            .then(data => {
                if (!data) {
                    throw new Error();
                }
                ctx.body = {
                    message: 'done!'
                };
            })
            .catch(err => {
                ctx.throw(400);
            });
        return;
    },
    async validate(ctx, next) {
        const jwtBody = jwt.parse(ctx);
        if (jwtBody.rol < jwt.role.admin) {
            ctx.throw(400);
        }
        const req = ctx.params;
        const isValid = !!+ctx.query.isValid || null;
        if (!(isValid == true || isValid == false)) {
            ctx.throw(400);
        }
        await GoodModel.findByIdAndUpdate(req.goodId, { valid: isValid })
            .then(data => {
                if (!data) {
                    throw new Error();
                }
                ctx.body = {
                    message: 'done!'
                };
            })
            .catch(err => {
                ctx.throw(400);
            });
        return;
    },
    async search(ctx, next) {
        jwt.parse(ctx);
        // if (!jwtBody || jwtBody.rol < jwt.role.normal) {
        //     ctx.throw(400);
        // }
        const req = ctx.request.body;
        if (!req.keywords || !Array.isArray(req.keywords)) {
            ctx.throw(400);
        }
        await GoodModel.find({ keywords: { $in: req.keywords } })
            .then(data => {
                if (!data) {
                    throw new Error();
                }
                ctx.body = data.filter(o => o.active && o.valid);
            })
            .catch(err => {
                ctx.throw(400);
            });
        return;
    }
};
