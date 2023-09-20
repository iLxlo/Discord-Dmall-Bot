const forbiddenWords = ['process', 'token'];
module.exports = {
    name: 'eval',
	ownerOnly: true,
	blockGeneral: false,
	category: "Admin",
    run: (client, message, args) => {
		
        const code = args.join(' ');
        if(forbiddenWords.includes(code)) return;
		if (!code) {
		return message.channel.send({ content: null, embeds: [{
            description: 'Erreur',
            color: client.color.red
        }] })
		}

        const cleanAfter = text => {
			if (typeof text == 'string') {
				forbiddenWords.forEach(key => {
					const reg = new RegExp(key, 'g');

					text = text.replace(reg, '');
				});

				text = text.trim();
			}

			else if (typeof text == 'object') {
				for (let i of Object.keys(text)) {
					if (typeof text[i] == 'string') {
						forbiddenWords.forEach(key => {
							const reg = new RegExp(key, 'g');

							text[i] = text[i].replace(reg, '');
						});
					}
				}
			}

			return text;
		};

		const cleanBefore = text => {
			let cleanText = text.replace(/client\.(token|forbiddenWords)/g, '');

			if (/await/.test(cleanText)) {
				cleanText = `(async () => {${cleanText}})()`;
			}

			return cleanText;
		};


		let lang = (code.length > 0 ? 'js' : '') + '\n';

		let desc = "📥 **Code testé**\n```" + lang + code + "```\n";


		try {
			let evaluated = require('util').inspect(cleanAfter(eval(cleanBefore(code))), { depth: 1 });

			if (evaluated.length > 3500) {
				evaluated = evaluated.slice(0, 3500) + '\n\t// ...\n}';
			}

			lang = (evaluated.length > 0 ? 'js' : '') + '\n';

			desc += "📤 **Résultat**\n```" + lang + evaluated + "```";
		}

		catch (error) {
			console.error(error)
			desc += "📤 **Erreur**\n```" + lang + error + "```";
		}


		message.channel.send({ embeds: [{ description: desc, color: client.color.default }] });




    }
}