const router = require('koa-router');
const jwt = require('../controllers/jwt')
const chat = require('../controllers/chat');

const koa = router();
const wss = router();

koa.get('/api/chat/history/:to', chat.pullHistory);
wss.all('/api/chat', chat.auth, chat.ws);

module.exports = {
    wss: wss,
    koa: koa,
};