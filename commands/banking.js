const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const { checkUserBalance } = require('../utils/tornCheckBal.js');
const { MongoClient, ServerApiVersion } = require('mongodb');
const mongo_client = new MongoClient(process.env.MONGO_CON_URL, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('withdraw')
		.setDescription('Send request to withdraw Money from faction Bank')
		.addIntegerOption(option =>
			option.setName('amount')
				.setDescription('Amount to Withdraw')
				.setRequired(true)),
	async execute(interaction) {
		const withdrawAmount = interaction.options.getInteger('amount');
		const sendMoney = new ButtonBuilder()
			.setURL('https://www.torn.com/factions.php?step=your&type=1#/tab=controls&option=give-to-user')
			.setLabel('Send')
			.setStyle(ButtonStyle.Link);
		const sendMoneyRow = new ActionRowBuilder()
			.addComponents(sendMoney);
		await mongo_client.connect();
		const usersCol = mongo_client.db('fas-bot').collection('users');
		const userData = await usersCol.findOne({ discordUserID: interaction.user.id });
		const userBalance = await checkUserBalance(userData.tornUserId);

		const channel = await interaction.member.guild.channels.cache.get('1315276631555833886');
		const alertMsg = await channel.send({
			content: `${userData.tornUserName} has requested ${withdrawAmount} from Faction Bank. They have a balance of ${userBalance}`,
			components: [sendMoneyRow],
		});
		const trxInfo = {
			messageId: alertMsg.id,
			userName: userData.tornUserName,
			amount: withdrawAmount,
			status: 0,

		};
		const bankTransactionCol = mongo_client.db('fas-bot').collection('bankTransactions');
		await bankTransactionCol.insertOne(trxInfo);
		await mongo_client.close();
		await interaction.reply('Your request has been placed, Please wait for the Bankers to approve!');
	},
};