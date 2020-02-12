const Koa = require('koa')
const socket = require('koa-websocket');
const chalk = require('chalk')
const cors = require('@koa/cors')
const lights = require('./routes/lights')


const app = socket(new Koa()); //New socket to communicate on port 8000
const port = 8000

app.use(cors())

// Opens a web socket port to use for communicating with the front end.
app.ws.use(lights.routes())

app.listen(port, () => {
    console.log(`Server running on ${chalk.green(port)}`)
});