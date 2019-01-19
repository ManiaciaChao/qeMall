const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const msgSchema = new mongoose.Schema({
    from: {
        type: ObjectId,
        required: true
    },
    to: {
        type: ObjectId,
        required: true
    },
    msg: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'image', 'audio', 'link', 'bell', 'f_invite'],
        required: true
    },
}, { timestamps: true });
// orderSchema.virtual('price').get(function () {
//     return this.priceEach * this.count;
// });

const MsgModel = mongoose.model('msgs', msgSchema);

Object.assign(MsgModel, {
    // Check if the give key-value exists
    async exists(key, value) {
        let count = await this.countDocuments({ [key]: value });
        return (count > 0);
    }
});

module.exports = MsgModel;