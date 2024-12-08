const { SlashCommandBuilder } = require('discord.js');
const { verifyUserinFaction } = require('../utils/tornVerifyUser.js')
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('verify')
		.setDescription('Verify User with TORN API')
		.addStringOption(option =>
			option.setName('torn_api_key')
				.setDescription('Your Torn API Key with Minimal Permission')
				.setRequired(true)),
	async execute(interaction) {
		verified_role_id = '1314864603347292241';
		const UserTornKey = interaction.options.getString('torn_api_key');
		if (await interaction.member.roles.cache.has(verified_role_id)) {
			await interaction.reply(`${interaction.user.username} is already verified!`);
		}
		else {
			const [tornUserName, tornUserID] = await verifyUserinFaction(UserTornKey)
			if (tornUserName) {
				const userDataSchema = {
					tornUserName: tornUserName,
					discordUserID: interaction.member.id,
					tornUserId: tornUserID
				}
				await db.push(`userData`, userDataSchema);
				const role = await interaction.member.guild.roles.cache.find((r) => r.id === verified_role_id);
				await interaction.member.roles.add(role);
				await interaction.member.setNickname(tornUserName);
				await interaction.reply(`${interaction.user.username} verified as ${tornUserName}!`);
			}
			else {
				await interaction.reply(`Check your API Key, The Key should have at least Minimal Access`);
			}
		}
	},
};