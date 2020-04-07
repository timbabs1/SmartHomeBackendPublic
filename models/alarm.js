const mysql = require('promise-mysql')
const info = require('../database/config')
const moment = require('moment')

/*Process data coming in on alarm topic*/
exports.processTopic = async (message) => {
    console.log("The message " + JSON.stringify(message))
    try {
        await updateRecord(message)
        return "Updated"
    } catch (error) {
        if (error.status === undefined)
            error.status = 500;
        //if an error occured please log it and throw an exception
        throw error
    }
}
async function updateRecord(message) {
    const connection = await mysql.createConnection(info.config)
    if ('Front_door_status' in message) { //Comes from microcontroller json string
        let sql = `UPDATE alarmstate SET FrontDoorStatus = '${message.Front_door_status}' WHERE ID = '1'`; //Set the updated value in the DB.
        await connection.query(sql);
    } else if ('Back_door_status' in message) { //Comes from microcontroller json string
        let sql = `UPDATE alarmstate SET BackDoorStatus = '${message.Back_door_status}' WHERE ID = '1'`; //Set the updated value in the DB.
        await connection.query(sql);
    } else if ('Intruder_alarm' in message) { //Comes from microcontroller json string
        let sql = `UPDATE alarmstate SET AlarmActivationState = '${message.Intruder_alarm}' WHERE ID = '1'`; //Set the updated value in the DB.
        await connection.query(sql);
    } else if ('Intruder_event' in message) { //Comes from microcontroller json string
        let sql = `UPDATE alarmstate SET IntruderStatus = '${message.Intruder_event}' WHERE ID = '1'`; //Set the updated value in the DB.
        await connection.query(sql);
    }else if ('Silent_status' in message) { //Comes from microcontroller json string
        let sql = `UPDATE alarmstate SET SilentAlarmStatus = '${message.Silent_status}' WHERE ID = '1'`; //Set the updated value in the DB.
        await connection.query(sql);
    }
    await connection.end();
    await storeRecord(message)
}

/*Stores record of change when confirmed change has happened by the microcontroller*/
async function storeRecord(message) {
    /*Generate a date/timestamp */
    let date = new Date();
    let hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    let min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    let sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    let day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    let dateAndTimeFormatting = year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;

    const connection = await mysql.createConnection(info.config)

    if ('Front_door_status' in message) {
        let sql = `INSERT INTO alarmlog(DateTime, FrontDoorStatus, BackDoorStatus, IntruderStatus, AlarmActivationState, Event) 
        VALUES('${dateAndTimeFormatting}', '${message.Front_door_status}', '0', '0', '0', 'FrontDoorEvent')`;
        await connection.query(sql);
        return await connection.end();

    } else if ('Back_door_status' in message) {
        let sql = `INSERT INTO alarmlog(DateTime, FrontDoorStatus, BackDoorStatus, IntruderStatus, AlarmActivationState, Event) 
        VALUES('${dateAndTimeFormatting}', '0', '${message.Back_door_status}', '0', '0' , 'BackDoorEvent')`;
        await connection.query(sql);
        return await connection.end();

    } else if ('Intruder_alarm' in message) {
        let sql = `INSERT INTO alarmlog(DateTime, FrontDoorStatus, BackDoorStatus, IntruderStatus, AlarmActivationState, Event) 
        VALUES('${dateAndTimeFormatting}', '0', '0', '0', '${message.Intruder_alarm}', 'AlarmActivation')`;
        await connection.query(sql);
        return await connection.end();

    } else if ('Intruder_event' in message) {
        let sql = `INSERT INTO alarmlog(DateTime, FrontDoorStatus, BackDoorStatus, IntruderStatus, AlarmActivationState, Event) 
        VALUES('${dateAndTimeFormatting}', '0', '0', '${message.Intruder_event}', '0', 'IntruderEvent')`;
        await connection.query(sql);
        return await connection.end();
    }else{
        console.log("Unknown content published from microcontroller.")
    }
}

