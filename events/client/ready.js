
module.exports = (discord, bot, message) =>{	
    
    bot.user.setPresence({
        status: "online",
        activity: {
            name: `type ?help`,
        }
    });
    console.log(`Discord Bot ${bot.user.tag} is online!`);
    cache_propositions(discord, bot); 
}

const cache_propositions = (discord, bot) => {
	
	const channel = bot.channels.cache.get('824608228281155626');
	channel.messages.fetch();
}