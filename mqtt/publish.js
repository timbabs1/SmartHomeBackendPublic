/*Publish will send data to the MQTT broker when changes have been received and determined from the frontend*/

const mqttURL = "mqtt.coventry.ac.uk";
const fs = require("fs")
const mqtt = require("mqtt")
const path = require("path")

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
        client.publish("302CEM/Horse/Requests/AutoLight", "0"); //Needs to be the data received from the front end.
        client.publish("302CEM/Horse/Requests/AutoLight", jsonMessage.Light_status.toString()); //Needs to be the data received from the front end.
        console.log("Light status Published.")

    // Format required for temp { \"Target_temperature\": \"25\" }.
    }else if ('Target_Temperature' in jsonMessage && message.toString().length > 0){
        jsonMessage = JSON.parse(message)
        client.publish("302CEM/Horse/Requests/TemperatureSensor/AutoTempManagement", "0"); //Needs to be the data received from the front end.
        client.publish("302CEM/Horse/Requests/TemperatureSensor/TargetTemperature", jsonMessage.Target_Temperature.toString()); //Needs to be the data received from the front end.
        console.log("Target Temperature Published.")

    // Format required from front end { \"LightSetting": \"<value>\", \"Room\": <value> }
    }else if ('LightSetting' in jsonMessage && message.toString().length > 0){
        jsonMessage = JSON.parse(message)
        client.publish("302CEM/Horse/Requests/AutoLight/Slider", jsonMessage.toString()); //Needs to be the data received from the front end.
        console.log("Brightness Setting Published.")

    // Format required from front end { \"AlarmActivatationState": \"<value>\"}
    }else if ('AlarmActivationState' in jsonMessage && message.toString().length > 0){
        jsonMessage = JSON.parse(message)
        client.publish("302CEM/Horse/Requests/HomeSecurity/IntruderAlarm", jsonMessage.AlarmActivationState.toString()); //Needs to be the data received from the front end.
        console.log("Intruder Alarm Activation Status Published.")

    // Format required from front end { \"IntruderStatus": \"<value>\"}
    }else if ('IntruderStatus' in jsonMessage && message.toString().length > 0){
        jsonMessage = JSON.parse(message)
        client.publish("302CEM/Horse/Requests/HomeSecurity/AcknowledgeIntruderEvent", jsonMessage.IntruderStatus.toString()); //Needs to be the data received from the front end.
        console.log("Intruder Status Published.")

    // Format required from front end "{\"SetMotionDetectionState\": <value> }" 
    }else if ('SetMotionDetectionState' in jsonMessage && message.toString().length > 0){
        jsonMessage = JSON.parse(message)
        client.publish("302CEM/Horse/Requests/HomeSecurity/MotionSensorForIntruderAlarm", jsonMessage.SetMotionDetectionState.toString()); //Needs to be the data received from the front end.
        console.log("Set motion detection state for alarm published.")

    // Format required from front end "{\"Silent_status\": <value> }"
    }else if ('Silent_status' in jsonMessage && message.toString().length > 0){
        jsonMessage = JSON.parse(message)
        client.publish("302CEM/Horse/Requests/HomeSecurity/SilentStatus", jsonMessage.SetMotionDetectionState.toString()); //Needs to be the data received from the front end.
        console.log("Intruder Status Published.")
        
    // Format required from front end "{\"Clear_intruder_event\": <value> }" 
    }else if ('Clear_intruder_event' in jsonMessage && message.toString().length > 0){
        jsonMessage = JSON.parse(message)
        client.publish("302CEM/Horse/Requests/HomeSecurity/ClearIntruderEvent", jsonMessage.ClearIntruderEvent.toString()); //Needs to be the data received from the front end.
        console.log("Clearing the intruder event published.")

    }else{
        console.log("Unknown Topic")
    }
}