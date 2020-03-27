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
    let jsonMessage = {}
    if(message.toString().length > 0 && JSON.parse(message)){
        jsonMessage = JSON.parse(message)
    }else{
        console.log("No JSON Received")
    }
    //Format of data required from front end {\"Light_status\" : <value> }.
    if ('Light_status' in jsonMessage && message.toString().length > 0){ // This will send data regarding turning on or off.
        jsonMessage = JSON.parse(message)
        topic === "302CEM/Horse/Requests/AutoLight"
        client.publish(topic, "0"); //Needs to be the data received from the front end.
        client.publish(topic, jsonMessage.Light_status.toString()); //Needs to be the data received from the front end.
        console.log(topic)
    // Format required for temp { \"Target_temperature\": \"25\" }.
    }else if ('Target_temperature' in jsonMessage && message.toString().length > 0){
        jsonMessage = JSON.parse(message)
        client.publish("302CEM/Horse/Requests/TemperatureSensor/AutoTempManagement", "0"); //Needs to be the data received from the front end.
        client.publish("302CEM/Horse/Requests/TemperatureSensor/TargetTemperature", jsonMessage.Target_temperature.toString()); //Needs to be the data received from the front end.
        console.log(topic)
    }else{
        console.log("Unknown Topic")
    }
}