console.log('Information.js');
const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const PasswordReal = process.env['Password'];
const { MessageActionRow, PermissionsBitField, MessageInput } = require('discord.js');

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('information')
		.setDescription('get information (password locked)')
        .addStringOption(option =>
            option
              .setName('password')
              .setDescription('give password')
              .setRequired(true)
          ),
	async execute(interaction) {

    const password = interaction.options.getString('password');
    if (password == PasswordReal) {
      await interaction.reply({content:'[ https://find-and-update.company-information.service.gov.uk/company/05927579/filing-history ] KIFARU TRAVEL LIMITED DOCUMENTS\nName : Grant Micheal Bowdery\nBorn in : 12 April 1977, In : Johannesburg!', ephemeral: true });
    }else{
      await interaction.reply({content:'Invalid!', ephemeral: false });
    }
	},
};
