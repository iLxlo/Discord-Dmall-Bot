// ██████ Integrations █████████████████████████████████████████████████████████

const { Client, Collection } = require("discord.js");
const glob = require("glob");
const pGlob = require('util').promisify(glob);
const { token } = require('./Settings');

// ██████ | ███████████████████████████████████████████████████████████████████

class SponsorBot extends Client {

    constructor() {

        super({
            http: {
              api: "https://discordapp.com/api",
              version: 8,
            },
            intents: 131071
        });

        // —— Importer paramètres requis
        this.settings = require('./Settings');
        // —— Charger les collections
        ['commands', 'bots'].forEach(x => this[x] = new Collection());
        // —— Charger les couleurs
        this.color = require('./Colors');
        // —— Charger la configuration
        require("./Handlers/LanguageLoader")(this);
        this.config = require('./Configuration');
        require('./Functions')(this);
    }

    // –– Events Handler ––––––––––––––––––––––––––––––––––––––––——–––––––––––––

    async loadEvents() {

        (await pGlob(`${process.cwd()}/src/Events/*/*.js`)).map(async eventFile => {
            const event = require(eventFile);

            if (!event.name) return;

            if (event.once) {
                this.once(event.name, (...args) => event.execute(this, ...args));
            } else {
                this.on(event.name, (...args) => event.execute(this, ...args));
            }

        })

    }

    // –– Commands Handler ––––––––––––––––––––––––––––––––––––––––––––––––––––

    async loadCommands() {

        (await pGlob(`${process.cwd()}/src/Commands/*/*.js`)).map(async cmdFile => {
            const command = require(cmdFile);
            delete require.cache[command];
            if (!command.name) return;
            this.commands.set(command.name, command)
        })

    }

    login() {
        super.login(token);
    }

    start() {

        this.loadCommands();
        this.loadEvents();
        this.login();

    }

}

// —— Répertorie les erreurs
process.on('unhandledRejection', (reason, p) => {
    console.log(' [antiCrash] :: Unhandled Rejection/Catch', reason, p);
});
process.on("uncaughtException", () => {
    console.log(' [antiCrash] :: Uncaught Exception/Catch');
})
process.on('uncaughtExceptionMonitor', (err) => {
    console.log(' [antiCrash] :: Uncaught Exception/Catch (MONITOR)', err);
});
process.on('multipleResolves', (type, promise, reason) => {
    console.log(' [antiCrash] :: Multiple Resolves', type, promise, reason);
});

module.exports = SponsorBot;