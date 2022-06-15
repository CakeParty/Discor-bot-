
const fs = require('fs');
const discord = require("discord.js");

const help = new discord.MessageEmbed()
	.setTitle(`Help for 'help' command.. rly nigga?`)
    .addField("Command syntax", "`?help <1>`")
    .addField("Options for <1>", "name of another command")
    
module.exports = {
	name: 'help',
	description: 'help for dummies',
	help: help, 

    async execute(bot, message, args, discord, cmd){
    	
    	let res = "", command;
    	if(args[0]){
    		
    		try {
    			command = require(`../commands/${args[0]}.js`);
    		} catch (err) {
    			return message.channel.send("There is no such command");
    		}
    		
    		if(command.help){
    			command.help.setColor(message.guild.member(bot.user).roles.highest.hexColor);
    			message.channel.send(command.help);
    		} else {
    			message.channel.send("There is no such command");
    		}

    	} else {
	    	const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
	    	for(const file of commandFiles){
				const command = require(`../commands/${file}`);
		   		if(command.name){
		   			res += "`?" + command.name + "` - " + command.description + "\n";
		   		} else {
		   			continue;
		   		}
	    	}

	    	const embed = new discord.MessageEmbed()
	        .setTitle(`Fear not ${message.author.username}, ${bot.user.username} shall guide you.`)
	        .setDescription("Type `?help <command>` for more information about command")
	        .setColor(message.guild.member(bot.user).roles.highest.hexColor)
	        .addField("Commands", res);
        	message.channel.send(embed);
    	}
	}
}