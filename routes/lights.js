const Router = require('koa-router');
const router = new Router();
const publish = require('../models/publish')

/*The path to a constant connection. Incoming connections can be specifically tagged to target different routes to get different functionalities*/
router.all('/lights', function (ctx) { //When sent to server from frontend using the / route. 
  setInterval(function () { ctx.websocket.send(`Hello World, Hello World`) }, 10000) //Sends data to the front end every 10 seconds.

  ctx.websocket.on('message', async (message) => { //Message received, run this function.
    const topic = "302cem/horse/request/lights"
    if (message === "close") {
      ctx.websocket.close() //Closes the connection, best to send "close" when navigating from page on front end.
    } else { /*Some function call from models here needs to determine what to do with the data if not close i.e check DB for matching state etc. */
      console.log(message); //Display message sent from client.
      publish.publishData(topic) //Received message on websocket so publish it.
    }
  });
});

module.exports = router;