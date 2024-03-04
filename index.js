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

const DataScope = "playerdata"

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

async function createPlayersTable() {
    const client = await pool.connect();

    try {
        // Check if the "cars" table exists
        const tableExists = await doesTableExist("playerdata");

        if (!tableExists) {
            // SQL query to create the "cars" table
            const createTableQuery = `
                CREATE TABLE playerdata (
                    PlayerName VARCHAR,
                    Password VARCHAR,
                    Data VARCHAR,
                    HWID VARCHAR,
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
createPlayersTable()
    .catch((error) => {
        console.error('Error checking or creating "playerdata" table:', error);
    });

async function getPlayerDataByName(playerName) {
    const client = await pool.connect();

    try {
        // SQL query to fetch player data based on the name
        const selectQuery = `
            SELECT *
            FROM SELECT PlayerName, Data
            WHERE player_name = $1;
        `;

        // Execute the query with the provided player name as a parameter
        const result = await client.query(selectQuery, [playerName]);

        // Check if the result set is empty
        if (result.rows.length === 0) {
            console.log('Fail-SPLIT-No player data found for the specified name.');
        } else {
            // Display the retrieved player data
            console.table(`Success-SPLIT-${result.rows}`);
        }
    } finally {
        client.release(); // Release the client back to the pool
    }
}

async function getPlayerPassword(playerName) {
    const client = await pool.connect();

    try {
        // SQL query to fetch player data based on the name
        const selectQuery = `
            SELECT *
            FROM SELECT Password
            WHERE player_name = $1;
        `;

        // Execute the query with the provided player name as a parameter
        const result = await client.query(selectQuery, [playerName]);

        // Check if the result set is empty
        if (result.rows.length === 0) {
            console.log('fail-SPLIT-No player data found for the specified name.');
        } else {
            // Display the retrieved player data
            console.table(`success-SPLIT-${result.rows}`);
        }
    } finally {
        client.release(); // Release the client back to the pool
    }
}

async function doesPlayerExist(playerName) {
    const client = await pool.connect();

    try {
        // SQL query to check if the player exists
        const selectQuery = `
            SELECT EXISTS (
                SELECT 1
                FROM playerdata
                WHERE PlayerName = $1
            );
        `;

        // Execute the query with the provided player name as a parameter
        const result = await client.query(selectQuery, [playerName]);

        // The result.rows[0].exists will be true if the player exists, false otherwise
        return result.rows[0].exists;
    } finally {
        client.release(); // Release the client back to the pool
    }
}

async function checkDuplicateHWID(HWIDToCheck) {
    const client = await pool.connect();

    try {
        // SQL query to check if a specific player name has more than three occurrences
        const selectQuery = `
            SELECT HWID, COUNT(HWID) AS nameCount
            FROM playerdata
            WHERE HWID = $1
            GROUP BY HWID
            HAVING COUNT(HWID) > 3;
        `;

        // Execute the query with the provided player name as a parameter
        const result = await client.query(selectQuery, [HWIDToCheck]);

        // Display the result
        console.table(result.rows);

        // Check if the specific player name has more than three occurrences
        const duplicatesExist = result.rows.length > 0;

        if (duplicatesExist) {
            return true
        } else {
            return false
        }
    } finally {
        client.release(); // Release the client back to the pool
    }
}

async function createPlayerData(playerName, password, data, HWID) {
    const client = await pool.connect();

    try {
        // SQL query to insert a new player data entry
        const insertQuery = `
            INSERT INTO playerdata (PlayerName, Password, Data, HWID)
            VALUES ($1, $2, $3, $4)
            RETURNING *;  -- Optional: returns the inserted row
        `;

        // Execute the query with the provided values as parameters
        const result = await client.query(insertQuery, [playerName, password, data, HWID]);

        // Display the inserted player data
        console.table(result.rows);
    } finally {
        client.release(); // Release the client back to the pool
    }
}


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

app.post('/data/post/playerdata', (req, res) => {
    try {
      const { Name, Password } = req.body;
      doesPlayerExist(Name)
        .then((exists) => {
        if (exists) {
            const PlayerDataPassword = getPlayerPassword(Name);
            if (Password !== PlayerDataPassword) {
                res.json("403, Invalid credentials.. please relogin to your account!");
            } else {
                const PlayerData = getPlayerDataByName(Name);
                const SplitedData = PlayerData.split('-SPLIT-');
                if (SplitedData[0] === "fail") {
                    res.json("no data");
                } else {
                    res.json(SplitedData[1]);
                }
            } 
        } else {
            res.json("Player Does not exist!");
        }
        })
        .catch((error) => {
            res.json("an error has occured while receiving data! (Bad argument)");
        });

      
      const responseData = { message: 'POST request received successfully!', Name };
      res.json(responseData);
      console.log(`Name : ${Name}, Password ${Password}`);
    } catch (error) {
      console.log(error);
      const errorNumber = 500; // You can customize this based on your application's error codes
        error500(res);
    }
});

app.post('/data/post/createprofile', (req, res) => {
    try {
      const { Name, Password , HWID} = req.body;
      
      if (checkDuplicateHWID(HWID)) {
          res.json("has two profile");
      } else {
          createPlayerData(Name, Password, '', HWID)
          res.json("created profile");
      }
        
      const responseData = { message: 'POST request received successfully!', Name };
      res.json(responseData);
      console.log(`Name : ${Name}, Password ${Password}`)
    } catch (error) {
      console.log(error)
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
