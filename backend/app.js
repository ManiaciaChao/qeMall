const Koa = require('koa'); // import as a class
const koaBody = require('koa-body');
const websockify = require('koa-websocket')

const mongoose = require('mongoose');

global.config = require('./controllers/configLoader');
console.log("config.json loaded.")

mongoose.connect(config.dbURI, { useNewUrlParser: true }).then(
    () => { console.log('Database connection established!') },
    err => { throw new Error("DBC FAILED!") }
);

const app = websockify(new Koa(), { clientTracking: true });

app.use(koaBody());

app.use(async (ctx, next) => { // logger
    let startTime = Date.now();
    await next();
    let processTime = Date.now() - startTime;
    console.log(`${ctx.method} ${ctx.url} in ${processTime}ms`);
});

global.ctxs = new WeakMap();
// register routes
const mall = require('./routers/mall');
const user = require('./routers/user');
const good = require('./routers/good');
const chat = require('./routers/chat');

app.use(mall.routes());
app.use(user.routes());
app.use(good.routes());
app.use(chat.koa.routes());

app.ws.use(chat.wss.routes());

// start koa server
app.listen(config.listenPort);



console.log(`app started at port ${config.listenPort}...`);