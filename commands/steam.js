
const settings = require("../settings.json");
const discord = require("discord.js");

const SteamAPI = require('steamapi');
const steam = new SteamAPI(settings.steam_token);
const Fuse = require('fuse.js');

const help = new discord.MessageEmbed()
	.setTitle(`Help for 'steam' command`)
    .addField("Command syntax", "`?color <1>`")
    .addField("Options for <1>", "code of color, you need to include #")

module.exports = {
	name: 'steam',
	description: 'steam related commands for now',
	help: help, 
	async execute(bot, message, args, discord, cmd){

        if(args[0]=="game"){
            let app_list = await steam.getAppList();

            const options = {
                isCaseSensitive: false,
                includeScore: true,
                shouldSort: true,
                threshold: 0.3,
                ignoreFieldNorm: false,
                minMatchCharLength: 2,
                keys: [ "name" ]
            };
            const fuse = new Fuse(app_list, options);
            const game_name = args.join(" ").slice(5,args.join(" ").length);

            const game_id = fuse.search(game_name)[0].item.appid;

            let game_data = await steam.getGameDetails(game_id);
            console.log(game_data);
            if(game_data.type=='game'){

                let embeds = [];

                let platforms ="";
                if(game_data.platforms.windows) platforms+=" `Windows`";
                if(game_data.platforms.mac) platforms+=" `Mac`";
                if(game_data.platforms.linux) platforms+=" `Linux`";

                let categories ="";
                game_data.categories.forEach(category =>{
                    categories+="`"+`${category.description}`+"`\n";
                });

                let genres ="";
                game_data.genres.forEach(genre =>{
                    genres+="`"+`${genre.description}`+"`\n";
                });

                const game_embed = new discord.MessageEmbed()
                .setImage(game_data.header_image)
                .setColor(message.guild.owner.roles.color.hexColor)
                .addFields(
                    {name: "Created by: ", value: game_data.developers, inline: true},
                    {name: "Available for: ", value: game_data.price_overview.final_formatted, inline: true},
                    {name: "Metacritic score: ", value: game_data.metacritic.score, inline: true}
                )
                .addFields(
                    {name: "Available on platform(s): ", value: platforms, inline: true},
                    {name: "Recommendations: ", value: game_data.recommendations.total, inline: true},
                    {name: "Achievements: ", value: `Whopping ${game_data.achievements.total}`, inline: true}
                )
                .addFields(
                    {name: "Game date release: ", value: game_data.release_date.date, inline: true},
                    {name: "Genre(s): ", value: genres, inline: true}
                    
                )
                .addFields(
                    {name: "Categories: ", value: categories, inline: false}
                )

                //embeds.push(game_embed);
                embeds.push(new discord.MessageEmbed()
                    .setImage(game_data.movies[0].thumbnail)
                    .setTitle('Some title')
                    .setURL(game_data.movies[0].webm.max) 
                );
                console.log(game_data.movies[0].webm.max);
                return message.channel.send(game_data.movies[0].webm.max);
            } else {
                return message.channel.send("This is not a game itself");
            }
        }

        
        //return message.channel.send(game_achiv.background);
        //return message.channel.send(fuse.search(args[0]));
    	/*let user_id = await steam.resolve('https://steamcommunity.com/id/CrimsonCupcake').then(id => {
	    	return id;
		});
		
		console.log('boi2 '+user_id);

		let summary = await steam.getUserSummary(user_id).then(summary => {
    		return summary;
    	});*/
	}
}