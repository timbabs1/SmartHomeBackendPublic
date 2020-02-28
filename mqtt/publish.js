/*Publish will send data to the MQTT broker when changes have been received and determined from the frontend*/

const mqttURL = "mqtt.coventry.ac.uk";
const fs = require("fs")
const mqtt = require("mqtt")
const path = require("path")
const lightsModel = require("../models/lights")

const options = {
    host: mqttURL,
    port: 8883,
    keepalive: 60,
    protocol: 'mqtts',
    protocolVersion: 4,
    cert: fs.readFileSync(path.resolve(__dirname, "../mqtt.crt")),
    username: "302CEM",
    password: "n3fXXFZrjw"
}

const client = mqtt.connect(mqttURL, options); //Connect to Broker

/* Takes the target topic(String) as argument from the light route*/
exports.publishData = async (topic, message) => {
    if (topic === "302CEM/Horse/Requests/AutoLights") {
        client.publish(topic, message.toString()); //Needs to be the data received from the front end.
        console.log(topic)
    }else{
        console.log("Unknown Topic")
    }
}