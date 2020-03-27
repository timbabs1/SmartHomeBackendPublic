const Koa = require('koa')
const socket = require('koa-websocket');
const chalk = require('chalk')
const cors = require('@koa/cors')
const lights = require('./routes/lights')
const alarm = require('./routes/alarm')
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
app.ws.use(alarm.routes())

app.listen(port, () => {
    console.log(`Server running on ${chalk.green(port)}`)
})

// Start Subscriptions
subscribe.subscribeToData(chalk.blue("302CEM/Horse/Readings/#"))