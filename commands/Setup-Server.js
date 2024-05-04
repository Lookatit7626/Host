console.log('Setup-Server.js');
const { GatewayIntentBits,SlashCommandBuilder, ChannelType, PermissionsBitField, Client } = require('discord.js');

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.MessageContent,
    ]
})

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup-server')
		.setDescription('Set-up server, only server owner can use this.'),
	async execute(interaction) {
    if(!interaction.guild) {
      await interaction.reply({content:'Null', ephemeral: true });
      return "Avoid"
    };
    
    var User = interaction.member
    if (!User.permissions.has(PermissionsBitField.Flags.Administrator))     {
      await interaction.reply({content:'Null', ephemeral: true });
      return "Avoid"
    }

    
    //Deletings channels
    guild = interaction.guild
    await interaction.reply({content:'Setting up server...', ephemeral: false });
    channels = interaction.guild.channels.cache
    communityServerBool = interaction.guild.features?.includes('COMMUNITY')
    channels.forEach((channel) => {
      if (communityServerBool) {
        if (channel.id != interaction.guild.publicUpdatesChannelId && channel.id != interaction.guild.rulesChannelId) {
          channel.delete()
        }
      }
      else {
        channel.delete()
      }
    });

    //Deleting Roles
    Roles = interaction.guild.roles.cache
    const botMember = await guild.members.fetch(guild.members.me.id);
    BotRole = botMember.roles.highest;
    Roles.forEach((Role) => {
      if (Role.id !=guild.roles.everyone.id && !Role.bot && Role.position < BotRole.position && !Role.managed) {
      Role.delete()
      }
    });

    //Creating Roles
    guild.roles.create({ name: '[OWNER]',color: '0x027dc4', permissions: [PermissionsBitField.Flags.Administrator] }).then((Role) => {
      Role.setHoist(true);
    });
    
    guild.roles.create({ name: '[ADMINISTRATOR]',color: '0x911300', permissions: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.CreatePublicThreads, PermissionsBitField.Flags.ViewAuditLog, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.DeafenMembers, PermissionsBitField.Flags.ChangeNickname, PermissionsBitField.Flags.ManageEvents, PermissionsBitField.Flags.ManageNicknames, PermissionsBitField.Flags.ManageThreads, PermissionsBitField.Flags.ManageEmojisAndStickers, PermissionsBitField.Flags.ManageRoles, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.CreatePrivateThreads, PermissionsBitField.Flags.CreateInstantInvite, PermissionsBitField.Flags.RequestToSpeak, PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.MentionEveryone, PermissionsBitField.Flags.ViewGuildInsights, PermissionsBitField.Flags.PrioritySpeaker, PermissionsBitField.Flags.ManageWebhooks] }).then((Role) => {
      Role.setHoist(true);
    });
    
    guild.roles.create({ name: '[MANAGER]',color: '0x05871f', permissions:[PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.CreatePublicThreads, PermissionsBitField.Flags.ViewAuditLog, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.DeafenMembers, PermissionsBitField.Flags.ChangeNickname, PermissionsBitField.Flags.ManageEvents, PermissionsBitField.Flags.ManageNicknames, PermissionsBitField.Flags.ManageThreads, PermissionsBitField.Flags.ManageEmojisAndStickers, PermissionsBitField.Flags.ManageRoles, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.CreatePrivateThreads, PermissionsBitField.Flags.CreateInstantInvite, PermissionsBitField.Flags.RequestToSpeak, PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.MentionEveryone, PermissionsBitField.Flags.ViewGuildInsights, PermissionsBitField.Flags.ManageWebhooks]}).then((Role) => {
      Role.setHoist(true);
    });
    
    guild.roles.create({ name: '[MODERATOR]',color: '0x006699', permissions: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.CreatePublicThreads, PermissionsBitField.Flags.ViewAuditLog, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.DeafenMembers, PermissionsBitField.Flags.ManageNicknames, PermissionsBitField.Flags.RequestToSpeak, PermissionsBitField.Flags.ModerateMembers] }).then((Role) => {
      Role.setHoist(true);
    });
    
    await guild.roles.create({ name: '[STAFF]',color: '0x540a43', permissions: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.CreatePublicThreads, PermissionsBitField.Flags.ManageMessages,
PermissionsBitField.Flags.RequestToSpeak] }).then((Role) => {
      Role.setHoist(true);
      
      //Creating Channels and categorys
    if (communityServerBool){
      guild.channels.create({
        name : "Announcements",
        type : ChannelType.GuildCategory,
        permissionOverwrites: [ 
          {
			   id: guild.roles.everyone.id, 
			   deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.SendTTSMessages, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.CreatePublicThreads]
        },
        {
			   id: guild.roles.cache.find(role => role.name == '[STAFF]').id, 
			   allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.SendTTSMessages, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.CreatePublicThreads]
        },
         {
			   id: guild.roles.cache.find(role => role.name == '[MODERATOR]').id, 
			   allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.SendTTSMessages, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.CreatePublicThreads]
        },{
			   id: guild.roles.cache.find(role => role.name == '[MODERATOR]').id, 
			   allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.SendTTSMessages, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.CreatePublicThreads]
        },{
			   id: guild.roles.cache.find(role => role.name == '[MANAGER]').id, 
			   allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.SendTTSMessages, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.CreatePublicThreads]
        },{
			   id: guild.roles.cache.find(role => role.name == '[ADMINISTRATOR]').id, 
			   allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.SendTTSMessages, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.CreatePublicThreads]
        }],
        
      }).then((category) => {
          guild.channels.create({
          type: ChannelType.GuildAnnouncement,
          name : "Announcements",
          parent: category.id,
        })
          .then((channel1) => {
            channel1.send("Successfully Created Announcement channel!")
          })
          .catch(console.error);
        
        guild.channels.create({
          type: ChannelType.GuildText,
          name : "Rules",
          parent: category.id,
        })
          .then((channel1) => {
            channel1.send("Rules here")
          })
          .catch(console.error);
        
        guild.channels.create({
          type: ChannelType.GuildText,
          name : "Information",
          parent: category.id,
        })
          .then((channel1) => {
            channel1.send("Info here")
          })
          .catch(console.error);

        guild.channels.create({
          type: ChannelType.GuildText,
          name : "Join-Leaves",
          parent: category.id,
        })
          .then((channel1) => {
            channel1.send("People who leaves and join")
          })
          .catch(console.error);
      });
      guild.channels.create({
        name : "STAFF CHANNELS",
        type : ChannelType.GuildCategory,
        
        permissionOverwrites: [{
			   id: guild.roles.everyone.id, 
			   deny: [PermissionsBitField.Flags.ViewChannel]
        },{
			   id: guild.roles.cache.find(role => role.name == '[STAFF]').id, 
			   allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.SendTTSMessages, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.ViewChannel]
        },{
			   id: guild.roles.cache.find(role => role.name == '[MODERATOR]').id, 
			   allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.SendTTSMessages, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.ViewChannel]
        },{
			   id: guild.roles.cache.find(role => role.name == '[MANAGER]').id, 
			   allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.SendTTSMessages, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.ViewChannel]
        },{
			   id: guild.roles.cache.find(role => role.name == '[ADMINISTRATOR]').id, 
			   allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.SendTTSMessages, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.ViewChannel]
        }],
        
      }).then((category) => {
          guild.channels.create({
          type: ChannelType.GuildText,
          name : "Staff Announcements",
          parent: category.id,
          permissionOverwrites: [{
			     id: guild.roles.everyone.id, 
			     deny: [PermissionsBitField.Flags.ViewChannel]
          },{
			    id: guild.roles.cache.find(role => role.name == '[STAFF]').id, 
			   deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.SendTTSMessages, PermissionsBitField.Flags.AddReactions]
          },{
			    id: guild.roles.cache.find(role => role.name == '[MODERATOR]').id, 
			   deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.SendTTSMessages, PermissionsBitField.Flags.AddReactions]
          },{
			     id: guild.roles.cache.find(role => role.name == '[MANAGER]').id, 
			     allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.SendTTSMessages, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.ViewChannel]
          },{
			     id: guild.roles.cache.find(role => role.name == '[ADMINISTRATOR]').id, 
			     allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.SendTTSMessages, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.ViewChannel]
          }]
          })
          .then((channel1) => {
            channel1.send("Successfully Created Announcement channel!")
          })
          .catch(console.error);
        guild.channels.create({
          type: ChannelType.GuildText,
          name : "Staff Information",
          parent: category.id,
          permissionOverwrites: [{
			    id: guild.roles.everyone.id, 
          deny: [PermissionsBitField.Flags.ViewChannel]
          },{
			    id: guild.roles.cache.find(role => role.name == '[STAFF]').id, 
			   deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.SendTTSMessages, PermissionsBitField.Flags.AddReactions]
          },{
			    id: guild.roles.cache.find(role => role.name == '[MODERATOR]').id, 
			   deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.SendTTSMessages, PermissionsBitField.Flags.AddReactions]
          },{
			     id: guild.roles.cache.find(role => role.name == '[MANAGER]').id, 
			     allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.SendTTSMessages, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.ViewChannel]
          },{
			     id: guild.roles.cache.find(role => role.name == '[ADMINISTRATOR]').id, 
			     allow: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.SendTTSMessages, PermissionsBitField.Flags.AddReactions, PermissionsBitField.Flags.ViewChannel]
          }]
          })
          .then((channel1) => {
            channel1.send("Info here")
          })
          .catch(console.error);
        
        guild.channels.create({
          type: ChannelType.GuildText,
          name : "Staff Chat",
          parent: category.id,
        })
          .catch(console.error);

        guild.channels.create({
          type: ChannelType.GuildText,
          name : "Staff Bot-commands",
          parent: category.id,
        })
          .catch(console.error);

        guild.channels.create({
          type: ChannelType.GuildForum,
          name : "Staff Forums",
          parent: category.id,
        })
          .catch(console.error);

        guild.channels.create({
          type: ChannelType.GuildVoice,
          name : "Staff VC #1",
          parent: category.id,
        })
          .catch(console.error);

        guild.channels.create({
          type: ChannelType.GuildVoice,
          name : "Staff VC #2",
          parent: category.id,
        })
          .catch(console.error);
    })
    }
    
    guild.channels.create({
        name : "Text channels",
        type : ChannelType.GuildCategory,
      }).then((category) => {
          guild.channels.create({
          type: ChannelType.GuildText,
          name : "General",
          parent: category.id,
          })
          .catch(console.error);

          guild.channels.create({
          type: ChannelType.GuildText,
          name : "Bot-Commands",
          parent: category.id,
          })
          .catch(console.error);

          guild.channels.create({
          type: ChannelType.GuildVoice,
          name : "Voice Channel #1",
          parent: category.id,
          })
          .catch(console.error);

          guild.channels.create({
          type: ChannelType.GuildVoice,
          name : "Voice Channel #2",
          parent: category.id,
          })
          .catch(console.error);
      });
    });
    //await interaction.reply({content:'teh tarik', ephemeral: true });
	},
};
