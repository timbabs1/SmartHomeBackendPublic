/*Subscribe will collect the data from the Microcontroller via MQTT*/

const fs = require("fs")
const mqtt = require("mqtt");
const mqttURL = "mqtt.coventry.ac.uk";
const path = require("path")

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
    client.on("message", function (topic, message) {
        // Needs functionality to work out what to do with the data here.
        console.log(topic);
        console.log("message data: " + message.toString());
    })

}
