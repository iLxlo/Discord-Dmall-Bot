module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.clear();
        console.log(`${client.user.username} connecté!`)
    }
}