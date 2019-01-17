const mongoose = require('mongoose');
const goodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    price: {
        type: Number,
        min: 0, max: 10000 * 100,
        required: true,
        validate: {
            validator: v => Number.isInteger(v),
            message: 'price invalid'
        }
    },
    categoryID: {
        type: String,
        required: true
    },
    keywords: {
        type: [{
            type: String,
            lowercase:true
        }],
        required: true,
        index: true
    },
    description: {
        type: String,
        required: true
    },
    traderID: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        min: 0, max: 100000,
        default: 0,
        validate: {
            validator: v => Number.isInteger(v),
            message: 'stock invalid'
        }
    },
    active: {
        type: Boolean,
        default: false
    },
    valid: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });
goodSchema.virtual('priceCNY').get(function () {
    return this.price / 100;
});

const GoodModel = mongoose.model('goods', goodSchema);

Object.assign(GoodModel, {
    // Check if the give key-value exists
    async exists(key, value) {
        let count = await this.countDocuments({ [key]: value });
        return (count > 0);
    }
});

module.exports = GoodModel;