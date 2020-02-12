/*Subscribe will collect the data from the Microcontroller via MQTT*/

const fs = require("fs")
const mqtt = require("mqtt");

const topic = "302cem/horse/request/#"; //Will capture everything sent to horse.
const mqttURL = "mqtt.coventry.ac.uk";

const options = {
    host: mqttURL,
    clientId: '302CEM',
    port: 8883,
    keepalive: 60,
    protocol: 'mqtts',
    protocolVersion: 4,
    cert: fs.readFileSync("../mqtt.crt"), //Read the certificate.
    username: "302CEM",
    password: "n3fXXFZrjw"
}

const client = mqtt.connect(mqttURL, options);

/*Connect to topic*/
client.on("connect", async () => {
    client.subscribe(topic); //Becomes subscribed to the topic and listens.
    console.log("Connected and subscribed to topic --> " + topic)
});

/*Message received*/
client.on("message", async (topic, message) => {
    // Needs a function to work out what to do with the data here.
    console.log(topic);
    console.log(message.toString());
})

 