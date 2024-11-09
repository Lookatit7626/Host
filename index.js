console.log('index.js');

const bodyParser = require('body-parser');
const axios = require('axios');
const express = require('express');
const mySecret = process.env['Token'];
const cron = require('cron');

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
var AllCommand = "";

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

function wait(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
async function RemoveCommand() {
  await wait(8500);
  console.log("Removed Command")
  AllCommand = ""
};

app.post('/post/GetMessage', async (req, res) => {
  try {
      const { Name } = req.body;
      const targetPerson = findPersonByName(Name)
      if (AllCommand != "") {
        res.send(AllCommand)
        console.log("Sent a All command");
        console.log(Name)
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
      if (Name == "All") {
        AllCommand = Command
        console.log(Command)
        res.send("Added Player command message!");
        console.log("Added Command")
        RemoveCommand()
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

var ListOfPeopleThatUsedToday = new Array();

app.get('/post/EnterMessage', async (req, res) => {
  error403(res)
});

app.post('/post/EnterMessage', async (req, res) => {
  const {Name, Executor, CountryCode, Time} = req.body
  try {
    if (ListOfPeopleThatUsedToday[Name] == null){
      ListOfPeopleThatUsedToday[Name] = {
        "executor" : Executor,
        "country" : CountryCode,
        "time" : Time,
      }
      console.log("added player to command")
      res.send("Successfully added it to list!")
    } else {
      res.send("Already added!")
    }
  } catch {
    res.send("There was an error [unexpected]");
  }
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
const { ActivityType, Client, Collection, Events, GatewayIntentBits, EmbedBuilder } = require('discord.js');
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
Description = "Eclipse hub HTTPS server for all API management"

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

function RUNNN() {
  console.log("RUNNNNNN")
  const GUILD_ID = '1229184712413548666';
  const CHANNEL_ID = '1304897042354536510';

  const guild = client.guilds.cache.get(GUILD_ID);
  if (guild) {
      const channel = guild.channels.cache.get(CHANNEL_ID);
      if (channel) {
        
        let ExecutorsNumbers = {};
        let CountriesNumbers = {};

        for (let key in ListOfPeopleThatUsedToday) {
            const executorsss = ListOfPeopleThatUsedToday[key].executor;
            if (ExecutorsNumbers[executorsss] == null) {
                ExecutorsNumbers[executorsss] = 1;
            } else {
                ExecutorsNumbers[executorsss]++;
            }
        }
        
        for (let key in ListOfPeopleThatUsedToday) {
          const executorssss = ListOfPeopleThatUsedToday[key].country;
          if (CountriesNumbers[executorssss] == null) {
              CountriesNumbers[executorssss] = 1;
          } else {
              CountriesNumbers[executorssss]++;
          }
        }

        const embed = new EmbedBuilder()
          .setColor('#030000')
          .setAuthor({ name: 'Daily 12:00H report on ECLIPSE HUB ' })
          .setTitle(`Over ${Object.keys(ListOfPeopleThatUsedToday).length} have used Eclipse hub`)
          //.setFooter({ text: 'Created at : ' })
          //.setTimestamp();
          if (Object.keys(ListOfPeopleThatUsedToday).length == 0) {
            embed.addFields(
              { name: `**Executor : All**`, value: `executed 0 times`, inline: false },
            )
          } else {
            for (const executor in ExecutorsNumbers) {
              {console.log(`Executor "${executor}" executed ${ExecutorsNumbers[executor]} times.`)};
              embed.addFields(
                { name: `**Executor : **${executor}`, value: `executed ${ExecutorsNumbers[executor]} times`, inline: false },
              )
            }
          }
          channel.send({ embeds: [embed] });

          const embed2 = new EmbedBuilder()
          .setColor('#030000')
          .setAuthor({ name: 'Region of use :' })
          //.setTitle(`Over ${ListOfPeopleThatUsedToday.length} have used Eclipse hub`)
          .setFooter({ text: 'Created at : ' })
          .setTimestamp();
          if (Object.keys(ListOfPeopleThatUsedToday).length == 0) {
            embed2.addFields(
              { name: `**Country : All**`, value: `0 people used it`, inline: false },
            )
          } else {
            for (const executor in CountriesNumbers) {
              embed2.addFields(
                { name: `**In **${executor},`, value: `${CountriesNumbers[executor]} people have used it`, inline: false },
              )
            }
          }
          channel.send({ embeds: [embed2] });
      }
  }
  ListOfPeopleThatUsedToday = new Array()
}

let job1 = new cron.CronJob('30 01-59 01-23 * * *', RUNNN); // Please change it to 06:30:00 pls
job1.start();




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
