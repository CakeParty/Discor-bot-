const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const fs = require("fs");
const discord = require("discord.js");
const upper_limit = 10;

const help = new discord.MessageEmbed()
    .setTitle(`Help for 'set_intro' command`)
    .addField("Command syntax", "`?set_intro <1> <2> <3>`")
    .addField("Options for <1>", `duration of intro (in seconds) from 3 to ${upper_limit}`)
    .addField("Options for <2>", "youtube link, timestamp can be included to enable full customization of your intro")
    .addField("Options for <3> (for admin)", "nothing - if you want command to work on you\n@user - when you want command to for on certain user")

module.exports = {
	name: 'set_intro',
	description: 'set your intro music',
	help: help,
    async execute(bot, message, args, discord, cmd){

        let intro = JSON.parse(fs.readFileSync("./intro.json"));
        let user;
    	if(!args.length) return message.reply('You need to send the second argument!');
    	if(isNaN(args[0])) return message.reply('Second parameter needs to be a number!');
    	if(args[0] > upper_limit || args[0] < 3) return message.reply(`Time needs to be between 3 to ${upper_limit}`);  		

    	if(message.member.hasPermission('ADMINISTRATOR')) {
    		user = message.mentions.users.first() || message.author;
    	} else {
            user = message.author;
        }

        if(intro[user.id]){
    		if(intro[message.author.id].block){
    			return message.reply('Your intro has been blocked by admin');
    		}
    	}

    	if(ytdl.validateURL(args[1])){
    		
    		const song_info = await ytdl.getInfo(args[1]);
    		if(!intro[user.id]) intro[user.id] = {};
    		intro[user.id] = {
    			original_link: args[1],
    			active: true,
    			title: song_info.videoDetails.title,
    			url: song_info.videoDetails.video_url,
    			length: args[0],
    			block: false,
    			timestamp: Date.now(),
                img: song_info.videoDetails.thumbnails[3].url
    		}
    		fs.writeFile("./intro.json", JSON.stringify(intro), (err) => {
   				if (err) console.error(err);
			});
    		message.reply('Intro set successfully');
    	} else {
    		message.reply("It's not a youtube link");
    	} 	
    }
}