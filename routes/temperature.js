const Router = require('koa-router');
const router = new Router();
const temperature = require('../models/temperature')
const publish = require('../mqtt/publish')


/*The path to a constant connection. Incoming connections can be specifically tagged to target different routes to get different functionalities*/
router.all('/requesttemp', async function (ctx) { //When sent to server from frontend using the /requestlight route. 

  let data = {}
    data.currentState = await temperature.currentState();
    data.predictedTurnOnDay = await temperature.turnOnTimeDay("Bedroom");
    data.predictedTurnOnNight = await temperature.turnOnTimeNight("Bedroom");
    ctx.websocket.send(JSON.stringify(data))

  /*Sends the data to the front end via websocket, extracts latest values, then sends every 20 seconds*/
  let interval = setInterval(async () => {
    let data = {}
    data.currentState = await temperature.currentState();
    data.predictedTurnOnDay = await temperature.turnOnTimeDay("Bedroom");
    data.predictedTurnOnNight = await temperature.turnOnTimeNight("Bedroom");
    return ctx.websocket.send(JSON.stringify(data))
  }, 5000);

  const topic = "302CEM/Horse/Requests/Temperature" //topic to send requests for lights.
  await ctx.websocket.on('message', async function (message) { //Message received, run this function.
    if (message === "\"close\"") {
      ctx.websocket.send("Closing Websocket")
      ctx.websocket.close()
      clearInterval(interval)//Closes the connection, best to send "close" when navigating from page on front end.
    } else if (message === "\"logs\"") { //Send a request that simply states logs.
      let data = await temperature.logRequest()
      ctx.websocket.send(JSON.stringify(data))
    } else if(message != "\"logs\"" || message != "\"close\"") {
      console.log("publishing")
      /*{\"Room\": \"roomName\",  //Data format.
        \"Target_Temperature\": \"<value>\", 
        \"Temperature\":\"<value>\"}*/
      //Step 1. fill the log table.
      //Step 2. send the data to the mqtt server.
      //Need method here to handle the incoming data. This will be request based and fill in the LOG table with FE requests.
      await publish.publishData(topic, message) //Received message on websocket so publish it.
    }
  });
});

module.exports = router