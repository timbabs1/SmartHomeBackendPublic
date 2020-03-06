const Router = require('koa-router');
const router = new Router();
const publish = require('../mqtt/publish')
const lights = require('../models/lights')


/*The path to a constant connection. Incoming connections can be specifically tagged to target different routes to get different functionalities*/
router.all('/requestlight', async function (ctx) { //When sent to server from frontend using the /requestlight route. 

  /*Sends the data to the front end via websocket, extracts latest values, then sends every 10 seconds*/
  setInterval(async () => {
    let data = await lights.lightCurrentState()
    return ctx.websocket.send(JSON.stringify(data))
  }, 20000);

  const topic = "302CEM/Horse/Requests/AutoLight" //topic to send requests for lights.
  await ctx.websocket.on('message', async function (message) { //Message received, run this function.
    if (message === "close") {
      ctx.websocket.close() //Closes the connection, best to send "close" when navigating from page on front end.
    }else if(message ==="logs") {
      let data = await lights.logRequest()
      ctx.websocket.send(JSON.stringify(data))
      //await function to pull logs.
    }else {
      console.log("publishing")
      publish.publishData(topic, message) //Received message on websocket so publish it.
    }
  });
});


module.exports = router