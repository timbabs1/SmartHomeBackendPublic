const Router = require('koa-router');
const router = new Router();
const publish = require('../mqtt/publish')

/*The path to a constant connection. Incoming connections can be specifically tagged to target different routes to get different functionalities*/
router.all('/requestlight', function (ctx) { //When sent to server from frontend using the /requestlight route. 

  //Use functionality within here to send data back every 10 seconds.
  setInterval(async function () {await ctx.websocket.send('Some data from the MQTT subscription')}, 10000)

  const topic = "302CEM/Horse/Requests/AutoLights" //topic to send requests for lights.
  //const topic = "302CEM/Horse/Readings/AutoLight" //Testing receipt of readings.
  ctx.websocket.on('message', function (message) { //Message received, run this function.
    if (message === "close") {
      ctx.websocket.close() //Closes the connection, best to send "close" when navigating from page on front end.
    } else {
      //console.log(message); //Display message sent from client.
      publish.publishData(topic) //Received message on websocket so publish it.
    }
  });
});

module.exports = router;