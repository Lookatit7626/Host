console.log('index.js');

const bodyParser = require('body-parser');
const axios = require('axios');
const express = require('express');
const mySecret = process.env['Token'];
const cron = require('cron');

const { Client : pgClient } = require('pg');

const DBclient = new pgClient({
  host: process.env['host'],
  port: 25144,
  user: 'avnadmin',
  password: process.env['passwordPg'],
  database: 'defaultdb',
  ssl: {
    rejectUnauthorized: false,
  },
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 25000,
});

const NameOfDB = "TEST_REFERRAL" //MAIN IS REFERRAL, TEST is TEST_REFERRAL
const NameOfDB2 = "IP_LOGS"

const CreateTable = `
  CREATE TABLE IF NOT EXISTS ${NameOfDB} (
      ReferalOwner VARCHAR(255),
      Enabled VARCHAR(8),
      UsedAmount INT,
      EXPIRE VARCHAR(255)
  );
`

const CreateTable2 = `
  CREATE TABLE IF NOT EXISTS ${NameOfDB2} (
      IP VARCHAR(255)
  );
`

async function connectToDatabase() {
  console.log("Attempting to connect to PostgreSQL")
  await DBclient.connect();
  console.log('Connected to PostgreSQL');

  try {
      res = await DBclient.query(`SELECT * FROM ${NameOfDB}`);
      //console.log(res.rows);
      console.log("Postgres DB Works!")
  } catch (errorAsError){
      if (errorAsError == `error: relation "${NameOfDB.toLowerCase()}" does not exist`) {
          console.log(`${NameOfDB} DONT EXIST??? THAT SHOULD NOT HAPPEN...`)
          DBclient.query(CreateTable);
          console.log(`created '${NameOfDB}' table`)
      }
  }

  try {
      res = await DBclient.query(`SELECT * FROM ${NameOfDB2}`);
      //console.log(res.rows);
      console.log("Postgres DB2 Works!")
  } catch (errorAsError){
      if (errorAsError == `error: relation "${NameOfDB2.toLowerCase()}" does not exist`) {
          console.log(`${NameOfDB2} DONT EXIST??? THAT SHOULD NOT HAPPEN...`)
          DBclient.query(CreateTable2);
          console.log(`created '${NameOfDB2}' table`)
      }
  }
}

connectToDatabase();

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.post('/post/EnterMessage' , express.raw({ type: '*/*', limit: '10mb' }), async (req, res) => {
  try {
    var parsedData = req.body;
    const contentType = req.get('Content-Type');
    if (contentType.includes('application/json') == false && contentType.includes('application/x-www-form-urlencoded') == false) {
      parsedData = JSON.parse(req.body.toString('utf8'));
    }
    if (contentType.includes('application/x-www-form-urlencoded') == true) {

      const key = Object.keys(parsedData)[0]
      parsedData = JSON.parse(key.toString('utf8'));
    }
    const {Name, Executor, CountryCode, Time} = parsedData;
    try {
      if (ListOfPeopleThatUsedToday[Name] == null){
        ListOfPeopleThatUsedToday[Name] = {
          "executor" : Executor,
          "country" : CountryCode,
          "time" : Time,
        }
        console.log(`added ${Name} to list`)
        res.send("Successfully added it to list!")
      } else {
        res.send("Already added!")
      }
    } catch {
      res.send("There was an error 1 [unexpected]");
    }
  } catch (errormess) {
    console.log("An error has occured!")
    console.log(errormess)
    const GUILD_ID = '1229184712413548666';
    const CHANNEL_ID = '1317876134901321749';

    const guild = client.guilds.cache.get(GUILD_ID);
    if (guild) {
        const channel = guild.channels.cache.get(CHANNEL_ID);
        if (channel) {

          const embed = new EmbedBuilder()
          .setColor('#C20303')
          .setAuthor({ name: 'Error log' })
          .setTitle(`An error has occured when logging`)
          .setFooter({ text: 'Created at : ' })
          .setTimestamp();
          embed.addFields(
            { name: `Error Message : `, value: `${errormess}`, inline: false },
            { name: `Request body : `, value: `${req.body}`, inline: false },
            { name: `Request Content-Type : `, value: `${req.get('Content-Type')}`, inline: false },
          )
          channel.send({ embeds: [embed] })

        }
    }
    res.send("There was an error 2 [unexpected]");
  }
});

function GetDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // JavaScript months are 0-indexed
  const day = today.getDate();

  const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

  return formattedDate; //Year-Month-Day
}

function CheckExpiredDate(TodayDate, ToCheckDate) {
  try {
      const ToCheckDateArray = ToCheckDate.split("-")
      const TodayDateArray = TodayDate.split("-")

      if (TodayDateArray[0] < ToCheckDateArray[0]) {
          return true
      } else if (TodayDateArray[1] < ToCheckDateArray[1]) {
          return true
      } else if (TodayDateArray[2] <= ToCheckDateArray[2]) {
          return true
      }
      return false
  } catch {
      return false
  }
}

