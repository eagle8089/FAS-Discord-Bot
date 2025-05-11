const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');

if (process.env.NODE_ENV !== 'development') {
	require('dotenv').config();
}

const token = process.env.DISCORD_TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
client.buttons = new Collection();
client.cooldowns = new Collection();

const commandFoldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandFoldersPath);

const buttonsFolderPath = path.join(__dirname, 'buttons');
const buttonFolders = fs.readdirSync(buttonsFolderPath);

for (const folder of buttonFolders) {
	const buttonsPath = path.join(buttonsFolderPath, folder);
	const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));
	for (const file of buttonFiles) {
		const filePath = path.join(buttonsPath, file);
		const button = require(filePath);
		if ('customId' in button && 'execute' in button) {
			client.buttons.set(button.customId, button);
		}
		else {
			console.log(`[WARNING] The button handler at ${filePath} is missing a required "customId" or "execute" property.`);
		}
	}
}

for (const folder of commandFolders) {
	const commandsPath = path.join(commandFoldersPath, folder);
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
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(token);
