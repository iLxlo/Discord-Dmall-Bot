const { glob } = require('glob');
const pGlob = require('util').promisify(glob);
const { GuildMember } = require('discord.js');

module.exports = async client => {

client.loadTranslations = async () => {
    (await pGlob(`${process.cwd()}/src/Languages/*`)).map(async (name) => {
    delete require.cache[require.resolve(`${name}`)];
    });
}


GuildMember.prototype.translate = function (key, variable) {
    const findData = client.getUser(this.id);
    const cd = require(`${process.cwd()}/src/Languages/${findData.lang || client.config.language}`)
    if (!cd[key]) return 'Language key invalid, please contact support!'
    return cd[key].replace('%VAR%', variable);
}

client.loadTranslations();

}