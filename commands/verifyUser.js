const { SlashCommandBuilder } = require('discord.js');
const { verifyUserinFaction } = require('../utils/tornApi.js')

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
		const UserTornKey = interaction.options.getString('key');
		if (interaction.member.roles.cache.has(verified_role_id)) {
			await interaction.reply(`${interaction.user.username} is already verified!`);
		}
		else {
			if (await verifyUserinFaction(UserTornKey)) {
				const role = interaction.member.guild.roles.cache.find((r) => r.id === verified_role_id);
				interaction.member.roles.add(role);
				await interaction.reply(`${interaction.user.username} verified!`);
			}
			else{
				await interaction.reply(`Check your API Key, The Key should have at least Minimal Access`);
			}
		}
	},
};