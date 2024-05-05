console.log('Dm People.js');
const { GatewayIntentBits,SlashCommandBuilder, ChannelType, PermissionsBitField, Client } = require('discord.js');

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.DirectMessages,
    ]
})

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dm-someone')
		.setDescription('use me to dm someone using their userid')
  .addStringOption(option =>
      option
        .setName('user')
        .setDescription('give me userid')
        .setRequired(true) // You can set this to false if the field is optional
    )
  .addStringOption(option =>
      option
        .setName('message')
        .setDescription('message')
        .setRequired(true) // You can set this to false if the field is optional
    ),
	async execute(interaction) {
  const userId = interaction.options.getString('user');
  const message = interaction.options.getString('message');

    if(!interaction.guild) {
      await interaction.reply({content:'Null', ephemeral: true });
      return "Avoid"
    };
    
    var User = interaction.member
    if (!User.permissions.has(PermissionsBitField.Flags.Administrator))     {
      await interaction.reply({content:'Null', ephemeral: true });
      return "Avoid"
    }//await interaction.reply({content:'teh tarik', ephemeral: true });
    const user = await client.users.fetch(userId, false);

    if (user) {
      await user.send(message);
      await interaction.reply({content:`DM sent to <@${userId}>!`, ephemeral: true });
    } else {
      await interaction.reply({content:`User not Found!`, ephemeral: true });
    }
	},
};
