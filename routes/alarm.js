const Router = require('koa-router');
const router = new Router();
const publish = require('../mqtt/publish')


/*The path to a constant connection. Incoming connections can be specifically tagged to target different routes to get different functionalities*/
router.all('/requestalarm', async function (ctx) { //When sent to server from frontend using the /requestlight route. 

  /*Sends the data to the front end via websocket, extracts latest values, then sends every 10 seconds*/
  let interval = setInterval(async () => {
    return ctx.websocket.send("Sending Data")
  }, 10000);

  const topic = "302CEM/Horse/Requests/Alarm" //topic to send requests for lights.
  await ctx.websocket.on('message', async function (message) { //Message received, run this function.
    console.log(message) //Display the current message received via websocket.
    if (message === "close") {
      ctx.websocket.close()
      clearInterval(interval)//Closes the connection, best to send "close" when navigating from page on front end.
    }else if (message != "logs" || message != "close") {
      console.log("publishing")
      publish.publishData(topic, message) //Received message on websocket so publish it.
    }
  });
});

module.exports = router