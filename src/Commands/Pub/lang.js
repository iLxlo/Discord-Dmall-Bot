const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'lang',
    ownerOnly: false,
    blockGeneral: false,
    category: "Pub",
    description: "LANG_DESCRIPTION",
    options: [],
    run: async (client, message, args) => {
      
        const lang = args[0];
        if(!lang) return message.channel.send({ embeds: [
            {
                title: message.member.translate('LANG_INVALID'),
                description: message.member.translate('LANG_DISPO')
            }
        ] })

        if(!["fr", "en"].includes(args[0])) return message.channel.send({ embeds: [
            {
                title: message.member.translate('LANG_INVALID'),
                description: message.member.translate('LANG_DISPO')
            }
        ] })

        await client.updateUser(message.author.id, {
            lang: lang
        })

        message.channel.send(`${message.member.translate('LANG_CHANGED')}`)

    }
}
