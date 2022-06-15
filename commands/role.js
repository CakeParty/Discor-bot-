
const fs = require('fs');
const discord = require("discord.js");
const { MessageAttachment } = require('discord.js')
const nodeHtmlToImage = require('node-html-to-image')

const help = new discord.MessageEmbed()
	.setTitle(`Help for 'role' command`)
    .addField("Command syntax", "`?role <1> <2> <3>`")
    .addField("Options for <1>", "@user - to check role(s) of another person\nserver - to show server's roles list\nadd - to add role(s)\nremove - to remove role(s)\npropose - to propose new role for server e.g: `?role propose 'wha are you gae?'`")
    .addField("Options for <2>", "index numbers of role(s) you want to add / delete e.g: `?role add 1 2 3`")
    .addField("Options for <3> (for admin)", "nothing - if you want command to work on you\n@user - when you want command to for on certain user")
    
module.exports = {
	name: 'role',
	description: 'personal role manager',
	help: help, 

    async execute(bot, message, args, discord, cmd){
    	
        let roles_tab =[], res ="";
        let user = message.mentions.members.first() || message.member;
        let role_return;

        if(args[0] != 'add' && args[0] != 'remove' && args[0] != 'propose' && args[0] != 'server'){   
            
            role_return = await roles(user, message, user.user.username, user.user.displayAvatarURL({ dynamic: true }), user.roles.color.hexColor, args[1]);
            message.channel.send(role_return[1]);
        }

        if(args[0] == "server"){
            role_return = await roles(message.guild, message, 'Server', message.guild.iconURL({ dynamic: true }), message.guild.owner.roles.color.hexColor, args[1]);
            message.channel.send(role_return[1]);
        }

        if(message.member.hasPermission('ADMINISTRATOR')){
            user = message.mentions.members.first() || message.member;
        } else {
            user = message.member; 
        }

        if(args[0]=='add'){

            if(!args[1]) return message.channel.send("You need to tell me which role(s) you want to add");

            role_return = await roles(message.guild, message, 'Server', message.guild.iconURL({ dynamic: true }), message.guild.owner.roles.color.hexColor, args[1]);
            
            let added=`${user.user.username}'s added roles: `, owned=`${user.user.username}'s already owned roles: `;
            
            for(let i = 1; i<=args.length-1; i++){

                if(args[i]){

                    if(args[i].slice(3, args[i].length-1) == user.id) break;
                    if(isNaN(args[i])) return message.channel.send(`${args[i]} is not a number`);
                    if(args[i] < 1 || args[i] > role_return[0].length) return message.channel.send(`There is no role under specified index`);
                    if(user.roles.cache.has(role_return[0][args[i]-1][1])) {
                        owned += ` ${args[i]}`;
                    } else {
                        added += ` ${args[i]}`;
                        user.roles.add(role_return[0][args[i]-1][1])
                    }
                }  
            }
            if(added!=`${user.user.username}'s added roles: `) message.channel.send(added);
            if(owned!=`${user.user.username}'s already owned roles: `) message.channel.send(owned);
        }

        if(args[0]=='remove'){

            if(!args[1]) return message.channel.send("You need to tell me which role(s) you want to delete");

            role_return = await roles(user, message, user.user.username, user.user.displayAvatarURL({ dynamic: true }), user.roles.color.hexColor, args[1]);

            let removed=`${user.user.username}'s removed roles:`;
            
            for(let i = 1; i<=role_return[0].length; i++){

                if(args[i]){

                    if(args[i].slice(3, args[i].length-1) == user.id) break;
                    if(isNaN(args[i])) return message.channel.send(`${args[i]} is not a number`);
                    if(args[i] < 1 || args[i] > role_return[0].length) return message.channel.send(`There is no role under specified index`);
                    
                    removed += ` ${args[i]}`;
                    user.roles.remove(role_return[0][args[i]-1][1])
                }  
            }
            if(removed!=`${user.user.username}'s removed roles:`) message.channel.send(removed);
        }

        //824608228281155626 new-role channel id
        if(args[0]=='propose'){

            let role_name="";
            if(!args[1]) return message.channel.send("You want to add empty role ?");

            for(let i=1; i<=args.length-1; i++){
                role_name+=args[i]+" ";
            }

            if(role_name[0]!="'" || role_name[role_name.length-2]!="'") return message.channel.send("You need to put role in brackets ' '");
            role_name= role_name.slice(1, role_name.length-2);
            if(role_name.length > 30) return message.channel.send("Role is too long");
            role_return = await roles(message.guild, message, 'Server', message.guild.iconURL({ dynamic: true }), "#0000ff", args[1]);
            
            let br = 0;
            role_return[0].some(role =>{
                if(role[0] == role_return || role_return=="Admin" || role_return=="@everyone" || role_return=="User" || role_return.slice(0,2)=='🙈' || role_return=="Tatsumaki" || role_return=="Tomas" || role_return=="Miki" || role_return=="Yes I'm not a robot" ) {
                    br=1;
                    return message.channel.send("This role already exists");
                }
            });

            if(br == 0){
                
                role_return = await roles("propose", message, user.user.username, user.user.displayAvatarURL({ dynamic: true }), user.roles.color.hexColor, role_name);
                const channel = bot.channels.cache.get('824608228281155626');
                return channel.send(role_return[1]);
            }
        }

	}
}

