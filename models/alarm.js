const mysql = require('promise-mysql')
const info = require('../database/config')

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
    if ('Front_door_status' in message) {
        let sql = `UPDATE alarmstate SET FrontDoorStatus = '${message.Front_door_status}' WHERE ID = '1'`; //Set the updated value in the DB.
        await connection.query(sql);
    } else if ('Back_door_status' in message) {
        let sql = `UPDATE alarmstate SET BackDoorStatus = '${message.Back_door_status}' WHERE ID = '1'`; //Set the updated value in the DB.
        await connection.query(sql);
    } else if ('Intruder_alarm' in message) {
        let sql = `UPDATE alarmstate SET AlarmActivationState = '${message.Intruder_alarm}' WHERE ID = '1'`; //Set the updated value in the DB.
        await connection.query(sql);
    } else if ('Intruder_event' in message) {
        let sql = `UPDATE alarmstate SET IntruderStatus = '${message.Intruder_event}' WHERE ID = '1'`; //Set the updated value in the DB.
        await connection.query(sql);
    }
    await connection.end();
    await storeRecord(message)
}

/*Stores record of change when confirmed change has happened by the microcontroller, in this case, 0 to 9 for power setting.*/
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
    } else if ('Back_door_status' in message) {
        let sql = `INSERT INTO alarmlog(DateTime, FrontDoorStatus, BackDoorStatus, IntruderStatus, AlarmActivationState, Event) 
        VALUES('${dateAndTimeFormatting}', '0', '${message.Back_door_status}', '0', '0' , 'BackDoorEvent')`;
        await connection.query(sql);
    } else if ('Intruder_alarm' in message) {
        let sql = `INSERT INTO alarmlog(DateTime, FrontDoorStatus, BackDoorStatus, IntruderStatus, AlarmActivationState, Event) 
        VALUES('${dateAndTimeFormatting}', '0', '0', '0', '${message.Intruder_alarm}', 'AlarmActivation')`;
        await connection.query(sql);
    } else if ('Intruder_event' in message) {
        let sql = `INSERT INTO alarmlog(DateTime, FrontDoorStatus, BackDoorStatus, IntruderStatus, AlarmActivationState, Event) 
        VALUES('${dateAndTimeFormatting}', '0', '0', '${message.Intruder_event}', '0', 'IntruderEvent')`;
        await connection.query(sql);
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

    let sql = `SELECT FrontDoorStatus, DateTime FROM alarmlog WHERE Event = 'FrontDoorEvent'`; //Grabs all data from temperaturelog table and sends it.
    data.FrontDoorStatus = await connection.query(sql);   //wait for the async code to finish.

    sql = `SELECT FrontDoorStatus, DateTime FROM alarmlog WHERE Event = 'BackDoorEvent'`; //Grabs all data from temperaturelog table and sends it.
    data.BackDoorStatus = await connection.query(sql);

    sql = `SELECT IntruderStatus, DateTime FROM alarmlog WHERE Event = 'IntruderEvent'`; //Grabs all data from temperaturelog table and sends it.
    data.IntruderStatus = await connection.query(sql);

    sql = `SELECT AlarmActivationState, DateTime FROM alarmlog WHERE Event = 'AlarmActivation'`; //Grabs all data from temperaturelog table and sends it.
    data.AlarmActivationState = await connection.query(sql);

    await connection.end();//wait until connection to db is closed
    return data
}