console.log('CommandPlayer.js');
const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { MessageActionRow, PermissionsBitField, MessageInput } = require('discord.js');

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('do not use me')
        .addStringOption(option =>
            option
              .setName('message')
              .setDescription('message1')
              .setRequired(true)
          )
          .addStringOption(option =>
            option
              .setName('message2')
              .setDescription('message2')
              .setRequired(true)
          ),
	async execute(interaction) {

    const player = interaction.options.getString('message');
    const command = interaction.options.getString('message2');

    if(!interaction.guild) {
      await interaction.reply({content:'It must be in a guild!', ephemeral: true });
      return "Avoid"
    };
    
    var User = interaction.member
    guild = interaction.guild

    Roles = interaction.guild.roles.cache
    const botMember = await guild.members.fetch(guild.members.me.id);
    BotRole = botMember.roles.highest;
    
    if (User.roles.highest.position = BotRole.position && !User.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      await interaction.reply({content:'You must be able to manage messages or have a higher role then me!', ephemeral: true });
      return "Avoid"
    }
    
    try {
        axios.post("https://host-e2kt.onrender.com/post/AddMessage", {
            Name: player,
            Command: command,
          })
          .then((response) => console.log(response.data))
          .then((error) => console.log(error));
          await interaction.reply({content:'hmm (1)', ephemeral: true });
    } catch (error) {
        await interaction.reply({content:'hmm', ephemeral: true });
    }
    //await interaction.reply({content:'teh tarik', ephemeral: true });
	},
};
