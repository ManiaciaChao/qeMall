const Koa = require('koa'); // import as a class
const koaBody = require('koa-body');
const mongoose = require('mongoose');

global.config = require('./controllers/configLoader');
console.log("config.json loaded.")

mongoose.connect(config.dbURI, { useNewUrlParser: true }).then(
    () => { console.log('Database connection established!') },
    err => { /** handle initial connection error */ }
);

const app = new Koa();
app.use(koaBody());

app.use(async (ctx, next) => {
    let startTime = Date.now();
    await next();
    let processTime = Date.now() - startTime;
    console.log(`${ctx.method} ${ctx.url} in ${processTime}ms`);
});

const mall = require('./routers/mall');
const user = require('./routers/user');
const good = require('./routers/good');
app.use(mall.routes());
app.use(user.routes());
app.use(good.routes());

app.listen(config.listenPort);
console.log(`app started at port ${config.listenPort}...`);