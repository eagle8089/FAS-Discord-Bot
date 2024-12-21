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

function parseNumtoComma(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('withdraw')
		.setDescription('Send request to withdraw Money from faction Bank')
		.addStringOption(option =>
			option.setName('amount')
				.setDescription('Amount to Withdraw')
				.setRequired(true)),
	async execute(interaction) {
		const withdrawAmountStr = interaction.options.getString('amount');
		const amountPower = withdrawAmountStr.slice(-1);
		let withdrawAmount = 0;
		if (amountPower === 'K' || amountPower === 'k') {
			withdrawAmount = parseFloat(withdrawAmountStr.slice(0, -1)) * 1000;
		}
		else if (amountPower === 'M' || amountPower === 'm') {
			withdrawAmount = parseFloat(withdrawAmountStr.slice(0, -1)) * 1000000;
		}
		else if (amountPower === 'B' || amountPower === 'b') {
			withdrawAmount = parseFloat(withdrawAmountStr.slice(0, -1)) * 1000000000;
		}
		else if (!isNaN(withdrawAmountStr)) {
			withdrawAmount = parseFloat(withdrawAmountStr);
		}
		else if (withdrawAmountStr == 'all') {
			withdrawAmount = 'all';
		}
		if (withdrawAmount === 0) {
			await interaction.reply('Invalid request!');
		}
		else {
			await mongo_client.connect();
			const usersCol = mongo_client.db('fas-bot').collection('users');
			const userData = await usersCol.findOne({ discordUserID: interaction.user.id });
			const userBalance = await checkUserBalance(userData.tornUserId);
			if (withdrawAmount === 'all') {
				withdrawAmount = userBalance;
			}
			if (userBalance < withdrawAmount) {
				await interaction.reply('You have don\'t have enough money to withdraw!!!');
			}
			else {
				const sendMoney = new ButtonBuilder()
					.setURL('https://www.torn.com/factions.php?step=your&type=1#/tab=controls&option=give-to-user')
					.setLabel('Send')
					.setStyle(ButtonStyle.Link);
				const sendMoneyRow = new ActionRowBuilder()
					.addComponents(sendMoney);
				const channel = await interaction.member.guild.channels.cache.get(process.env.ADMIN_CHANNEL_ID);
				const alertMsg = await channel.send({
					content: `<@&${process.env.BANKER_ROLE}>, ${userData.tornUserName} has requested ${parseNumtoComma(withdrawAmount)} from Faction Bank. They have a balance of ${parseNumtoComma(userBalance)}`,
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
			}
		}
	},
};