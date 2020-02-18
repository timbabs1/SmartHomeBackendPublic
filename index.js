const Koa = require('koa')
const socket = require('koa-websocket');
const chalk = require('chalk')
const cors = require('@koa/cors')
const lights = require('./routes/lights')
const subscribe = require('./mqtt/subscribe')

const app = socket(new Koa()); //New socket to communicate on port 8000
const port = 8000

app.use(cors())

// Opens a web socket port to use for communicating with the front end.
app.ws.use(lights.routes())

// Start Subscriptions
subscribe.subscribeToData("302CEM/Horse/Readings/AutoLights")

app.listen(port, () => {
    console.log(`Server running on ${chalk.green(port)}`)
});