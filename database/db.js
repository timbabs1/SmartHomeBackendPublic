

const mysql = require('promise-mysql');

const info = require('./config');




/**DB Creation*/

exports.createDatabase = async () => {

    const connection = await mysql.createConnection({

        host: "localhost",

        user: "root",

        password: ""

    })

    await connection.query("CREATE DATABASE IF NOT EXISTS Agile")

    connection.end()

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


        return { message: "created successfully" };


    } catch (error) {

        console.log('error', error.message, error.stack);

    }

} 