exports.alarmCurrentState = async function () {
    const connection = await mysql.createConnection(info.config);
    let sql = `SELECT * FROM alarmstate`;
    let data = await connection.query(sql);   //wait for the async code to finish
    await connection.end();//wait until connection to db is closed
    return data
}

exports.logRequest = async function () {
    console.log("Log request")
    let data = {}
    const connection = await mysql.createConnection(info.config);

    let sql = `SELECT FrontDoorStatus, DateTime FROM alarmlog WHERE Event = 'FrontDoorEvent'`; 
    data.FrontDoorStatus = await connection.query(sql);   //wait for the async code to finish.

    sql = `SELECT FrontDoorStatus, DateTime FROM alarmlog WHERE Event = 'BackDoorEvent'`; 
    data.BackDoorStatus = await connection.query(sql);

    sql = `SELECT IntruderStatus, DateTime FROM alarmlog WHERE Event = 'IntruderEvent'`;
    data.IntruderStatus = await connection.query(sql);

    sql = `SELECT AlarmActivationState, DateTime FROM alarmlog WHERE Event = 'AlarmActivation'`;
    data.AlarmActivationState = await connection.query(sql);

    await connection.end();//wait until connection to db is closed
    return data
}

exports.autoTurnOnTime = async function (){
    let data = {}
    const connection = await mysql.createConnection(info.config);
    let sql = `SELECT DateTime FROM alarmlog where AlarmActivationState = '1' AND Event = 'AlarmActivation'`; //Grabs all data from temperature table and sends it.
    data = await connection.query(sql);   //wait for the async code to finish.
    await connection.end();//wait until connection to db is closed
    let averageDay = await splitTime(data)
    /* let date1 = moment(data[0].DateTime).format('MMMM Do YYYY, h:mm:ss a') */
    return averageDay

}

exports.autoTurnOffTime = async function (){
    let data = {}
    const connection = await mysql.createConnection(info.config);
    let sql = `SELECT DateTime FROM alarmlog where AlarmActivationState = '0' AND Event = 'AlarmActivation'`; //Grabs all data from temperature table and sends it.
    data = await connection.query(sql);   //wait for the async code to finish.
    await connection.end();//wait until connection to db is closed
    //console.log(data)
    let averageDay = await splitTime(data)
    /* let date1 = moment(data[0].DateTime).format('MMMM Do YYYY, h:mm:ss a')
    return date1 */
    return averageDay

}

async function splitTime (dataToSplit){
    let tempHours = ""
    let hours = []
    let mins = []
    let secs = []
    for(let i = 0; i < dataToSplit.length; i++){
        tempHours = JSON.stringify(dataToSplit[i].DateTime)
        hours.push(parseInt(tempHours.substring(12, 14), 10))
        mins.push(parseInt(tempHours.substring(15, 17), 10))
        secs.push(parseInt(tempHours.substring(18, 20), 10))
    }

    return await calculateTime(hours, mins, secs)
}

async function calculateTime (hours,mins,secs){
     // Extract the data from the db for day and night turn on sections.
    // Split the numbers hours, minutes and seconds and store in individual arrays.
    // add all together then divide by number of array length.
    let avgHours = 0
    let avgMins = 0
    let avgSecs = 0

    let data = {}

    for(let i = 0; i < hours.length; i++){
        avgHours += hours[i] 
    }
    for(let i = 0; i < mins.length; i++){
        avgMins += mins[i] 
    }
    for(let i = 0; i < secs.length; i++){
        avgSecs += secs[i] 
    }

    avgHours = parseInt(avgHours / hours.length, 10)
    avgMins = parseInt(avgMins / hours.length, 10)
    avgSecs = parseInt(avgSecs / hours.length, 10)

    data.avgHours = avgHours
    data.avgMins = avgMins
    data.avgSecs = avgSecs
    
    return data
    
}