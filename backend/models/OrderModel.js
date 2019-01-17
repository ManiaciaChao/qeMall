const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const orderSchema = new mongoose.Schema({
    customerId: {
        type: ObjectId,
        required: true,
        index: true
    },
    traderId: {
        type: ObjectId,
        required: true,
        index: true
    },
    addressC: {
        type: String,
        required: true
    },
    addressT: {
        type: String,
        required: true
    },
    good: {
        type: ObjectId,
        required: true,
        index: true
    },
    priceEach: {
        type: Number,
        min: 0, max: 1000000 * 100,
        required: true,
        validate: {
            validator: v => Number.isInteger(v),
            message: 'price invalid'
        }
    },
    count: {
        type: Number,
        min: 0,
        required: true,
        validate: {
            validator: v => Number.isInteger(v),
            message: 'price invalid'
        }
    },

}, { timestamps: true });
orderSchema.virtual('price').get(function () {
    return this.priceEach * this.count;
});

const OrderModel = mongoose.model('orders', orderSchema);

Object.assign(OrderModel, {
    // Check if the give key-value exists
    async exists(key, value) {
        let count = await this.countDocuments({ [key]: value });
        return (count > 0);
    }
});

module.exports = OrderModel;