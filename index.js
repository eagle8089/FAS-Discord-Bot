const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const { getNews } = require('./utils/tornCheckLogs.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
const mongo_client = new MongoClient(process.env.MONGO_CON_URL, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	}
	else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
		else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

client.on('ready', () => {
	notificationSystem();
});

async function notificationSystem() {
	const param = 'giveFunds';

	setInterval(async () => {
		await mongo_client.connect();
		const logsCol = mongo_client.db('fas-bot').collection('logs');
		const lastData = await logsCol.findOne({ type: param });
		await mongo_client.close();
		const [newMsg, MsgData] = await getNews(param, lastData);
		if (!newMsg) {return;}
		else {
			await mongo_client.connect();
			const logsCol1 = mongo_client.db('fas-bot').collection('logs');
			const lastMsg = JSON.parse(MsgData[0]);
			lastMsg.type = param;
			await logsCol1.replaceOne({ type: param }, lastMsg);
			await mongo_client.close();
			const channel = client.channels.cache.get('1315276631555833886');
			for (const key in MsgData) {
				const discordMessage = JSON.parse(MsgData[key]).text;
				channel.send(discordMessage);
			}
		}
	}, 10000);
}


client.login(process.env.DISCORD_TOKEN);