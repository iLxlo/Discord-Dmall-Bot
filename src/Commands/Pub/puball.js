const { Client } = require('discord.js');
const fetch = require('node-fetch');
const { ApplicationFlags, MessageActionRow } = require('discord.js');
const { promisify } = require("util");
const wait = promisify(setTimeout);

function match(array, word) {
    const matchPresence = array.filter(element => {
        if (element.indexOf(word) !== -1) {
            return true;
        } else return false;
    });
    if (matchPresence.length > 0) return true; else return false;
}

module.exports = {
    name: 'puball',
    ownerOnly: false,
    blockGeneral: true,
    category: "Pub",
    description: "PUBALL_DESCRIPTION",
    options: ["<token>"],
    run: async (client, message, args, data) => {
        const state = { total: 0, success: 0, error: 0, too_fast: 0 };
        const row = new MessageActionRow().addComponents([
            {
                type: "BUTTON",
                customId: "1",
                label: message.member.translate('BUTTON_CONFIRM'),
                style: "SUCCESS",
                disabled: false
            },
            {
                type: "BUTTON",
                customId: "2",
                label: message.member.translate('BUTTON_CANCEL'),
                style: "DANGER",
                disabled: false
            }
        ]);


        let flagged = false;
        // function disconnect

        function disconnect(message, bot) {
            bot.destroy();
            client.bots.delete(message.channel.id);
        }

        const token = args[0];
        if (!token) return client.reply(message, 'error', message.member.translate('PUBALL_INVALID_TOKEN'));
        if (data.length !== 0) return client.reply(message, 'error', message.member.translate('PUBALL_ALREADY'));

        const botID = atob(token.substring(0, token.indexOf('.')));
        const res = await fetch(`https://discordapp.com/api/v9/applications/${botID}/rpc`);
        const json = await res.json()
        if (!json.id) return client.reply(message, 'error', message.member.translate('PUBALL_INVALID_TOKEN'));
        let flag = 98045;
        const flags = new ApplicationFlags(json.flags).toArray();
        if (!match(flags, 'MEMBERS')) return client.reply(message, 'error', "Error: No intents")
        if (match(flags, 'PRESENCE')) flag += 256;
        if (match(flags, 'MEMBERS')) flag += 2;
        if (match(flags, 'MESSAGE')) flag += 32768;
        client.bots.set(message.channel.id, new Client({  http: {
            api: "https://discordapp.com/api",
            version: 8,
          }, intents: flag, shards: "auto" }));
        const bot = client.bots.get(message.channel.id);
        await bot.login(token).catch(() => {
            return client.reply(message, 'error', message.member.translate('PUBALL_INVALID_TOKEN'))
        })

        let allMembers;
        let avatar;


        bot.on('ready', async () => {

            if (bot.user.avatar?.startsWith('a_')) avatar = `https://cdn.discordapp.com/avatars/${bot.user.id}/${bot.user.avatar}.gif?size=4096`
            if (!bot.user.avatar?.startsWith('a_')) avatar = `https://cdn.discordapp.com/avatars/${bot.user.id}/${bot.user.avatar}.png?size=4096`
            if (avatar === null) avatar = client.config.icon

            client.reply(message, 'base', message.member.translate('PUBALL_GETMEMBERS'))

            // for (const guild of bot.guilds.cache.values()) {
            //     if(guild.available) await guild.members.fetch();
            // }

            allMembers = bot.users.cache.filter(x => !x.bot).map(x => x);

            const publiWithServers = await message.channel.send({
                embeds: [
                    {
                        author: {
                            name: `${bot.user.username}#${bot.user.discriminator}`, iconURL: avatar, url: avatar
                        },
                        title: message.member.translate('PUBALL_SERVERS', bot.guilds.size),
                        description: `${bot.guilds.cache.filter(g => !g.unavailable).sort((a, b) => b.memberCount - a.memberCount).map(g => `**${g.name}** (${g.memberCount.addSeparator()} member)`).slice(0, 25).join('\n')}\n\n[${message.member.translate('PUBALL_INVITEBOT')}](https://discord.com/api/oauth2/authorize?client_id=${bot.user.id}&permissions=0&scope=bot)`,
                        color: client.color.default,
                        fields: [
                            {
                                name: message.member.translate('PUBALL_CREATEDAT'), value: `<t:${Math.round(bot.user.createdAt / 1000)}:f>`
                            }
                        ],
                        footer: {
                            text: message.member.translate('PUBALL_5M_VALIDATE')
                        }
                    }
                ], components: [row]
            });


            const validateChoice = await publiWithServers.createMessageComponentCollector({
                filter: i => i.user.id === message.author.id,
                time: 300000
            });


            validateChoice.on('end', () => {
                publiWithServers.edit({ components: [] })
            })


            validateChoice.on('collect', async item => {
                item.deferReply({ fetchReply: false, ephemeral: true });

                if (item.customId === "1") {

                    const cancelReceivePub = new MessageActionRow().addComponents([
                        {
                            type: "BUTTON",
                            customId: "cancelpub",
                            label: message.member.translate('BUTTON_CANCEL'),
                            style: "DANGER",
                            disabled: false
                        }
                    ]);


                    const receivePub = await message.channel.send({
                        embeds: [
                            {
                                author: {
                                    name: `${bot.user.username}#${bot.user.discriminator}`, iconURL: avatar, url: avatar
                                },
                                color: client.color.default,
                                description: message.member.translate('PUBALL_ADV_DESC'),
                                footer: {
                                    text: message.member.translate('PUBALL_5M_VALIDATE')
                                }
                            }
                        ], components: [cancelReceivePub]
                    });

                    validateChoice.stop();

                    const publiCollector = await message.channel.createMessageCollector({ filter: m => m.author.id === message.author.id, max: 1, time: 360000 });
                    const cancelReceivePubCollector = await receivePub.createMessageComponentCollector({
                        filter: i => i.user.id === message.author.id,
                        time: 300000
                    });


                    cancelReceivePubCollector.on('collect', item => {
                        if (item.customId === "cancelpub") {
                            item.reply({
                                embeds: [
                                    {
                                        description: message.member.translate('PUBALL_INTERRUPT'),
                                        color: client.color.red
                                    }]
                            })
                            disconnect(message, bot)
                            publiCollector.stop();
                            cancelReceivePubCollector.stop();
                        }
                    })

                    publiCollector.on('collect', async m => {
                        receivePub.delete().catch(() => { });
                        if (!m.content) {
                            disconnect(message, bot)
                            publiCollector.stop();
                            return client.reply(message, 'error', message.member.translate('PUBALL_INVALID_EMBED'))
                        }
                        //m.delete().catch((e) => { console.log(e) });
                        let formatEmbed;
                        const data = { content: " ", embeds: [], components: [] };

                        if (m.content.startsWith('{') && m.content.endsWith('}')) {

                            try {
                                formatEmbed = JSON.parse(m.content)
                            } catch {
                                disconnect(message, bot)
                                publiCollector.stop();
                                return client.reply(message, 'error', message.member.translate('PUBALL_INVALID_EMBED'))
                            }

                        } else {
                            data.content = m.content;
                        }

                        if (formatEmbed?.content) data.content = formatEmbed.content;
                        if (formatEmbed?.embed) data.embeds.push(formatEmbed.embed);
                        if (formatEmbed?.components) data.components.push(formatEmbed.components);
                        message.channel.send({ content: `*${message.member.translate('PUBALL_HERE_ADV_MSG')}:*\n\n${data.content.replace('{user}', message.author)}`, embeds: data.embeds.length < 1 ? null : data.embeds, components: data.components[0].length < 1 ? null : data.components[0] });


                        const stopPub = new MessageActionRow().addComponents([
                            {
                                type: "BUTTON",
                                customId: "stoppub",
                                label: message.member.translate('BUTTON_STOP'),
                                style: "DANGER",
                                disabled: false
                            }
                        ]);
                        let scd = allMembers.length * 0.09;
                        scd = scd * 1000;

                        let ms = Math.round(scd)
                        let estimation = client.msToTime(ms)
                        const startMsg = await message.channel.send({
                            embeds: [
                                {
                                    author: {
                                        name: `${bot.user.username}#${bot.user.discriminator}`, iconURL: avatar, url: avatar
                                    },
                                    color: client.color.default,
                                    title: message.member.translate('PUBALL_STARTED'),
                                    description: `${message.member.translate('PUBALL_ETA')} ${estimation}\n${message.member.translate('PUBALL_POT', allMembers.length.addSeparator())}`
                                }
                            ], components: [stopPub]
                        })


                        let status = true;

                        const stopPubWhenStarted = await startMsg.createMessageComponentCollector({
                            filter: i => i.user.id === message.author.id,
                            time: 2147483647
                        });

                        stopPubWhenStarted.on('collect', item => {
                            if (item.customId === "stoppub") {
                                status = false;
                                item.reply({
                                    embeds: [
                                        {
                                            description: message.member.translate('PUBALL_INTERRUPT'),
                                            color: client.color.red
                                        }]
                                })
                                disconnect(message, bot)
                                startMsg.edit({ components: [] });
                                stopPubWhenStarted.stop();
                            }
                        })


                        const editMsg = await message.channel.send({
                            embeds: [
                                {
                                    title: message.member.translate('PUBALL_IN_PROGRESS'),
                                    color: client.color.default,
                                    description: message.member.translate('PUBALL_SENT_TO', state.total.addSeparator()),
                                    footer: {
                                        text: `${message.member.translate("PUBALL_STATE_ERROR")}: ${state.error} | ${message.member.translate('PUBALL_STATE_RLM')}: ${state.too_fast}`
                                    }
                                }
                            ]
                        });


                        const inter = setInterval(() => {
                            editMsg.edit({
                                embeds: [
                                    {
                                        title: message.member.translate('PUBALL_IN_PROGRESS'),
                                        color: client.color.default,
                                        description: message.member.translate('PUBALL_SENT_TO', state.total.addSeparator()),
                                        footer: {
                                            text: `${message.member.translate("PUBALL_STATE_ERROR")}: ${state.error} | ${message.member.translate('PUBALL_STATE_RLM')}: ${state.too_fast}`
                                        }
                                    }
                                ]
                            })
                        }, 10000);

                        for (const user of allMembers) {

                            if (flagged) {
                                disconnect(message, bot);
                                startMsg.edit({ components: [] });
                                stopPubWhenStarted.stop();
                                clearInterval(inter);
                                client.reply(message, 'error', message.member.translate('PUBALL_SPAM_BOT'))
                                return;
                            }
                            if (!status) return;
                            await user.send({ content: `${data.content.replace('{user}', message.author)}`, embeds: data.embeds.length < 1 ? null : data.embeds, components: data.components[0].length < 1 ? null : data.components[0] })
                                .then(m => {
                                    console.log(m);
                                    state.total++;
                                    state.success++;
                                })
                                .catch(e => {
                                    console.log(e);
                                    state.total++;
                                    state.error++;
                                })
                            // await new Promise(r => setTimeout(r, 430));
                        };


                        disconnect(message, bot)
                        startMsg.edit({ components: [] });
                        stopPubWhenStarted.stop();
                        clearInterval(inter);

                        message.channel.send({
                            embeds: [
                                {
                                    title: message.member.translate('PUBALL_END'),
                                    description: message.member.translate('PUBALL_SUCCESS_SENT', state.success),
                                    color: client.color.default,
                                    footer: {
                                        text: `${message.member.translate("PUBALL_STATE_ERROR")}: ${state.error} | ${message.member.translate('PUBALL_STATE_RLM')}: ${state.too_fast}`
                                    }
                                }
                            ]
                        })



                    }) // fin publi collector


                }; // Fin item custom id 1

                if (item.customId === "2") {
                    client.reply(message, 'error', message.member.translate('PUBALL_INTERRUPT'))
                    publiWithServers.edit({ components: [] });
                    disconnect(message, bot)
                    publiCollector.stop();
                };
            }) // Fin validate choice



        }) // Fin ready

    }
}
