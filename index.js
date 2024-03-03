// runCommand.js

const { exec } = require('child_process');

// Run the command
exec('npm install body-parser', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});

const bodyParser = require('body-parser');
const express = require('express');
const ping = require('ping');

const targetHost = 'https://azureserv.com/ping/id1?__cpo=aHR0cHM6Ly9lY2xpcHNlLXNlcnZlci5nbGl0Y2gubWU';

var DateAndTime = "";
const app = express();
const port = 3000;

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

function error403(res) {
  res.status(403).sendFile(__dirname + '/error403.html');
};

function error404(res) {
  res.status(404).sendFile(__dirname + '/error404.html');
};

function error500(res) {
  res.status(500).sendFile(__dirname + '/error500.html');
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
    console.log(``);
});
