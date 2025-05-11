const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { verifyUserinFaction } = require('../../utils/verifyUser');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('verify')
		.setDescription('Verify user with Torn Account!')
		.addStringOption(option =>
			option.setName('torn-api')
				.setDescription('Use your Public Torn API Key here')
				.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const apiKey = interaction.options.getString('torn-api');
		// const userId = interaction.user.id;

		const { state, tornUsername } = await verifyUserinFaction(apiKey);
		if (state == false) {
			await interaction.editReply({ content: 'User not verified, please check your API Key and try again.', flags: MessageFlags.Ephemeral });
			return;
		}
		if (state == true) {
			try {
				await interaction.member.fetch();
				await interaction.member.setNickname(tornUsername);
				if (interaction.member.roles.cache.find(r => r.name === 'FAS')) {
					await interaction.editReply({ content: 'User already Verified, don\'t waster my time!', flags: MessageFlags.Ephemeral });
				}
				else {
					const role = interaction.member.guild.roles.cache.find(r => r.name === 'FAS');
					await interaction.member.roles.add(role);
					await interaction.editReply({ content: 'User Verified, Welcome to the Fallen Angel Syndicate!', flags: MessageFlags.Ephemeral });
				}
			}
			catch (error) {
				console.error(error);
				await interaction.editReply({ content: 'Failed to set nickname, please contact Administrator.', flags: MessageFlags.Ephemeral });
				return;
			}
			return;
		}
		else {
			await interaction.editReply({ content: 'User not verified, please check your API Key and try again.', flags: MessageFlags.Ephemeral });
			return;
		}

	},
};
