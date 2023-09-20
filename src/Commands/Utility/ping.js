module.exports = {
    name: 'ping',
    ownerOnly: true,
    blockGeneral: false,
    category: "Admin",
    run: (client, message, args) => {
        message.channel.send({ embeds: [
            {
                description: "Pong!",
                color: client.color.default
            }
        ]});
    }
}