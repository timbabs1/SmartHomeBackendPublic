const Koa = require('koa')
const socket = require('koa-websocket');
const chalk = require('chalk')
const cors = require('@koa/cors')
const lights = require('./routes/lights')
const temperature = require('./routes/temperature')
const subscribe = require('./mqtt/subscribe')
const database = require('./database/db')

const app = socket(new Koa()); //New socket to communicate on port 8000
const port = 8000

app.use(cors())

// Database Creation
database.createDatabase()
database.createTables()


// Opens a web socket port to use for communicating with the front end.
app.ws.use(lights.routes())
app.ws.use(temperature.routes())

app.listen(port, () => {
    console.log(`Server running on ${chalk.green(port)}`)
})

let appContext = app.ws.use(function(ctx, next) {
    // return `next` to pass the context (ctx) on to the next ws middleware
    return next(ctx);
  });

// Start Subscriptions
subscribe.subscribeToData("302CEM/Horse/Readings/AutoLights", appContext)