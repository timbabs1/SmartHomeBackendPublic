const Router = require('koa-router');
const router = new Router();
const temperature = require('../models/temperature')
const publish = require('../mqtt/publish')


/*The path to a constant connection. Incoming connections can be specifically tagged to target different routes to get different functionalities*/
router.all('/requesttemp', async function (ctx) { //When sent to server from frontend using the /requestlight route. 

  ctx.websocket.send("Connected To Temp Websocket.")

  /*Sends the data to the front end via websocket, extracts latest values, then sends every 20 seconds*/
  setInterval(async () => {
    let data = await temperature.currentState();
    return ctx.websocket.send(JSON.stringify(data))
  }, 20000);

  const topic = "302CEM/Horse/Requests/Temperature" //topic to send requests for lights.
  await ctx.websocket.on('message', async function (message) { //Message received, run this function.
    console.log(message)
    if (message === "close") {
      ctx.websocket.close() //Closes the connection, best to send "close" when navigating from page on front end.
    }if (message === "logs") { //Send a request that simply states logs.
      let data = await temperature.logRequest()
      ctx.websocket.send(JSON.stringify(data))
    } else {
      console.log("publishing")
      /*{\"Room\": \"roomName\",  //Data format.
        \"Target_Temperature\": \"<value>\", 
        \"Temperature\":\"currentTemp\",
        \"Setting\": \"Day/Night\"}*/
      //Step 1. fill the log table.
      //Step 2. send the data to the backend.
      //Need method here to handle the incoming data. This will be request based and fill in the LOG table with FE requests.
      await publish.publishData(topic, message) //Received message on websocket so publish it.
    }
  });
});


module.exports = router