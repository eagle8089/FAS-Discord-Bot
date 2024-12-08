const { SlashCommandBuilder } = require('discord.js');
const { verifyUserinFactionMaster } = require('../utils/tornVerifyUser.js')
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const client = ("../index.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sync')
        .setDescription('Sync The Database. Admin Only Command'),
    async execute(interaction) {
        admin_role_id = '1315303955596578908';
        verified_role_id = '1314864603347292241';
        if (!await interaction.member.roles.cache.has(admin_role_id)) {
            await interaction.reply(`This is an Administrator Only Command!`);
        }
        else {
            const userDbData = await db.get(`userData`);
            const guild = await interaction.member.guild;
            const verified_role = await interaction.member.guild.roles.cache.find((r) => r.id === verified_role_id);
            const discordUsers = await guild.members.fetch();
            discordUsers.forEach(async (member) => {
                if (member.roles.cache.has(verified_role_id)) {
                    let memFlag = 0;
                    for (var key in userDbData) {
                        if (member.user.id === userDbData[key].discordUserID) {
                            memFlag = 1;
                            break;
                        }
                    }
                    if (memFlag === 0) {
                        if (member.roles.cache.has(admin_role_id)) {
                        }
                        else {
                            await member.roles.remove(verified_role);
                            await member.setNickname(null);
                            const channel = await interaction.member.guild.channels.cache.get("1315276631555833886");
                            await channel.send(`The User ${member.user.username} has been removed from FAS Role as they are not in the internal Database!`);
                        }

                    }
                }
            });
            const tornMemberDetails = await verifyUserinFactionMaster()
            console.log(userDbData);
            for (var key in userDbData) {
                var memExistFlag = false;
                for (var memKey in tornMemberDetails) {
                    if (userDbData[key].tornUserId === tornMemberDetails[memKey].id) {
                        memExistFlag = true;
                        break;
                    }
                }
                if (memExistFlag) { }
                else {
                    const member = await guild.members.fetch(userDbData[key].discordUserID);
                    await member.roles.remove(verified_role);
                    await member.setNickname(null);
                    const channel = await interaction.member.guild.channels.cache.get("1315276631555833886");
                    await channel.send(`The User ${member.user.username} has been removed from FAS Role as they are not in the Faction!`);
                }
            }
            discordUsers.forEach(async (member) => {
                if (member.roles.cache.has(verified_role_id)) {
                    let memFlag = 0;
                    for (var key in userDbData) {
                        if (member.user.id === userDbData[key].discordUserID) {
                            memFlag = 1;
                            break;
                        }
                    }
                    if (memFlag === 0) {
                        if (member.roles.cache.has(admin_role_id)) {
                        }
                        else {
                            await member.roles.remove(verified_role);
                            await member.setNickname(null);
                            const channel = interaction.member.guild.channels.cache.get("1315276631555833886");
                            await channel.send(`The User ${member.user.username} has been removed from FAS Role as they are not in the internal Database!`);
                        }

                    }
                }
            });
            await interaction.reply(`Sync Complete!`);
        }
    },
};