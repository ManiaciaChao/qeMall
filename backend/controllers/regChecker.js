module.exports = {
    email(v) {
        return /^\w+([-+.]\w+)*@\w+([-.]\w +)*\.\w+([-.]\w+)*$/.test(v);
    },
    username(v) {
        return /^\w+$/.test(v);
    },
    phone(v) {
        return /^1\d{10}$/.test(v);
    },
    password(v) {
        return /^[\x00-\xff]{8,20}$/.test(v);
    }
}