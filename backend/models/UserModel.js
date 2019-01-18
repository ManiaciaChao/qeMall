const mongoose = require('mongoose');
const regChecker = require('../controllers/regChecker');
const ObjectId = mongoose.SchemaTypes.ObjectId;
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        validate: {
            validator: value => regChecker.username(value),
            message: 'username invalid'
        }
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: value => regChecker.email(value),
            message: 'email invalid'
        }
    },
    pwSalt: String,
    pwHashSalted: String,
    role: {
        /**
         * role 
         * 1 normal
         * 2 vip
         * 4 trader
         * 8 admin
         */
        type: Number,
        min: 0, max: 8,
        default: 1,
    },
    friends: [{
        type: {
            uid: {
                type: ObjectId,
                required: true
            }
        }
    }]
}, { timestamps: {} });
const UserModel = mongoose.model('users', userSchema);

Object.assign(UserModel, {
    // Check if the give key-value exists
    async exists(key, value) {
        let count = await this.countDocuments({ [key]: value });
        return (count > 0);
    }
});

module.exports = UserModel;