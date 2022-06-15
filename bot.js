
const discord = require("discord.js");
const bot = new discord.Client();
const fs = require('fs');
const settings = require("./settings.json");
bot.commands = new discord.Collection();
bot.events = new discord.Collection();

['event_handler', 'command_handler'].forEach(handler=>{
	require(`./handlers/${handler}`)(bot, discord);
})

bot.login('MzI4NjAzMjc1NTYzNzYxNjY1.WVABpg.v0_VSxR_aAfuaQdtPqV8giSn9Mw');