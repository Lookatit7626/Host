console.log('purge.js');
const { SlashCommandBuilder } = require('discord.js');
const { MessageActionRow, PermissionsBitField, MessageInput } = require('discord.js');

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('purge')
		.setDescription('Purge the channel messages!')
    .addStringOption(option =>
      option
        .setName('amount')
        .setDescription('Enter the amount to purge')
        .setRequired(true) // You can set this to false if the field is optional
    ),
	async execute(interaction) {

    const amount = interaction.options.getString('amount');

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
    
    if(isNaN(amount) || amount <= 0){
      await interaction.reply({content:'Please give a proper number.', ephemeral: true });
      return "Void"
    }

    await interaction.reply({content:'purging...', ephemeral: true });
    
    try {
      const messages = await interaction.channel.messages.fetch({ limit: amount});
      await interaction.channel.bulkDelete(messages);
      await interaction.followUp({content:`Successfully purge ${amount} of messages.`, ephemeral: true });
    } catch (error) {
      console.error(error);
      await interaction.followUp({content:'An unexpected error has occured', ephemeral: true });
    }
    //await interaction.reply({content:'teh tarik', ephemeral: true });
	},
};
