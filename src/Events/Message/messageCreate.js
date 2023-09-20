const fs = require('fs');

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(client, message) {
        const prefix = client.config.prefix
        if (message.author.bot) return;
        const userExist = fs.existsSync(`${process.cwd()}/src/Storage/users/${message.author.id}.json`);
        if(!userExist) await client.createUser(message.author.id);
        const userData = JSON.parse(fs.readFileSync(`${process.cwd()}/src/Storage/users/${message.author.id}.json`));
        if (!message.content.startsWith(prefix)) return;
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const commandName = args.shift().toLowerCase();
        const data = client.bots.get(message.channel.id) || [];
        if (commandName.length == 0) return;
        let command = client.commands.get(commandName);
        if (!command || !command.run) return;
        if (command.ownerOnly && !client.config.owners.includes(message.author.id)) return;
        if(command.blockGeneral && client.config.blockGeneral.includes(message.channel.parentId)) return;
        if (command) command.run(client, message, args, data, userData);
    }
}