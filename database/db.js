

const mysql = require('promise-mysql');

const info = require('./config');




/**DB Creation*/

exports.createDatabase = async () => {

    const connection = await mysql.createConnection({

        host: "localhost",

        user: "root",

        password: ""

    })

    await connection.query("CREATE DATABASE IF NOT EXISTS agile")

    connection.end()

    return "created successfully";

}

/**Table creation.*/

exports.createTables = async () => {

    try {

        const connection = await mysql.createConnection(info.config);
        let sql = `CREATE TABLE IF NOT EXISTS light ( 
            ID INT NOT NULL AUTO_INCREMENT,
            Room TEXT, 
            DateTime DATETIME, 
            Action TINYINT, 
            Brightness INT,                              
            PRIMARY KEY (ID) 

        )`;

        await connection.query(sql)

        sql = `CREATE TABLE IF NOT EXISTS lightstate(
            ID INT NOT NULL AUTO_INCREMENT,
            Room TEXT,
            CurrentState TINYINT,
            PRIMARY KEY(ID)
        )`;

        await connection.query(sql)

        sql = `CREATE TABLE IF NOT EXISTS alarmlog ( 
            ID INT NOT NULL AUTO_INCREMENT, 
            DateTime DATETIME,
            FrontDoorStatus TINYINT,
            BackDoorStatus TINYINT,
            IntruderStatus TINYINT,
            AlarmActivationState TINYINT,
            Event TEXT,                             
            PRIMARY KEY (ID) 

        )`;

        await connection.query(sql)

        sql = `CREATE TABLE IF NOT EXISTS alarmstate(
            ID INT NOT NULL AUTO_INCREMENT,
            FrontDoorStatus TINYINT,
            BackDoorStatus TINYINT,
            IntruderStatus TINYINT,
            AlarmActivationState TINYINT,
            SilentAlarmStatus TINYINT,
            PRIMARY KEY(ID)
        )`;

        await connection.query(sql)

        sql = `SELECT * FROM alarmstate`;

        let result = await connection.query(sql);

        if(result.length === 0){
           sql = `INSERT INTO alarmstate(FrontDoorStatus, BackDoorStatus, IntruderStatus, AlarmActivationState, SilentAlarmStatus) 
            VALUES('0', '0', '0', '0', '0')`;
            await connection.query(sql); 
        }
        

        /*Used for all the primary functionalities for temp*/
        /*one line for each room*/
        sql = `CREATE TABLE IF NOT EXISTS temperature ( 
            ID INT NOT NULL AUTO_INCREMENT,
            Room TEXT,
            Setting TINYINT,
            Temperature INT, 
            Target_Temperature INT,  
            PRIMARY KEY (ID) 
        
        )`;
        
        await connection.query(sql)

        /*Stores the logs of changes*/
        sql = `CREATE TABLE IF NOT EXISTS temperaturelog (  
            ID INT NOT NULL AUTO_INCREMENT,  
            Room TEXT,
            DateTime DATETIME, 
            Setting TEXT,
            Duration INT,
            Temperature INT,
            Target_Temperature INT,
            PRIMARY KEY (ID)
        
        )`;

        await connection.query(sql)

        sql = `SELECT * FROM lightstate`;

        result = await connection.query(sql);

        /*Insert the appropriate device types into the devices table. This is to provide reference for post login*/
        if (result.length === 0) {
            const rooms = ['Bedroom', 'kitchen', 'bathroom']
            const state = [0,0,0]
            for (let i = 0; i < rooms.length; i++) {
                sql = `INSERT INTO lightstate(Room, CurrentState) 
            VALUES('${rooms[i]}', '${state[i]}')`;

                await connection.query(sql);
            }
        }

        sql = `SELECT * FROM temperature`;

        result = await connection.query(sql);

        /*Insert the appropriate device types into the devices table. This is to provide reference for post login*/
        if (result.length === 0) {
            const rooms = ['Bedroom', 'kitchen', 'bathroom']
            const state = [0,0,0]
            for (let i = 0; i < rooms.length; i++) {
                sql = `INSERT INTO temperature(Room, Temperature, Target_Temperature) 
            VALUES('${rooms[i]}', '${state[i]}', '${state[i]}')`;

                await connection.query(sql);
            }
        }

        connection.end()

        return "created successfully";


    } catch (error) {

        console.log('error', error.message, error.stack);

    }

} 