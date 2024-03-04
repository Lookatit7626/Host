const bodyParser = require('body-parser');
const express = require('express');
const ping = require('ping');
const { Pool } = require('pg');
const connectionString = `${process.env.TestProGresPost1Link}`;

// Create a new client with the connection string
const pool = new Pool({
    connectionString: connectionString,
});

pool.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

var DateAndTime = "";
const app = express();
const port = 4000;

function wait(sec) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulating a condition that might lead to rejection
            if (sec < 3) {
                reject(new Error('Wait time is too short. Promise rejected.'));
            } else {
                resolve();
            }
        }, sec * 1000);
    });
}

async function doesTableExist(tableName) {
    const client = await pool.connect();

    try {
        // Query the information schema to check if the table exists
        const result = await client.query(
            `SELECT EXISTS (
                SELECT 1
                FROM   information_schema.tables
                WHERE  table_name = $1
            );`,
            [tableName]
        );

        // The result.rows[0].exists will be true if the table exists, false otherwise
        return result.rows[0].exists;
    } finally {
        client.release(); // Release the client back to the pool
    }
}

async function createCarsTable() {
    const client = await pool.connect();

    try {
        // Check if the "cars" table exists
        const tableExists = await doesTableExist('playerdata');

        if (!tableExists) {
            // SQL query to create the "cars" table
            const createTableQuery = `
                CREATE TABLE playerdata (
                    PlayerName VARCHAR(50),
                    model VARCHAR(1000),
                    year INT
                );
            `;

            // Execute the query to create the table
            await client.query(createTableQuery);

            console.log('The "playerdata" table has been created successfully.');
        } else {
            console.log('The "playerdata" table already exists.');
        }
    } finally {
        client.release(); // Release the client back to the pool
    }
}

// Call the function to create the "cars" table
createCarsTable()
    .catch((error) => {
        console.error('Error checking or creating "playerdata" table:', error);
    });

function error403(res) {
  res.status(403).sendFile('./error403.html');
};

function error404(res) {
  res.status(404).sendFile('./error404.html');
};

function error500(res) {
  res.status(500).sendFile('./error500.html');
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    const data = { message: 'GET request received successfully!' };
    res.json(data);
});

app.get('/test/403', (req, res) => {
    error403(res);
});

app.get('/test/404', (req, res) => {
    error404(res);
});

app.get('/test/500', (req, res) => {
    error500(res);
});

app.get('/test/get', (req, res) => {
    const data = { message: 'GET request received successfully!' };
    res.json(data);
});

app.post('/test/post', (req, res) => {
    try {
      
      const receivedData = req.body;
      const responseData = { message: 'POST request received successfully!', receivedData };
      res.json(responseData);
      
    } catch (error) {
      
      const errorNumber = 500; // You can customize this based on your application's error codes
        error500(res)
    }
});

app.post('/data/post/1', (req, res) => {
    try {
      const { Name, Password } = req.body;
      const responseData = { message: 'POST request received successfully!', Name };
      res.json(responseData);
      console.log(`Name : ${Name}, Password ${Password}`)
    } catch (error) {
      console.log(error)
      const errorNumber = 500; // You can customize this based on your application's error codes
        error500(res)
    }
});

app.use((req, res, next) => {
    error404(res)
});

app.listen(port, () => {
    console.log(``);
});
