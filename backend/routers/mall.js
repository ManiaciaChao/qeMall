const router = require('koa-router')();
const mall = require('../controllers/mall');

router.get('/', mall.hello);
router.get('/cart', mall.checkCart, mall.getCart);
router.del('/cart', mall.checkCart, mall.delCart);
router.post('/cart/:gid', mall.checkCart, mall.modCartItem);
router.del('/cart/:gid', mall.checkCart, mall.delCartItem);
router.get('/cart/add/:gid', mall.checkCart, mall.addCartItem);

router.get('/order/generate', mall.checkCart, mall.genOrder);
router.get('/order/:oid', mall.getOrder);
router.del('/order/:oid', mall.delOrder);
router.get('/order/customer/:oid', mall.getCusOrder);
router.get('/order/trader/:oid', mall.getTrdOrder);
router.get('/order/trader/:oid', mall.getTrdOrder);
router.post('/order/trader/:oid', mall.modTrdOrder);

module.exports = router;
