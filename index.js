const bodyParser = require('body-parser');
const express = require('express');
const { Pool } = require('pg');

const connectionString = process.env.TestProGresPost1Link;

const pool = new Pool({
    connectionString: connectionString,
});

async function doesTableExist(tableName) {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT EXISTS (
                SELECT 1
                FROM   information_schema.tables
                WHERE  table_name = $1
            );`,
            [tableName]
        );
        return result.rows[0].exists;
    } finally {
        client.release();
    }
}

async function createPlayersTable() {
    const client = await pool.connect();
    try {
        const tableExists = await doesTableExist("playerdata");
        if (!tableExists) {
            const createTableQuery = `
                CREATE TABLE playerdata (
                    PlayerName VARCHAR,
                    Password VARCHAR,
                    Data VARCHAR,
                    HWID VARCHAR
                );
            `;
            await client.query(createTableQuery);
            console.log('The "playerdata" table has been created successfully.');
        } else {
            console.log('The "playerdata" table already exists.');
        }
    } finally {
        client.release();
    }
}

createPlayersTable().catch((error) => {
    console.error('Error checking or creating "playerdata" table:', error);
});

async function getPlayerDataByName(playerName) {
    const client = await pool.connect();
    try {
        const selectQuery = `
            SELECT *
            FROM playerdata
            WHERE PlayerName = $1;
        `;
        const result = await client.query(selectQuery, [playerName]);
        if (result.rows.length === 0) {
            console.log('Fail-SPLIT-No player data found for the specified name.');
            return 'fail-SPLIT-No player data found for the specified name.';
        } else {
            console.table(`Success-SPLIT-${result.rows}`);
            return `Success-SPLIT-${JSON.stringify(result.rows)}`;
        }
    } finally {
        client.release();
    }
}

async function getPlayerPassword(playerName) {
    const client = await pool.connect();
    try {
        const selectQuery = `
            SELECT Password
            FROM playerdata
            WHERE PlayerName = $1;
        `;
        const result = await client.query(selectQuery, [playerName]);
        if (result.rows.length === 0) {
            console.log('Fail-SPLIT-No player data found for the specified name.');
            return 'fail-SPLIT-No player data found for the specified name.';
        } else {
            console.table(`Success-SPLIT-${result.rows}`);
            return `Success-SPLIT-${result.rows[0].password}`;
        }
    } finally {
        client.release();
    }
}

async function doesPlayerExist(playerName) {
    const client = await pool.connect();
    try {
        const selectQuery = `
            SELECT EXISTS (
                SELECT 1
                FROM playerdata
                WHERE PlayerName = $1
            );
        `;
        const result = await client.query(selectQuery, [playerName]);
        return result.rows[0].exists;
    } finally {
        client.release();
    }
}

async function checkDuplicateHWID(HWIDToCheck) {
    const client = await pool.connect();
    try {
        const selectQuery = `
            SELECT HWID, COUNT(HWID) AS nameCount
            FROM playerdata
            WHERE HWID = $1
            GROUP BY HWID
            HAVING COUNT(HWID) > 3;
        `;
        const result = await client.query(selectQuery, [HWIDToCheck]);
        console.table(result.rows);
        return result.rows.length > 0;
    } finally {
        client.release();
    }
}

async function createPlayerData(playerName, password, data, HWID) {
    const client = await pool.connect();
    try {
        // Check if the HWID limit is exceeded
        const isExceededLimit = await checkDuplicateHWID(HWID);

        // Check if the player name already exists
        const doesExist = await doesPlayerExist(playerName);

        if (isExceededLimit || doesExist) {
            // Return a response indicating the error
            const errorMessage = isExceededLimit
                ? "Exceeded HWID limit"
                : "Player with the same name already exists.";
            console.log(errorMessage);
            return errorMessage;
        }

        // If conditions are met, proceed with creating player data
        const insertQuery = `
            INSERT INTO playerdata (PlayerName, Password, Data, HWID)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const result = await client.query(insertQuery, [playerName, password, data, HWID]);
        console.table(result.rows);

        // Return a success message or data if needed
        return `Player data created successfully: ${JSON.stringify(result.rows)}`;
    } finally {
        client.release();
    }
}

const app = express();
const port = 4000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/data/post/playerdata', async (req, res) => {
    try {
        const { Name, Password } = req.body;
        const exists = await doesPlayerExist(Name);

        if (exists) {
            const PlayerDataPassword = await getPlayerPassword(Name);

            if (Password !== PlayerDataPassword) {
                res.json("403, Invalid credentials... please relogin to your account!");
            } else {
                const PlayerData = await getPlayerDataByName(Name);
                res.json(PlayerData);
            }
        } else {
            res.json("Player does not exist!");
        }
    } catch (error) {
        console.error('An error occurred while receiving data!', error);
        res.status(500).json("An error has occurred while receiving data! (Bad argument)");
    }
});

app.post('/data/post/createprofile', async (req, res) => {
    try {
        const { Name, Password, HWID } = req.body;

        const results = await createPlayerData(Name, Password, '', HWID);

        if (results === "Exceeded HWID limit") {
            res.status(200).json("exceeded HWID limit");
        } else if (results === "Player with the same name already exists.") {
            res.status(200).json("Must not be used before");
        }

        console.log(`Name : ${Name}, Password ${Password}`);
    } catch (error) {
        console.error(error);
        res.status(500).json("An error has occurred while creating a profile!");
    }
});

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

app.use((req, res, next) => {
    error404(res)
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
