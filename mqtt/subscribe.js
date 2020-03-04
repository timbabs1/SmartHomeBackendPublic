/*Subscribe*/
const fs = require("fs")
const mqtt = require("mqtt");
const mqttURL = "mqtt.coventry.ac.uk";
const path = require("path")
const lightsModel = require("../models/lights")

const options = {
  host: mqttURL,
  clientId: '302CEM',
  port: 8883,
  keepalive: 60,
  protocol: 'mqtts',
  protocolVersion: 4,
  cert: fs.readFileSync(path.resolve(__dirname, "../mqtt.crt")),
  username: "302CEM",
  password: "n3fXXFZrjw"
}

const client = mqtt.connect(mqttURL, options);

exports.subscribeToData = async (topic) => {
  /*Connect to topic*/
  client.on("connect", function () {
    client.subscribe(topic); //Becomes subscribed to the topic and listens.
    console.log("Connected and subscribed to topic --> " + topic)
  });

  /*Message received*/
  client.on("message", async (topic, message) => {
    let jsonMessage = await JSON.parse(message.toString())
    if (topic === "302CEM/Horse/Readings/AutoLights") {
      if (await lightsModel.processTopic(jsonMessage) === "Change") {
        console.log("Changed")
      } else {
        console.log("message data: " + message.toString());
      }
    }if (topic === "302CEM/Horse/Readings/Temperature"){
        //Step 1. fill the log table. Store the requested changes.
        //Step 2. store and update the incoming data. Data will go into the temperature table.
        console.log("Temperature " + message.toString())
    }else {
      console.log("Unknown Topic.")
    }
  })
}
