/*Publish will send data to the MQTT broker when changes have been received and determined from the frontend*/

const mqttURL = "mqtt.coventry.ac.uk";
const fs = require("fs")
const mqtt = require("mqtt");

const options = {
    host: mqttURL,
    port: 8883,
    keepalive: 60,
    protocol: 'mqtts',
    protocolVersion: 4,
    cert: fs.readFileSync("./mqtt.crt"),
    username: "302CEM",
    password: "n3fXXFZrjw"
}

/* Takes the target topic(String) as argument */
exports.publishData = (topic) => {
    const client = mqtt.connect(mqttURL, options); //Connect to Broker
    client.on("connect", () => { //Publish to MQTT
        console.log("In publish function")
        client.publish(topic, "Hello MQTT from NodeJS!"); //Needs to be the data received from the front end.
        client.end();
    })}
