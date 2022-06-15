const ytdl = require('ytdl-core');
const fs = require("fs");

module.exports = (discord, bot, oldmem, newmem) =>{	
    
    if(!oldmem.channelID && newmem.channelID && !newmem.member.user.bot){
		
        //console.log(`${newmem.member.user.username} wbił na ${newmem.channel.name}`);
		let intro = JSON.parse(fs.readFileSync("./intro.json"));
    	let user = newmem.member.user;

    	if(!intro[user.id]){

    		console.log("Brak intro do zagrania");
    		
    	} else {

    		const dif = ((Date.now() - intro[user.id].timestamp) / 1000).toFixed(1); //diffrence in seconds
    		console.log("dif = "+dif);
    		if(dif >= 30){ //1800
                if(intro[user.id].active){
                    console.log(intro[user.id].active);
                    play_intro(discord, bot, intro, newmem, user, oldmem);
                }
    		} 
    	}
	}
}

const play_intro = async (discord, bot, intro, newmem, user, oldmem) => {

    let try_i;
    try{
        try_i = oldmem.guild.voiceStates.cache.get(bot.user.id).channelID;
    } catch (err){

    }
    //check if bot is already in chat
    if(!oldmem.guild.voiceStates.cache.get(bot.user.id) || !try_i){ 
        // set intro played flag using timestamp
        intro[user.id].timestamp = Date.now();
        fs.writeFile("./intro.json", JSON.stringify(intro), (err) => {
            if (err) console.error(err);
        }); //update tiemstamp of last played intro

        const url = intro[user.id].url;
        const voice = newmem.channel;
        const connection = await voice.join();
        let timestamp;

        if(!intro[user.id].original_link.indexOf("?t=")){
            timestamp = 0;
        } else {
            timestamp = parseInt(intro[user.id].original_link.slice(intro[user.id].original_link.indexOf("?t=")+3, intro[user.id].original_link.length), 10);
        }
        console.log("zagrano");
        const stream  = ytdl(url, {filter: 'audioonly'});
            connection.play(stream, {seek: timestamp, volume: 0.3, bitrate: 96000})
            .on('finish', () =>{
            voiceChannel.leave();
        });
        setTimeout(stop_intro, intro[user.id].length*1000+200, discord, voice);
    } else {
        console.log("kurwa");
    }
}

const stop_intro = async (discord, voice) => {

    await voice.leave();
}