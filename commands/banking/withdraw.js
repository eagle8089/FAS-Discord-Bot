const { SlashCommandBuilder, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder, ChannelType } = require('discord.js');
const { checkUserBalance } = require('../../utils/checkBalance');

function convertMoney(amount) {
	if (typeof amount !== 'string' || !amount.trim()) return NaN;

	const input = amount.trim().toLowerCase();

	if (!isNaN(input)) return Number(input);
	if (input === 'all') return 'all';

	const regex = /^([0-9]*\.?[0-9]+)([kmbt])?$/;
	const match = input.match(regex);

	if (!match) return NaN;

	const numericPart = parseFloat(match[1]);
	const suffix = match[2];
	const multipliers = {
		'k': 1000,
		'm': 1000000,
		'b': 1000000000,
		't': 1000000000000,
	};

	if (!suffix) return numericPart;

	return numericPart * (multipliers[suffix] || 1);
}

function parseNumtoComma(x) {
	return new Intl.NumberFormat().format(x);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('withdraw')
		.setDescription('Send a withdraw request to Leadership!')
		.addStringOption(option =>
			option.setName('amount')
				.setDescription('Enter the amount you want to withdraw, you can use all, 1k, 1m, 1b, etc.')
				.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		await interaction.member.fetch();

		if (!interaction.member.roles.cache.find(r => r.name === 'FAS')) {
			await interaction.editReply({ content: 'User is not verified! Please use /verify command first', flags: MessageFlags.Ephemeral });
			return;
		}

		let amount = convertMoney(interaction.options.getString('amount'));
		const userBalance = await checkUserBalance(interaction.member.displayName);

		if (amount === 'all') {
			amount = userBalance;
		}

		if (Number.isNaN(amount) || amount <= 0) {
			await interaction.editReply({ content: 'Invalid amount, please use a positive number or 1k, 1m, 1b, etc.', flags: MessageFlags.Ephemeral });
			return;
		}

		if (userBalance < 1) {
			await interaction.editReply({ content: 'You have no money in the faction balance!', flags: MessageFlags.Ephemeral });
			return;
		}
		if (userBalance < amount) {
			await interaction.editReply({ content: `You have only ${userBalance} in the faction balance!`, flags: MessageFlags.Ephemeral });
			return;
		}

		await interaction.guild.fetch();
		const channel = interaction.guild.channels.cache.find(
			ch => ch.name === 'faction-leadership-channel' && ch.type === ChannelType.GuildText,
		);
		if (!channel) {
			console.error('Channel not found!');
			await interaction.editReply({ content: 'Critical error, please contact Administrator!', flags: MessageFlags.Ephemeral });
			return;
		}
		const thread = channel.threads.cache.find(t => t.name === 'Banking Requests');
		const role = interaction.guild.roles.cache.find(r => r.name === 'Banker');

		if (!thread || !role) {
			console.error('Channel or role not found!');
			await interaction.editReply({ content: 'Critical error, please contact Administrator!', flags: MessageFlags.Ephemeral });
			return;
		}

		const customId = `send_money|${interaction.member.displayName}|${userBalance}`;
		const sendMoney = new ButtonBuilder()
			.setCustomId(customId)
			.setLabel('Send')
			.setStyle(ButtonStyle.Primary);

		const sendMoneyRow = new ActionRowBuilder()
			.addComponents(sendMoney);

		await thread.send({
			content: `<@&${role.id}>, ${interaction.member.displayName} has requested ${parseNumtoComma(amount)} from Faction Bank. They have a balance of ${parseNumtoComma(userBalance)}`,
			components: [sendMoneyRow],
		});

		await interaction.editReply({ content: 'Request sent to Banker!', flags: MessageFlags.Ephemeral });
	},
};
