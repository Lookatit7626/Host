console.log('CommandPlayer.js');
const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { MessageActionRow, PermissionsBitField, MessageInput } = require('discord.js');

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('https-command')
		.setDescription('only for developers - used to send commands to https server')
        .addStringOption(option =>
            option
              .setName('referral-name')
              .setDescription('get referral name')
              .setRequired(true)
          )
          .addStringOption(option =>
            option
              .setName('args')
              .setDescription('set arguments')
              .setRequired(true)
          )
          .addStringOption(option =>
            option.setName('enabled')
              .setDescription('enabled or disabled')
              .addChoices(
                { name: 'enabled', value: 'enable' },
                { name: 'disabled', value: 'disable' },
              )
          ),
	async execute(interaction) {

    const player = interaction.options.getString('command');
    const command = interaction.options.getString('args');
    const enabled = interaction.options.getString('enabled');

    if(!interaction.guild) {
      await interaction.reply({content:'It must be in a guild!', ephemeral: false });
      return "Avoid"
    };
    
    var User = interaction.member
    guild = interaction.guild

    Roles = interaction.guild.roles.cache
    const botMember = await guild.members.fetch(guild.members.me.id);
    BotRole = botMember.roles.highest;

    console.log(User.roles.highest.position);
    console.log(BotRole.position);
    
    if (User.roles.highest.position <= BotRole.position) {
      await interaction.reply({content:'403 - Unauthorized access to command!', ephemeral: false });
      return "Avoid"
    }
    
    try {
        axios.post("https://host-e2kt.onrender.com/post/AddMessage", {
            Name: player,
            Command: command,
          });
          await interaction.reply({content:'sent command to server', ephemeral: true });
    } catch (error) {
        await interaction.reply({content:'there was an error sending the command!', ephemeral: true });
    }
    //await interaction.reply({content:'teh tarik', ephemeral: true });
	},
};
