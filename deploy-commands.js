console.log('slashcommands.js');
const mySecret = process.env['Token']

const { REST, Routes } = require('discord.js');
const fs = require('node:fs');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}
const rest = new REST({ version: '10' }).setToken(mySecret);

const { exec } = require("child_process");

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);
		const data = await rest.put(
			Routes.applicationCommands("1081937404014895104"),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    console.log('Task 1: Reloading slash application finished!')
	} catch (error) {
		console.error(error);
	}
})();
//run node deploy-commands.js  in shell
//743455903797215293
