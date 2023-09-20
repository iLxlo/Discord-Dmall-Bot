const fs = require('fs');

module.exports = client => {

    Number.prototype.addSeparator = function () {
        return this.toLocaleString('en-US');
    };

    client.msToTime = (duration) => {
        var milliseconds = parseInt((duration % 1000))
            , seconds = parseInt((duration / 1000) % 60)
            , minutes = parseInt((duration / (1000 * 60)) % 60)
            , hours = parseInt((duration / (1000 * 60 * 60)) % 24);
    
        hours = hours;
        minutes = minutes;
        seconds = seconds;
    
        return hours + " heure(s) " + minutes + " minute(s) et " + seconds + " seconde(s)"
    }

    client.reply = (message, type, description) => {

        if (type.toLowerCase() === 'error') {
            return message.channel.send({
                embeds: [
                    {
                        description: description,
                        color: client.color.red,
                        footer: {
                            text: `${message.author.tag}`
                        }
                    }
                ]
            })
        }

        if (type.toLowerCase() === 'success') {
            return message.channel.send({
                embeds: [
                    {
                        description: description,
                        color: client.color.green,
                        footer: {
                            text: `${message.author.tag}`
                        }
                    }
                ]
            })
        }


        if (type.toLowerCase() === 'base') {
            return message.channel.send({
                embeds: [
                    {
                        description: description,
                        color: client.color.default,
                        footer: {
                            text: `${message.author.tag}`
                        }
                    }
                ]
            })
        }


    } // Fin client.reply


    client.updateUser = (id, settings) => {
        const exist = fs.existsSync(`${process.cwd()}/src/Storage/Users/${id}.json`);
        let data = JSON.parse(fs.readFileSync(`${process.cwd()}/src/Storage/Users/${id}.json`));
        if (!exist) return;
        for (const key in settings) {
            if (data[key] !== settings[key]) data[key] = settings[key];
        }
        fs.writeFileSync(`${process.cwd()}/src/Storage/Users/${id}.json`, JSON.stringify(data, null, 4));
    }



    client.createUser = id => {
        const exist = fs.existsSync(`${process.cwd()}/src/Storage/Users/${id}.json`);
        if (exist) return;
        fs.writeFileSync(`${process.cwd()}/src/Storage/Users/${id}.json`, JSON.stringify({
            id: id,
            premium_type: 0,
            premium_since: 0,
            lang: "en"
        }, null, 4))

    };

    client.getUser = id => {
        const exist = fs.existsSync(`${process.cwd()}/src/Storage/Users/${id}.json`);
        if (!exist) return null;
        let data = JSON.parse(fs.readFileSync(`${process.cwd()}/src/Storage/Users/${id}.json`));
        return data;
    };

} // Fin export