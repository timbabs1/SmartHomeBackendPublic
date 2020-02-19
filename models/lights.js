const mysql = require('promise-mysql')
const info = require('../config')

/*Process data coming in on lights topic*/
exports.processTopic = async (message) => {
    messageParsed = JSON.parse(message)
    try {
            const connection = await mysql.createConnection(info.config);
            let sql = `SELECT value FROM state WHERE value = '${messageParsed.Light_Status}'`;
            let data = await connection.query(sql);   //wait for the async code to finish
            await connection.end();//wait until connection to db is closed
            if(data[0].value === messageParsed.Light_Status)
                return "No Change"
            else{
                return "Changed"
            } 
    } catch (error) {
        if (error.status === undefined)
            error.status = 500;
        //if an error occured please log it and throw an exception
        throw error
    }
}
