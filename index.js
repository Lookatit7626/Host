const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios');

const { Worker, isMainThread, parentPort } = require('worker_threads');

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var alreadyping = false

if (isMainThread) {
  const worker = new Worker(__filename);

  // Ministry of Foregin Affairs
  worker.on('message', (message) => {
    console.log(`Received message from Embassy (Server): ${message}`);
  });

  // Homeland
  console.log("Starting server...")

  const app = express()

  app.use(bodyParser.urlencoded({ extended: false }))

  app.get('/', function (req, res) {
    const body = req.body.Body
    res.set('Content-Type', 'text/plain')
    res.send(`Node js server 1`)
  })

  app.get('/ping', function (req, res) {
    const body = req.body.Body
    res.set('Content-Type', 'text/plain')
    res.send(`Sending ping to server 2`)
    worker.postMessage('ping');
  })

  app.post('/playerRank', function (req, res, arg1) {
    const body = req.body.Body
    res.send(`Sending ping to server 2`)
  })
      
  app.listen(3000, function (err) {
    if (err) {
      throw err
  }
  console.log('Server started on port 3000')
  })

  worker.postMessage('ping');
} else {
  // Embassy
  parentPort.on('message', (message) => {
    if (message == "Test") {
        console.log("Message")
    }  
    else if (message == "ping") {
      function Pcall(Function) {
        try{
          Function()
        } catch(e) {
          console.log(`An unexpected error has occured: ${e}`)
        }
      }
      
      var newDate = new Date();
      console.log(newDate)
      try{
        axios.get('https://server-3-public-administration.mamajoe5.repl.co/')
      } catch(e) {
        console.log(e)
      }
      try {
        axios.get('https://operation-auxiliary-public-service.mamajoe5.repl.co/')
      } catch(e) {
        console.log(e)
      };
      try {
        axios.get('https://ingolia-internal-administration-service.mamajoe5.repl.co/')
      } catch(e) {
        console.log(e)
      };
      wait(1500).then(() => {
        axios.get('https://server-2-javascript.mamajoe5.repl.co/ping')
      })
    }
    parentPort.postMessage('Success');
  });
}
