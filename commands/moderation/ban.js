const { ApplicationCommandOptionType, PermissionFlagsBits, Client, Interaction } = require('discord.js');
const { devs } = require('../../config.json');
module.exports = {
    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        const targetUserId = interaction.options.get('target-user').value;
        const reason = interaction.options.get('reason')?.value || "no reason provided";
        await interaction.deferReply();
        const targetUser = await interaction.guild.members.fetch(targetUserId);
        if (!targetUser) {
            await interaction.editReply('that user doesnt exist in thise server.');
            return;
        }
        if (targetUser.id === interaction.guild.ownerId) {
            await interaction.editReply('You Cant Ban My Clone you Dumbass.')
            return;
        }
        if (targetUser.id === devs.includes(interaction.member.id)) {
            await interaction.editReply(`No Way Im banning my Own Dev ${targetUser} :saluting_face: `)
            return;
        }
        const targetUserRolePostion = targetUser.roles.highest.postition; // Highest role  of the targeted user
        const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of the user running the cmd
        const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot
        if (targetUserRolePostion >= requestUserRolePosition) {
            await interaction.editReply('You cant ban that person he is equal or higher than you');
            return;
        }
        if (targetUserRolePostion >= botRolePosition) {
            await interaction.editReply('I cant ban that person they have the same or higher role than me.')
        }
        try {
            await targetUser.ban({ reason })
            await interaction.editReply(`Bye Bye! ${targetUser} Was Banned \nReason : ${reason}\n So Who Is Next??`);
        } catch (error) {
            console.log(`there was an error in banning  ${error}`);
        }
    },
    //deleted: true,
    name: 'ban',
    description: 'Banning Bitchesz',
    //devOnly: true,
    options: [
        {
            name: 'target-user',
            description: 'the user to ban',
            required: true,
            type: ApplicationCommandOptionType.Mentionable,
        },
        {
            name: 'reason',
            description: 'the reason for banning',
            type: ApplicationCommandOptionType.String,
        }
    ],
    permissionRequired: [PermissionFlagsBits.BanMembers],
    botPermissions: [PermissionFlagsBits.Administrator],

}