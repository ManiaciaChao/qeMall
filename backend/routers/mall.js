const router = require('koa-router')();
const mall = require('../controllers/mall');

router.get('/', mall.hello)

router.get('/cart', mall.checkCart, mall.getCart);

router.del('/cart', mall.checkCart, mall.delCart);

router.post('/cart/:gid', mall.checkCart, mall.modCartItem);

router.del('/cart/:gid', mall.checkCart, mall.delCartItem);

module.exports = router;