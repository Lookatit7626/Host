console.log('index.js');

import { setTimeout } from "timers/promises";
const bodyParser = require('body-parser');
const axios = require('axios');
const express = require('express');
const mySecret = process.env['Token'];

/*
const Twit = require('twit');

const twitterConfig = {
  consumer_key: process.env['CONSUMERAPIKEY'],
  consumer_secret: process.env['CONSUMERAPIKEYSECRET'],
  access_token: process.env['ACCESSTOKEN'],
  access_token_secret: process.env['ACCESSTOKENSECRET'],
};

const discordWebhookUrl = process.env['WEBHOOKAPI'];
const twitterClient = new Twit(twitterConfig);

const stream = twitterClient.stream('statuses/filter', { follow: '@TODAYonline' });

stream.on('tweet', (tweet) => {
  const tweetUrl = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
  
  // Send the tweet URL to Discord webhook
  axios.post(discordWebhookUrl, { content: tweetUrl })
    .then(() => console.log('Tweet URL sent to Discord'))
    .catch((error) => console.error('Error sending tweet URL to Discord:', error));
});

// Log errors
stream.on('error', (error) => {
  console.error('Twitter stream error:', error);
});
*/

const app = express();
const port = 8080;
var AllCommand = "Nil";

let ListofPeople = [
];

function AddingPeople(Name,Command) {
  ListofPeople.push({
    Name: Name,
    Command: Command,
  });
}

function error403(res) {
  res.status(403).sendFile('error403.html', { root: __dirname });
};

function error404(res) {
  res.status(404).sendFile('error404.html', { root: __dirname });
};

function error500(res) {
  res.status(500).sendFile('error500.html', { root: __dirname });
};

const removePersonByName = (name) => {
  ListofPeople = ListofPeople.filter(person => person.Name !== name);
};

const findPersonByName = (Name) => {
  return ListofPeople.find(person => person.Name === Name);
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  const data = { message: 'GET request received successfully!' };
  res.json(data);
});

app.post('/post/GetMessage', async (req, res) => {
  try {
      const { Name } = req.body;
      const targetPerson = findPersonByName(Name)
      if (AllCommand != "") {
        res.send(AllCommand)
        console.log("Sent a All command");
      }else if (!targetPerson) {
        res.send("nil")
      } else {
        const CommandMessage = targetPerson.Command;
        removePersonByName(Name)
        res.send(CommandMessage)
      }

  } catch (error) {
      console.error('An error occurred while receiving data!', error);
      res.status(500).json("An error has occurred while receiving data! (Bad argument)");
  }
});

app.get('/post/GetMessage', async (req, res) => {
  error403(res)
});

app.post('/post/AddMessage', async (req, res) => {
  try {
      const { Name, Command } = req.body;
      const targetPerson = findPersonByName(Name);
      if (targetPerson == "All") {
        AllCommand = Command
        res.send("Added Player command message!");
        console.log("Added Command")
        await setTimeout(5000);
        console.log("Removed Command")
        AllCommand = ""
      }else if (!targetPerson) {
        AddingPeople(Name, Command);
        res.send("Added Player command message!");
      } else {
        removePersonByName(Name);
        AddingPeople(Name, Command);
        res.send("Changed Player command message!");
      }

  } catch (error) {
      console.error('An error occurred while receiving data!', error);
      res.status(500).json("An error has occurred while receiving data! (Bad argument)");
  }
});

app.get('/post/AddMessage', async (req, res) => {
  error403(res)
});

app.use((req, res, next) => {
  error404(res)
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const { exec } = require("child_process");
const fs = require('node:fs');
const path = require('node:path');
const { ActivityType, Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ]
})

SetStatMode = 3
SetActMode = 1
Description = "you sleep :)"

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, () => {
	console.log('Reloading Slash applications...');
  
  exec("node deploy-commands.js", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: \n${stdout}`);
  });
  switch(SetActMode) {
  case 1:
    client.user.setActivity(Description, { type: ActivityType.Watching     });
    break;
  case 2:
    client.user.setActivity(Description, { type: ActivityType.Listening     });
    break;
  default:
    client.user.setActivity(Description, { type: ActivityType.Competing    });
  }
  switch(SetStatMode) {
  case 1:
    client.user.setStatus('online');
    break;
  case 2:
    client.user.setStatus('idle');
    break;
  case 3:
    client.user.setStatus('dnd');
    break;
  default:
    client.user.setStatus('invisible');
  }
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// Log In our bot
client.login(mySecret);
