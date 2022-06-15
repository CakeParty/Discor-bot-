const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const discord = require("discord.js");
const fs = require("fs");

const help = new discord.MessageEmbed()
	.setTitle(`Help for 'play' and rest of music commands`)
    .setDescription("Help for 'play' command below")
    .addField("Command syntax", "`?play <1>`")
    .addField("Options for <1>", " - youtube video title\n - youtube link, timestamp can be included\n - spotify link")
    .addField("Help for the rest of music commands below", "`?skip` - skips currently played song\n`?stop` - stops music completly\n`?pause` - pauses / unpauses currently played song\n`?queue` - shows queue of songs to play")

//Global queue for your bot. Every server will have a key and value pair in this map. { guild.id, queue_constructor{} }
const queue = new Map();

module.exports = {
    name: 'playlist',
    aliases: [],
    description: 'music bot command, type `?help playlist` for more music commands',
    help: help,
    async execute(bot, message, args, discord, cmd){

        //This is our server queue. We are getting this server queue from the global queue.
        const server_queue = queue.get(message.guild.id);

        let playlist = JSON.parse(fs.readFileSync("./playlist.json"));
        let user = message.mentions.users.first() || message.author;
        let songs = [];
        let song = {};
        let res = "", i = 0;

        if(args[0] != 'add' && args[0] != 'del'){

            if(!playlist[user.id]) return message.channel.send("There is no playlist for given user");
            show_playlist(message, user, playlist);
        }

        if(args[0] == 'add'){

            songs = [];
            song = {};
            user = message.author;

            if(!playlist[user.id]){ playlist[user.id] = {}; } else { songs = playlist[user.id]; }
            if(playlist[user.id].length == 10) return message.channel.send("Your playlist is full");
            
            if (ytdl.validateURL(args[1])) {
                const song_info = await ytdl.getInfo(args[1]);
                song = { 
                    title: song_info.videoDetails.title, 
                    url: song_info.videoDetails.video_url, 
                    arg: args[1], 
                    pic: song_info.videoDetails.thumbnails[0].url, 
                    dur: duration_calc(song_info.videoDetails.lengthSeconds)
                }
                songs.push(song);
                playlist[user.id] = songs;
            } else {
                return message.channel.send("This is not a youtube link");
            }
            
            fs.writeFile("./playlist.json", JSON.stringify(playlist), (err) => {
                if (err) console.error(err);
            });
            return message.channel.send("Song added to playlist");
        }

        if(args[0] == 'del'){

            /*user = message.author;
            let temp_songs = [];

            if(!playlist[user.id]) return message.channel.send("There is nothing to delete from playlist");
            if(!args[0]) return message.channel.send("You need to tell me which song(s) you want to delete");

            temp_songs = playlist[user.id];

            for(let j = 1; j<=10; j++){

                if(args[j]){

                    if(isNaN(args[j])) return message.channel.send(`${args[j]} is not a number`);
                    if(args[j] < 1 || args[j] > playlist[user.id].length) return message.channel.send(`There is no song under specified index`);

                    if(playlist[user.id][args[j]-1]){

                        playlist[user.id].splice(args[j-1], 1);
                    }
                }  
            }

            show_playlist(message, user, playlist);
            fs.writeFile("./playlist.json", JSON.stringify(playlist), (err) => {
                if (err) console.error(err);
            });
            return message.channel.send("Song(s) deleted from playlist");*/
        }
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

const show_playlist = (message, user, playlist) => {
    
    let song = {};
    let res = "", i = 0;

    playlist[user.id].forEach(song =>{
        song = playlist[user.id][i]; 
        res += `${i+1}`+". "+`[${song.title}](${song.arg}) ${song.dur}`+"\n";
        i++;
    });

    const playlist_embed = new discord.MessageEmbed()
    .setAuthor(`${user.username}'s playlist`, user.displayAvatarURL({ dynamic: true }))
    .setColor(message.guild.member(user.id).roles.color.hexColor)
    .setDescription(res)
    return message.channel.send(playlist_embed);
}