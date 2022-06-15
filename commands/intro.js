const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const fs = require("fs");
const discord = require("discord.js");

const help = new discord.MessageEmbed()
	.setTitle(`Help for 'intro' command`)
	.addField("Command syntax", "`?intro <1> <2>`")
    .addField("Options for <1>", "@user - to check intro of another person\non - to turn your intro on\noff - to turn your into off\nblock - block intro changes (admin command)\nunblock - unblock intro changes (admin command)")
    .addField("Options for <2> (for admin)", "nothing - if you want command to work on you\n@user - when you want command to for on certain user")

//'?intro <arg>\narg = @user\narg = on / off\narg = block / unblock\n?set_intro <time> <yt-link> to set intro | time = <3,5>', 
module.exports = {
	name: 'intro',
	description: 'intro music stuff',
	help: help,
	
    async execute(bot, message, args, discord, cmd){

    	let intro = JSON.parse(fs.readFileSync("./intro.json"));
        let user = message.mentions.users.first() || message.author;

    	//check if requested intro exists
    	if(!intro[user.id]){
            return message.channel.send("This intro hasn't been set yet");
        }

        //show embed for intro
        if(args[0] != 'off' && args[0] != 'on' && args[0] != 'block' && args[0] != 'unblock'){

            const embed = new discord.MessageEmbed()
            .setAuthor(`${user.username}'s intro`, user.displayAvatarURL({ dynamic: true }))
            .setColor(message.guild.member(user.id).roles.color.hexColor)
            //.setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .addField("Intro title ", intro[user.id].title)
            .addFields(
                {name: "Intro active ", value: intro[user.id].active, inline: true},
                {name: "Intro blocked ", value: intro[user.id].block, inline: true},
                {name: "Intro length (seconds)", value: intro[user.id].length, inline: true}
            )
            .addField("Intro link ", intro[user.id].original_link)
            .setImage(intro[user.id].img)
            message.channel.send(embed);
            return;
        }

    	if(message.member.hasPermission('ADMINISTRATOR')){
            user = message.mentions.users.first() || message.author;
        } else {
            user = message.author; 
        }

        if(args[0] == 'off' || args[0] == 'on'){
    		
    		if(intro[user.id].block) return message.reply(`Intro of ${user.username} has been blocked by admin`);
            if(args[0] == 'off'){
                if(intro[user.id].active){
                	intro[user.id].active = false;
                	message.channel.send(`Intro of ${user.username} has been deactivated`);
                } else {
                	message.channel.send(`Intro of ${user.username} is already inactive`);
                }
                    
            } else {
            	if(intro[user.id].active){
            		message.channel.send(`Intro of ${user.username} is already active`);
            	} else {
            		intro[user.id].active = true;
               		message.channel.send(`Intro of ${user.username} has been activated`);
            	}       
            }

    	} else if(args[0] == 'block' || args[0] == 'unblock'){

    		if(!message.member.hasPermission('ADMINISTRATOR')) return message.reply("You don't have permission to do that");
    		if(args[0] == 'block'){
                intro[user.id].block = true;
                message.channel.send(`Intro of ${user.username} has been blocked`);
            } 
            else {
                intro[user.id].block = false;
                message.channel.send(`Intro of ${user.username} has been unblocked`);
    		}
    	}
            
        fs.writeFile("./intro.json", JSON.stringify(intro), (err) => {
            if (err) console.error(err);
        });	
    }
}