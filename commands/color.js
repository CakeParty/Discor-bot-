
const fs = require('fs');
const discord = require("discord.js");

const help = new discord.MessageEmbed()
	.setTitle(`Help for 'color' command`)
    .addField("Command syntax", "`?color <1>`")
    .addField("Options for <1>", "code of color, you need to include #")

module.exports = {
	name: 'color',
	description: 'sets user color on server',
	help: help, 
	async execute(bot, message, args, discord, cmd){
    	
    	if(!args.length) return message.channel.send("You must pass second argument");
    	if(args[0].length!=7) return message.channel.send("The hex must have '#'+ 6 digits");
    	if(args[0][0]!='#') return message.channel.send("What did i say about '#'");
 		
 		let hex  = /^[A-F0-9]+$/i.test(args[0].slice(1, args[0].length)); 
 		if(!hex) return message.channel.send("This is not a hex code"); // check if hex

 		let role = message.guild.roles.cache.find(role => role.name == args[0].toUpperCase()); //check if role exists
 		if(!role){
 			await message.guild.roles.create({
 				data: {
				    name: args[0].toUpperCase(),
				    color: args[0]
  				},
  			})
  				.catch(console.error);
 		}

 		role = message.guild.roles.cache.find(role => role.name == args[0].toUpperCase());
 		
 		if (message.member.roles.cache.has(role.id)){
 			return message.channel.send("You already have this color");
 		} else {
 			let old_color = message.guild.member(message.member).roles.color //old color
 			if(old_color){
 				message.member.roles.remove(old_color.id).catch(console.error); //remowe old color
 			}
 			message.member.roles.add(role).catch(console.error); //add new color
 			return message.channel.send("Color changed");
 		}
	}
}