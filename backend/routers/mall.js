const router = require('koa-router')();
const mall = require('../controllers/mall');

router.get('/', mall.hello)
    .get('/cart', mall.getCart)

module.exports = router;