const roles = async (object, message, name, icon, color, role_name) => {
    
    roles_tab =[], res =""; 
    let i=0, embed_function="role(s)";

    if(object == "propose"){

        res += `<span style="float:left; padding: 5px">Preview:</span><div class = "role"><div class = "circle"></div><span>${role_name}</span></div><br>`;
        roles_tab.push(object);
        embed_function="proposition";
    } else {  
        object.roles.cache.map(r => {
        
            if(r.name!= "Admin" && r.name!= "@everyone" && r.name!= "User" && r.name.slice(0,2)!='🙈' && r.color==0 && r.name!= "Tatsumaki" && r.name!= "Tomas" && r.name!= "Miki" && r.name!= "Yes I'm not a robot"){        
                res += `<span style="float:left; padding: 5px">${i+1}.</span><div class = "role"><div class = "circle"></div><span>${r.name}</span></div><br>`;  
                roles_tab.push([r.name, r.id]);
                i++;   
            }     
        }); 
    }

    if(roles_tab.length==0) return [null, "There is nothing to show :frowning2:"];
    
    const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <style>
                    body{
                        font-family: "Whitney", 'Helvetica Neue';
                        font-size: 16px;
                        background: #2f3136;
                        color: #fff;
                        max-width: 350px;
                    }

                    .role{
                        height: 18px;
                        border-radius: 50px;
                        padding: 5px;
                        border: 1px solid #b9bbbe;
                        color: #b9bbbe;
                        margin-left: 5px;
                        width: auto;
                        display: inline-block;
                    }
                    .circle{
                        width: 16px;
                        height: 16px;
                        border-radius: 8px;
                        background: #b9bbbe;
                        margin-top: 1px;
                        float: left;
                    }
                    .role > span{
                        font-size: 14px;
                        float: left;
                        margin-left: 4px;
                        padding-right: 5px;
                        margin-top: 1px;
                        max-height: 16px;
                    }
                </style>
            </head>
            <body>
                ${res} 
            </body>
        </html>`

    const images = await nodeHtmlToImage({
        html: htmlTemplate,
        puppeteerArgs: {
            args: ['--no-sandbox'],
        },
        encoding: 'buffer',
    });

    let desc = "";
    if(object == "propose"){
        desc = "Role name: `"+role_name+"`";
    }
    const attachment = new MessageAttachment(images, `${name}.png`);
    let role_embed = new discord.MessageEmbed()
    .setAuthor(`${name}'s ${embed_function}`, icon)
    .setColor(color)
    .attachFiles(attachment)
    .setDescription(desc)
    .setImage(`attachment://${name}.png`)
    return [roles_tab, role_embed];
}