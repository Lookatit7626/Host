console.log('index.js');

const bodyParser = require('body-parser');
const express = require('express');
const mySecret = process.env['Token'];

const app = express();
const port = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  const data = { message: 'GET request received successfully!' };
  res.json(data);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

const { exec } = require("child_process");
const fs = require('node:fs');
const path = require('node:path');
const { ActivityType, Client, Collection, Events, GatewayIntentBits } = require('discord.js');

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