async function PostGresAddReferal(ReferalName, Expire) {
//DBclient.connect(); // Get a client from the pool
try {
    ReferalName = ReferalName.toLowerCase()
    const Querty2 = `SELECT * FROM ${NameOfDB} WHERE ReferalOwner = $1 LIMIT 1`
    const result = await DBclient.query(Querty2, [ReferalName]);
    if (result.rowCount > 0) {
        console.log("EXISTING")
      return true;  // Referral owner exists
     }
    
    const Query = `
      INSERT INTO ${NameOfDB} (ReferalOwner, Expire, Enabled, UsedAmount) 
      VALUES ($1, $2, true, 0)
      RETURNING *;
    `;
    const insertRes = await DBclient.query(Query, [ReferalName, Expire]);
} catch (err) {
  console.error('Error executing query', err);
} finally {
  //DBclient.end(); // Release the client back to the pool
}
}

async function AddReferal(ReferalName, Expire = '2050-01-01') {
  PostGresAddReferal(ReferalName, Expire)
}

AddReferal('Eclipse', '2090-12-31'); // YYYY MM DD

//REFERRAL STUFF

app.get('/referral/:player', async (req, res) => {
  let clientIp = req.ip;
  if (req.headers['x-forwarded-for']) {
      clientIp = req.headers['x-forwarded-for'].split(',')[0]; // Get the first IP in the list
  }
  
  const player = req.params.player.toLowerCase();
  const result = await DBclient.query(`SELECT * FROM ${NameOfDB} WHERE ReferalOwner = $1 LIMIT 1`, [player]);
  if (result.rowCount == 0) {
      res.send(`print("Unknown referral!"); loadstring(game:HttpGet("https://pastebin.com/raw/GThUiBFL`);
  } else {
      //Check if Referral is enabled
      const ReferralEnabled = await DBclient.query(`SELECT DISTINCT Enabled FROM ${NameOfDB} WHERE ReferalOwner = $1 LIMIT 1`,[player])
      
      const ReferralExpiryR = await DBclient.query(`SELECT DISTINCT expire FROM ${NameOfDB} WHERE ReferalOwner = $1 LIMIT 1`,[player])
      const ReferralExpiry = (ReferralExpiryR.rows[0].expire).toString()
      console.log(clientIp)
      
      if (ReferralEnabled.rows[0].enabled == 'true' && CheckExpiredDate(GetDate(), ReferralExpiry)) {

          //Check if IP is already used.
          const Used = await DBclient.query(`SELECT * FROM ${NameOfDB2} WHERE IP = $1 LIMIT 1`, [clientIp]);
          if (Used.rowCount == 0){

              await DBclient.query(`INSERT INTO ${NameOfDB2} (IP) VALUES ($1) ` , [clientIp])

              const rowsofrows = await DBclient.query(`SELECT DISTINCT UsedAmount FROM ${NameOfDB} WHERE ReferalOwner = $1 LIMIT 1` , [player])

              const UsedAmount = rowsofrows.rows[0].usedamount
              console.log(UsedAmount)

              await DBclient.query(`UPDATE ${NameOfDB} SET UsedAmount = ${UsedAmount + 1} WHERE ReferalOwner = $1;`,[player])

              res.send(`loadstring(game:HttpGet("https://pastebin.com/raw/GThUiBFL"))()`)
          } else {
              res.send(`loadstring(game:HttpGet("https://pastebin.com/raw/GThUiBFL"))()`)
          }
          
      }    else {
          res.send(`print("The referral has expired!");loadstring(game:HttpGet("https://pastebin.com/raw/GThUiBFL"))()`)
      }
  }
  
});

app.post('/referral/addplayer', async (req, res) => {
  try {
      const { ReferralOwner, Expiry, CheckVeri } = req.body;
      if (CheckVeri == process.env['APRPassword']) {
          AddReferal(ReferralOwner, Expiry);
          res.send("Success!")
      } else {
          res.send("Lack of permission!", 403)
      }
  } catch {
      res.send("An error has occured!")
  }
});

app.post('/referral/changeplayerreferral', async (req, res) => {
  try {
      var { ReferralOwner, JSONArrayToChange, CheckVeri } = req.body;

      if (CheckVeri != process.env['CPRPassword']) {
          res.send(`lack of permission`, 403)
          return false
      }
      ReferralOwner = ReferralOwner.toLowerCase()
      
      const SQLReferralOwner = await DBclient.query(`SELECT * FROM ${NameOfDB} WHERE ReferalOwner = $1 LIMIT 1;`,[ReferralOwner])
      console.log(SQLReferralOwner.rows[0])
      
      const DeJSON = JSON.parse(JSONArrayToChange)
      
      const ChangeExpire = DeJSON.expire || SQLReferralOwner.rows[0].expire
      const ChangeEnabled = DeJSON.enabled || SQLReferralOwner.rows[0].enabled
      const ChangeUsedAmount = DeJSON.usedamount || SQLReferralOwner.rows[0].usedamount

      await DBclient.query(`UPDATE ${NameOfDB} SET EXPIRE = $2, Enabled = $3, UsedAmount = $4 WHERE ReferalOwner = $1;`,[ReferralOwner, ChangeExpire, ChangeEnabled, ChangeUsedAmount])
      
      res.send(`success data! : ${ChangeExpire} | ${ChangeEnabled} | ${ChangeUsedAmount}`)
      
  } catch(error) {
      res.send(`An error has occured! : ${error}`)
  }
});

//REFERRAL STUFF




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
  console.log("0630")
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
          .setAuthor({ name: '18:30AM report on ECLIPSE HUB ' })
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


let job1 = new cron.CronJob('0 30 18 * * *', RUNNN,null,true,'America/New_York'); // Please change it to 10:30:00 pls
//let job1 = new cron.CronJob('30 01-59 01-23 * * *', RUNNN,null,true,'America/New_York');



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
