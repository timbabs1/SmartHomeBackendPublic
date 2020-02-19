

const mysql = require('promise-mysql');

const info = require('../config');




/**DB Creation*/

exports.createDatabase = async () => {

    const connection = await mysql.createConnection({

        host: "Localhost",

        user: "root",

        password: "Horse"

    })




    await connection.query("CREATE DATABASE IF NOT EXISTS Agile")

    connection.end()

}

/**Table creation.*/

exports.createTables = async () => {

    try {

        const connection = await mysql.createConnection(info.config);
        let sql = `CREATE TABLE IF NOT EXISTS light ( 

                Room VARCHAR64, 

                Date/Time DATETIME, 

                Action TINYINT1, 

                Brightness INT9,                              

                PRIMARY KEY (Room) 

            )`;

        await connection.query(sql)

        let sql = `CREATE TABLE IF NOT EXISTS lightstate ( 

                Room VARCHAR64, 

                CurrentState TINYINT1,                              

                PRIMARY KEY (Room), 

                FOREIGN KEY (Room) REFERENCES light(Room), 

            )`;

        await connection.query(sql)


        return { message: "created successfully" };


    } catch (error) {

        console.log('error', error.message, error.stack);

    }

} 