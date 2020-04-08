const Koa = require('koa')
const socket = require('koa-websocket');
const chalk = require('chalk')
const cors = require('@koa/cors')
const lights = require('./routes/lights')
const alarm = require('./routes/alarm')
const alarmModel = require('./models/alarm')
const temperature = require('./routes/temperature')
const subscribe = require('./mqtt/subscribe')
const publish = require('./mqtt/publish')
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
subscribe.subscribeToData("302CEM/Horse/Readings/#")

/*Start up interval listeners for dynamic changes*/
setInterval(async () => {
    let autoTurnOnTime = await alarmModel.autoTurnOnTime();
    let autoTurnOffTime = await alarmModel.autoTurnOffTime();
    let date = new Date()
    const currentTime = `${date.getHours()}${date.getMinutes()}${date.getSeconds()}`
    let concatenatedOnTimeFromDB = `${autoTurnOnTime.avgHours}${autoTurnOnTime.avgMins}${autoTurnOnTime.avgSecs}`
    let concatenatedOffTimeFromDB = `${autoTurnOffTime.avgHours}${autoTurnOffTime.avgMins}${autoTurnOffTime.avgSecs}`
    const topic = "302CEM/Horse/Requests/Alarm" //topic to send requests for alarm
    if(currentTime === concatenatedOnTimeFromDB){
        console.log("Publishing Auto Alarm State")
        publish.publishData(topic, "{\"AlarmActivationState\": 1}")
    }else if(currentTime === concatenatedOffTimeFromDB){
        publish.publishData(topic, "{\"AlarmActivationState\": 0}")
    }
  }, 1000);