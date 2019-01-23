const OrderModel = require("../models/OrderModel");
const jwt = require("./jwt");

module.exports = {
    // {
    //     "customerId": "",
    //     "traderId": "",
    //     "addressC": "",
    //     "goods": [
    //         {
    //             "gid": "",
    //             "amount": ""
    //         },
    //         {
    //             "gid": "",
    //             "amount": ""
    //         }
    //     ]
    // }
    async dist(ctx, next) {
        ctx.jwt = jwt.parse(ctx);
        const req = ctx.request.body;
        const dist = new Array();
        req.goods.forEach(g => {});
    },
    async add(ctx, next) {
        ctx.jwt = jwt.parse(ctx);
        const req = ctx.request.body;
        const order = new OrderModel(Object.assign(req));
    },
    async del(ctx, next) {},
    async update(ctx, next) {},
    async search(ctx, next) {}
};
