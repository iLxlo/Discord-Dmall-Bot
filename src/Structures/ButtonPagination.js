const { MessageActionRow, MessageEmbed } = require("discord.js");
const Color = require("./Colors")

module.exports = async (title, interaction, pages, slice, time = 120000) => {
    if (!interaction || !pages || !(pages?.length > 0) || !(time > 10000)) throw new Error("Error on ButtonPagination");
    const embed = new MessageEmbed();

    let index = 0, row = new MessageActionRow().addComponents([
        {
            type: "BUTTON",
            customId: "1",
            emoji: "⏮️",
            style: "PRIMARY",
            disabled: true
        },
        {
            type: "BUTTON",
            customId: "2",
            emoji: "⬅️",
            style: "PRIMARY",
            disabled: true
        },
        {
            type: "BUTTON",
            customId: "3",
            emoji: "➡️",
            style: "PRIMARY",
            disabled: Math.ceil(pages.length / slice) < 2
        },
        {
            type: "BUTTON",
            customId: "4",
            emoji: "⏭️",
            style: "PRIMARY",
            disabled: Math.ceil(pages.length / slice) < 2
        },
        {
            type: "BUTTON",
            customId: "5",
            emoji: "❌",
            style: "DANGER",
            disabled: false
        }
    ]);

    embed.setDescription(pages.sliceBy(slice)[index].map(p => p).join('\n\n'))
    embed.setFooter({ text: `${interaction.guild.translate("PAGE")} ${index + 1}/${Math.ceil(pages.length / slice)}` })
    embed.setColor(Color.default)

    let data = {
        embeds: [embed],
        components: [row],
        fetchReply: true
    };

    const msg = interaction.replied ? await interaction.followUp(data) : await interaction.reply(data);

    const collector = await msg.createMessageComponentCollector({
        filter: i => i.user.id === interaction.user.id,
        time
    });

    let p0 = 0;
    let p1 = slice;
    collector.on("collect", item => {
        if (item.customId === "1") {
            index = 0;
        }
        else if (item.customId === "2") {
            index--;
        }
        else if (item.customId === "3") {
            index++;
        }
        else if (item.customId === "4") {
            index = Math.ceil(pages.length / slice) - 1;
        }
        else if (item.customId === "5") collector.stop();
 
        embed.setTitle(title)
        embed.setDescription(pages.sliceBy(slice)[index].map(p => p).join('\n\n'))
        embed.setFooter({ text: `${interaction.guild.translate("PAGE")} ${index + 1}/${Math.ceil(pages.length / slice)}` })
        row.setComponents([{
            type: "BUTTON",
            customId: "1",
            emoji: "⏮️",
            style: "PRIMARY",
            disabled: index === 0
        },
        {
            type: "BUTTON",
            customId: "2",
            emoji: "⬅️",
            style: "PRIMARY",
            disabled: index === 0
        },
        {
            type: "BUTTON",
            customId: "3",
            emoji: "➡️",
            style: "PRIMARY",
            disabled: index === Math.ceil(pages.length / slice) - 1
        },
        {
            type: "BUTTON",
            customId: "4",
            emoji: "⏭️",
            style: "PRIMARY",
            disabled: index === Math.ceil(pages.length / slice) - 1
        },
        {
            type: "BUTTON",
            customId: "5",
            emoji: "❌",
            style: "DANGER",
            disabled: false
        }])

        item.update({
            components: [row],
            embeds: [embed]
        })
    });

    collector.on("end", () => {
        setTimeout(() => {
            msg.edit({
                components: []
            })
        }, 1000)
        
    })
}