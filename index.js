const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const { QuickDB } = require("quick.db");
const { token, tornApi } = require('./config.json');
const { getNews } = require('./utils/tornCheckLogs.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const db = new QuickDB();

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
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
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        }
    }
});

client.on("ready", () => {
    notificationSystem();
});

async function notificationSystem() {
    const param = "giveFunds";
    const emptyData = {
        id: null,
        text: null,
        timestamp: null
    };
    if (await db.get(`${param}LastData`) === null) await db.set(`${param}LastData`, emptyData);

    setInterval(async () => {
        const lastData = await db.get(`${param}LastData`);
        const [newMsg, MsgData] = await getNews(tornApi, param, lastData);
        if (!newMsg) return;
        else {
            await db.set(`${param}LastData`, JSON.parse(MsgData[0]));
            const channel = client.channels.cache.get("1315276631555833886");
            for (var key in MsgData) {
                let discordMessage = JSON.parse(MsgData[key]).text;
                channel.send(discordMessage);
            }

        }
    }, 10000);
}


client.login(token);