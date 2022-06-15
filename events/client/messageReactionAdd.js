
const fs = require("fs");

module.exports = async (discord, bot, reaction, user) =>{	

    if (reaction.partial) {
		// If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message: ', error);
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
	}
	const guild = reaction.message.guild;
	
	if(!guild.members.cache.get(user.id).hasPermission('ADMINISTRATOR')) return;
	
	const channel = bot.channels.cache.get('824608228281155626');
	if(channel != reaction.message.channel) return;
	console.log('ma admina');
	const stock = bot.emojis.cache.find(emoji => emoji.name === "stock");
	let tab = [];
	
	guild.roles.cache.forEach(role => {
		tab[role.rawPosition] = role.name;
	});

	let position = 1;
	for(let i=1; i<=tab.length-1; i++){
		if(tab[i]!==undefined){
			if(tab[i+1]===undefined){		
				position = i+1;
				break;
			} else if(tab[i].startsWith('#') && !tab[i+1].startsWith('#')){
				position = i+1;
				break;
			}
		}	
	}

	if(reaction.emoji === stock){
		const role_name = reaction.message.embeds[0].description.slice(12, reaction.message.embeds[0].description.length-1);
		let role = guild.roles.cache.find(x => x.name === role_name);
		
		if (role === undefined) {
		    await guild.roles.create({
			 	data: {
			    	name: role_name,
			    	color: '0',
			    	position, position
			  	},
			  	reason: `${reaction.message.member.user.username} acteped role proposition`,
			});
		}
	}
}