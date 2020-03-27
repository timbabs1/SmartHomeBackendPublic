const mysql = require('promise-mysql')
const info = require('../database/config')

/*Process data coming in on lights topic*/
exports.processTopic = async (message) => {
    try {
        if ('Light_status' in message) {
            const connection = await mysql.createConnection(info.config);
            let sql = `SELECT CurrentState FROM lightstate Where Room = '${message.Room}'`;
            let data = await connection.query(sql);   //wait for the async code to finish
            //console.log(data[0])
            await connection.end(); //wait until connection to db is close.
            if (data[0].CurrentState === message.Light_status) {
                console.log("No Change")
                return "No Change"
            } else {
                //Update the record to be the new value. 
                //Need Room and State in following format e.g "{\"Room\": \"bedroom\", \"Light_status\": 0}"
                await updateRecord(message.Light_status, message.Room)
                return "Changed"
            }
        }else{
            console.log("Unknown light data sent from microcontroller")
        }

    } catch (error) {
        if (error.status === undefined)
            error.status = 500;
        //if an error occured please log it and throw an exception
        throw error
    }
}

async function updateRecord(value, room) {
    const connection = await mysql.createConnection(info.config)
    console.log(value + " " + room)
    let sql = `UPDATE lightstate SET CurrentState = '${value}' WHERE Room = '${room}'`; //Set the updated value in the DB.
    await connection.query(sql);
    await connection.end();
    await storeRecord(value, room)
}

/*Stores record of change when confirmed change has happened by the microcontroller, in this case, 0 to 9 for power setting.*/
async function storeRecord(value, room) {
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
    let sql = `INSERT INTO light(Room, DateTime, Brightness) VALUES('${room}', '${dateAndTimeFormatting}', '${value}')`;
    await connection.query(sql);
}

exports.lightCurrentState = async function () {
    const connection = await mysql.createConnection(info.config);
    let sql = `SELECT * FROM lightstate`;
    let data = await connection.query(sql);   //wait for the async code to finish
    await connection.end();//wait until connection to db is closed
    return data
}

exports.logRequest = async function () {
    console.log("Log request")
    const connection = await mysql.createConnection(info.config);
    let sql = `SELECT * FROM light`; //Grabs all data from temperaturelog table and sends it.
    let data = await connection.query(sql);   //wait for the async code to finish.
    await connection.end();//wait until connection to db is closed
    return data
}