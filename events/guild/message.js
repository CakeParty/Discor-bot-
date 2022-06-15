
module.exports = (discord, bot, message) =>{	
	const prefix = '?';
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	const args = message.content.slice(prefix.length).split(" ");
	const cmd = args.shift().toLowerCase();

	if(message.channel.id != "282880417688846337" && message.channel.id != "816984643642458113" && message.channel.id != "816984643642458113" && message.channel.id != "824325065839214592") return;

	const command = bot.commands.get(cmd) || bot.commands.find(a => a.aliases && a.aliases.includes(cmd));
	try {
		command.execute(bot, message, args, discord, cmd);
	} catch (err) {
		message.reply("Something went wong with command");
	}
}