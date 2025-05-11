const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	customId: 'send_money',
	async execute(interaction) {
		const [, userName, amount] = interaction.customId.split('|');
		const targetUrl = `https://www.torn.com/factions.php?step=your&type=1&username=${userName}&amount=${amount}#/tab=controls&option=give-to-user`;

		const updatedRow = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId('send_money_disabled')
				.setLabel('Send')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(true),
		);

		// const sendMoney = new ButtonBuilder()
		// 	.setCustomId(customId)
		// 	.setLabel('Send')
		// 	.setStyle(ButtonStyle.Primary);

		// const sendMoneyRow = new ActionRowBuilder()
		// 	.addComponents(sendMoney);

		// await channel.send({
		// 	content: `<@&${role.id}>, ${interaction.member.displayName} has requested ${parseNumtoComma(amount)} from Faction Bank. They have a balance of ${parseNumtoComma(userBalance)}`,
		// 	components: [sendMoneyRow],
		// });

		await interaction.update({ components: [updatedRow] });
		await interaction.followUp({ content: `Payment Link: ${targetUrl}`, ephemeral: true });
	},
};