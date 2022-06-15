const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
var { getData, getPreview } = require("spotify-url-info");
const discord = require("discord.js");

const help = new discord.MessageEmbed()
	.setTitle(`Help for 'play' and rest of music commands`)
    .setDescription("Help for 'play' command below")
    .addField("Command syntax", "`?play <1>`")
    .addField("Options for <1>", " - youtube video title\n - youtube link, timestamp can be included\n - spotify link")
    .addField("Help for the rest of music commands below", "`?skip` - skips currently played song\n`?stop` - stops music completly\n`?pause` - pauses / unpauses currently played song\n`?queue` - shows queue of songs to play")

//Global queue for your bot. Every server will have a key and value pair in this map. { guild.id, queue_constructor{} }
const queue = new Map();

module.exports = {
    name: 'play',
    aliases: ['skip', 'stop', 'pause', 'unpause', 'queue'],
    description: 'music bot command, type `?help play` for more music commands',
    help: help,
    async execute(bot, message, args, discord, cmd){

        //Checking for the voicechannel and permissions (you can add more permissions if you like).
        const voice_channel = message.member.voice.channel;
        if (!voice_channel) return message.channel.send('You need to be in a channel to execute this command!');
        const permissions = voice_channel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT')) return message.channel.send('You dont have the correct permissions');
        if (!permissions.has('SPEAK')) return message.channel.send('You dont have the correct permissions');

        //This is our server queue. We are getting this server queue from the global queue.
        const server_queue = queue.get(message.guild.id);

        //If the user has used the play command
        if (cmd === 'play'){
            if (!args.length) return message.channel.send('You need to send the second argument!');
            let song = {};

            //If the first argument is a link. Set the song object to have two keys. Title and URl.
            if (ytdl.validateURL(args[0])) {
                const song_info = await ytdl.getInfo(args[0]);
                console.log(song_info.videoDetails);
                song = { title: song_info.videoDetails.title, url: song_info.videoDetails.video_url, arg: args[0], pic: song_info.videoDetails.thumbnails[0].url, dur: duration_calc(song_info.videoDetails.lengthSeconds)}
            } else if (args[0].includes('spotify')) {
				const spotifyTrackInfo = await getPreview(args[0]);

				const videoFinder = async (query) => {
					const videoResult = await ytSearch(query);
					return videoResult.videos.length > 1 ? videoResult.videos[0] : null;
				};

				const video = await videoFinder(`${spotifyTrackInfo.title} ${spotifyTrackInfo.artist}`);
				if (video) {

					song = { title: video.title, url: video.url, arg: args[0], pic: video.thumbnail, dur: duration_calc(video.seconds)};
				} else {
					message.reply('Error finding song.');
				}
            } else {
                //If there was no link, we use keywords to search for a video. Set the song object to have two keys. Title and URl.
                const video_finder = async (query) =>{
                    const video_result = await ytSearch(query);
                    return (video_result.videos.length > 1) ? video_result.videos[0] : null;
                }

                const video = await video_finder(args.join(' '));
                if (video){
                	duration_calc(video.seconds)
                    song = { title: video.title, url: video.url, arg: video.url, pic: video.thumbnail, dur: duration_calc(video.seconds)}
                } else {
                    message.channel.send('Error finding video.');
                }
            }

            //If the server queue does not exist (which doesn't for the first video queued) then create a constructor to be added to our global queue.
            if (!server_queue){

                const queue_constructor = {
                    voice_channel: voice_channel,
                    text_channel: message.channel,
                    connection: null,
                    songs: []
                }
                
                //Add our key and value pair into the global queue. We then use this to get our server queue.
                queue.set(message.guild.id, queue_constructor);
                queue_constructor.songs.push(song);
    
                //Establish a connection and play the song with the vide_player function.
                try {
                    const connection = await voice_channel.join();
                    queue_constructor.connection = connection;
                    video_player(message.guild, queue_constructor.songs[0], args, discord);
                } catch (err) {
                    queue.delete(message.guild.id);
                    message.channel.send('There was an error connecting!');
                    throw err;
                }
            } else{
                server_queue.songs.push(song);
                return message.channel.send(`👍 **${song.title}** added to queue!`);
            }
        }
        else if(cmd === 'queue') show_queue(message, server_queue);
        else if(cmd === 'skip') skip_song(message, server_queue);
        else if(cmd === 'stop') stop_song(message, server_queue);
        else if(cmd === 'pause') pause_song(message, server_queue);
    }
    
}

const video_player = async (guild, song, args, discord) => {
    const song_queue = queue.get(guild.id);
    let timestamp;
    //If no song is left in the server queue. Leave the voice channel and delete the key and value pair from the global queue.
    if (!song) {
        song_queue.voice_channel.leave();
        queue.delete(guild.id);
        return;
    }
   	//check if song has timestamp
    if(!song.arg.indexOf("?t=")){
    	timestamp = 0;
    } else {
    	timestamp = parseInt(song.arg.slice(song.arg.indexOf("?t=")+3, song.arg.length), 10);
    }

    const stream = ytdl(song.url, { filter: 'audioonly'});
    song_queue.connection.play(stream, {seek: timestamp, volume: 0.2, bitrate: 96000})
    .on('finish', () => {
        song_queue.songs.shift();
        video_player(guild, song_queue.songs[0], args, discord);
    });

    const embed_play = new discord.MessageEmbed()
    .setTitle(`🎶 Now playing`)
    .setDescription(`[${song.title}](${song.arg})`)
    .setThumbnail(song.pic)
    .setColor('#ff0d00')

    await song_queue.text_channel.send(embed_play);
}

const show_queue = async (message, server_queue) => {

	if(!server_queue){
		message.channel.send("There is no song in queue");
	} else {
		
		let i=0, res="";
		let embed_queue = new discord.MessageEmbed()
		.setTitle(`🎶 Queue (${server_queue.songs.length} song(s)`)
		.setColor('#ff0d00') 
		
		server_queue.songs.forEach(song =>{
			song = server_queue.songs[i]; 
			res+=`${i+1}`+". "+`[${song.title}](${song.arg}) ${song.dur}`+"\n";
			i++;
		});
		embed_queue.setDescription(res);
		
		await message.channel.send(embed_queue);
	}
}

const skip_song = (message, server_queue) => {
    
    if(!message.member.voice.channel) return message.channel.send('You need to be in a channel to execute this command!');
    if(!server_queue){
        return message.channel.send(`There are no songs in queue 😔`);
    }
    server_queue.connection.dispatcher.end();
}

const stop_song = (message, server_queue) => {
    
    if(!message.member.voice.channel) return message.channel.send('You need to be in a channel to execute this command!');
    if(!server_queue) return message.channel.send('Nothing is being played 😔');
    server_queue.songs = [];
    server_queue.connection.dispatcher.end();
}

const pause_song = (message, server_queue) => {
    
    if(server_queue.connection.dispatcher.paused){
    	server_queue.connection.dispatcher.resume();
    	return message.channel.send("Unpaused the song!");
    } else {
    	server_queue.connection.dispatcher.pause();
  		return message.channel.send("Paused the song!");
    }
}

const duration_calc = (seconds) => {
    let res = ""
    if(seconds>=3600){
    	res += ((seconds/3600) | 0 )+":"+(((seconds/60) | 0 )-(((seconds/3600) | 0 )*60))+":"+seconds%60;
    } else {
    	res+= ((seconds/60) | 0 )+":"+seconds%60;
    }
    return res;
}