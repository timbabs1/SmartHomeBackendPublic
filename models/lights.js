const mysql = require('promise-mysql')
const info = require('../database/config')

/*Process data coming in on lights topic*/
exports.processTopic = async (message) => {
    console.log("The message " + message)
    try {
        const connection = await mysql.createConnection(info.config);
        let sql = `SELECT CurrentState FROM lightstate`;
        let data = await connection.query(sql);   //wait for the async code to finish
        await connection.end();//wait until connection to db is closed

        if (data[0].CurrentState === message.Light_status) {
            console.log("No Change")
            return "No Change"
        } else {
            //Update the record to be the new value. 
            //Need Room and State in following format e.g "{\"Room\": \"bedroom\", \"Light_status\": 0}"
            await updateRecord(message.Light_status, message.Room)
            console.log("Changed")
            return "Changed"
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
    console.log("Updated")
} 