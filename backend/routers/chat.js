const router = require('koa-router');
const jwt = require('../controllers/jwt');
const chat = require('../controllers/chat');

const koa = router();
const wss = router();

koa.get('/api/chat/status/:uid', chat.status)
    .get('/api/chat/convs', chat.pullConvs)
    .post('/api/chat/convs', chat.saveConvs)
    .post('/api/chat/history/:to', chat.pullHistory)
    .post('/api/chat/friend/invite/:uid', chat.friendInvite)
    .post('/api/chat/friend/accept/:uid', chat.friendAccept)
    .del('/api/chat/friend/delete/:uid', chat.friendDelete)
    .get('/api/chat/friend/list', chat.friendList)

wss.all('/api/chat', chat.auth, chat.ws);

module.exports = {
    wss: wss,
    koa: koa,
};