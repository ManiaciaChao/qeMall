const router = require('koa-router')();
const good = require('../controllers/good');

router.post('/api/good/add', good.add)
    .del('/api/good/del/:goodId', good.del)
    .get('/api/good/info/:goodId', good.info)
    .post('/api/good/update/:goodId', good.update)
    .post('/api/good/activate/:goodId', good.activate)
    .post('/api/good/validate/:goodId', good.validate)
    .post('/api/good/search', good.search)

module.exports = router;