const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'help',
    ownerOnly: false,
    blockGeneral: false,
    category: "Pub",
    description: "HELP_DESCRIPTION",
    options: [],
    run: async (client, message, args) => {
      
        const helpEmbed = new MessageEmbed()
        .setColor(client.color.default)
        .setTitle(`${client.user.username} - ${message.member.translate('HELP_TOTALCMD')} ${client.commands.filter(cmd => cmd.category !== 'Admin').size}`)
        .setThumbnail(client.user.avatarURL({ format: 'png', size: 4096 })) 
        .addField(`Sponsor`, `${client.commands.filter(c => c.category === "Pub").map(c => `\`${client.config.prefix}${c.name}${c.options.length > 0 ? c.options?.map(x => ` ${x}`).join(' ') : ""}\`\n*${message.member.translate(`${c.description}`)}*`).join('\n\n')}`)

        message.channel.send({ embeds: [helpEmbed] })

    }
}
