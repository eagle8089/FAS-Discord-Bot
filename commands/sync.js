const { SlashCommandBuilder } = require('discord.js');
const { verifyUserinFactionMaster } = require('../utils/tornVerifyUser.js');
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
		.setName('sync')
		.setDescription('Sync The Database. Admin Only Command'),
	async execute(interaction) {
		const admin_role_id = '1315303955596578908';
		const verified_role_id = '1314864603347292241';
		if (!await interaction.member.roles.cache.has(admin_role_id)) {
			await interaction.reply('This is an Administrator Only Command!');
		}
		else {
			await mongo_client.connect();
			const guild = await interaction.member.guild;
			const verified_role = await interaction.member.guild.roles.cache.find((r) => r.id === verified_role_id);
			const discordUsers = await guild.members.fetch();
			await discordUsers.forEach(async (member) => {
				if (member.roles.cache.has(verified_role_id)) {
					const usersCol = mongo_client.db('fas-bot').collection('users');
					const userData = await usersCol.findOne({ discordUserID: member.user.id });
					if (!userData) {
						if (!member.roles.cache.has(admin_role_id)) {
							await member.roles.remove(verified_role);
							await member.setNickname(null);
							const channel = await interaction.member.guild.channels.cache.get('1315276631555833886');
							await channel.send(`The User ${member.user.username} has been removed from FAS Role as they are not in the internal Database!`);
						}
					}
				}
			});

			const tornMemberDetails = await verifyUserinFactionMaster();
			const usersData = mongo_client.db('fas-bot').collection('users').find();
			for await (const user of usersData) {
				let memExistFlag = false;
				for (const memKey in tornMemberDetails) {
					if (user.tornUserId === tornMemberDetails[memKey].id) {
						memExistFlag = true;
						break;
					}
				}
				if (memExistFlag) {
					const member = await guild.members.fetch(user.discordUserID);
					await member.roles.remove(verified_role);
					await member.setNickname(null);
					const channel = await interaction.member.guild.channels.cache.get('1315276631555833886');
					await channel.send(`The User ${member.user.username} has been removed from FAS Role as they are not in the Faction!`);
				}
			}
			await mongo_client.close();
			await interaction.reply('Sync Complete!');
		}
	},
};