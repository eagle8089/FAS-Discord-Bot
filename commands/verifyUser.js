const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { verifyUserinFaction } = require('../utils/tornVerifyUser.js');
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
		.setName('verify')
		.setDescription('Verify User with TORN API')
		.addStringOption(option =>
			option.setName('torn_api_key')
				.setDescription('Your Torn API Key with Minimal Permission')
				.setRequired(true)),
	async execute(interaction) {
		const verified_role_id = process.env.VERIFIED_ROLE_ID;
		const UserTornKey = interaction.options.getString('torn_api_key');
		await mongo_client.connect();
		const usersCol = mongo_client.db('fas-bot').collection('users');
		const userEntry = await usersCol.findOne({ discordUserID: interaction.member.id });
		if (userEntry) {
			await interaction.reply({ content: `${interaction.user.username} is already verified!`, flags: MessageFlags.Ephemeral });
		}
		else {
			const [tornUserName, tornUserID] = await verifyUserinFaction(UserTornKey);
			if (tornUserName) {
				const userDataSchema = {
					tornUserName: tornUserName,
					tornUserId: tornUserID,
					discordUserID: interaction.member.id,
				};
				await usersCol.insertOne(userDataSchema);
				await mongo_client.close();
				const role = await interaction.member.guild.roles.cache.find((r) => r.id === verified_role_id);
				if (await interaction.member.roles.cache.has(verified_role_id)) {
					await interaction.member.roles.add(role);
				}
				await interaction.member.setNickname(tornUserName);
				await interaction.reply({ content: `${interaction.user.username} verified as ${tornUserName}!`, flags: MessageFlags.Ephemeral });
			}
			else {
				await interaction.reply('Check your API Key, The Key should have at least Minimal Access');
			}
		}
	},
};