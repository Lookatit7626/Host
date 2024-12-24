console.log('AddReferral.js');
const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { MessageActionRow, PermissionsBitField, MessageInput } = require('discord.js');

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add-referral')
		.setDescription('only for developers - add a referral')
        .addStringOption(option =>
          option
            .setName('referral-name')
            .setDescription('set referral')
        )
        .addStringOption(option =>
          option
            .setName('expiry')
            .setDescription('set expiry YYYY-MM-DD')
        ),
	async execute(interaction) {

    const ReferralName = interaction.options.getString('referral-name');
    const expiry = interaction.options.getString('expiry');

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
        const TTTTT = process.env['APRPassword']
        axios.post("https://host-e2kt.onrender.com/referral/addreferral", {
            ReferralOwner: ReferralName,
            Expiry: expiry,
            CheckVeri : TTTTT,
          });
          await interaction.reply({content:`Added the referral : ${ReferralName}`, ephemeral: true });
    } catch (error) {
        await interaction.reply({content:'there was an error sending the command!', ephemeral: true });
    }
    //await interaction.reply({content:'teh tarik', ephemeral: true });
	},
};
