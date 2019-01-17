const router = require('koa-router')();
const user = require('../controllers/user');

router.post('/api/user/login', user.login)
    .post('/api/user/register', user.register)

    .post('/api/admin/user/user_add', user.userAdd)
    .del('/api/admin/user/user_del', user.userDel)

module.exports = router;