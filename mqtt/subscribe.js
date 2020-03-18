/*Subscribe*/
const fs = require("fs")
const mqtt = require("mqtt");
const mqttURL = "mqtt.coventry.ac.uk";
const path = require("path")
const lightsModel = require("../models/lights")
const temperatureModel = require("../models/temperature")

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
    if (topic === "302CEM/Horse/Readings/AutoLight") {
      if (await lightsModel.processTopic(jsonMessage) === "Change") {
        console.log("Changed")
      } else {
        console.log("message data: " + message.toString());
      }
    } else if (topic === "302CEM/Horse/Readings/TemperatureSensor") {
      if (await temperatureModel.processTopic(jsonMessage) === "Change") {
        console.log("Changed")
      } else {
        console.log("message data: " + message.toString());
      }
    } else {
      console.log("Unknown Topic. " + "Topic: " + topic.toString() + " Message: " + message.toString())
    }
  })
}
