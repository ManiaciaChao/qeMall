const mongoose = require('mongoose');
// const GoodModel = require('./GoodModel');
const ObjectId = mongoose.Schema.Types.ObjectId;
const cartSchema = new mongoose.Schema({
    uid: {
        type: ObjectId,
        required: true,
        index: true
    },
    goods: {
        type: [{
            id: {
                type: ObjectId
            },
            amount: {
                type: String,
                min: 1
            }
        }]
    }

}, { timestamps: true });
// cartSchema.virtual('totalPrice').get(function () {  
// });
const CartModel = mongoose.model('carts', cartSchema);

Object.assign(CartModel, {
    // Check if the give key-value exists
    async exists(key, value) {
        let count = await this.countDocuments({ [key]: value });
        return (count > 0);
    }
});

module.exports = CartModel;