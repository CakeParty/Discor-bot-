
module.exports = (discord, bot, packet) =>{	
        console.log(packet.t);
    if(packet.t == 'MESSAGE_REACTION_ADD'){
        // Grab the channel to check the message from
        const channel = bot.channels.cache.get(packet.d.channel_id);
        // There's no need to emit if the message is cached, because the event will fire anyway for that
        channel.messages.fetch(packet.d.message_id).then(message => {
            
            const reaction = message.reactions.cache.last(1);
            console.log(reaction);
            //Adds the currently reacting user to the reaction's users collection.
            /*if (reaction) reaction.users.cache.set(packet.d.user_id, bot.users.get(packet.d.user_id));
            // Check which type of event it is before emitting
            if (packet.t === 'MESSAGE_REACTION_ADD') {
                bot.emit('messageReactionAdd', reaction, bot.users.cache.get(packet.d.user_id));
            }*/
        });
        if (channel.messages.cache.has(packet.d.message_id)) return;
        console.log('react2');
        // Since we have confirmed the message is not cached, let's fetch it
        channel.messages.fetch(packet.d.message_id).then(message => {
            
            const reaction = message.reactions.cache.last(1);
            console.log(reaction);
            //Adds the currently reacting user to the reaction's users collection.
            /*if (reaction) reaction.users.cache.set(packet.d.user_id, bot.users.get(packet.d.user_id));
            // Check which type of event it is before emitting
            if (packet.t === 'MESSAGE_REACTION_ADD') {
                bot.emit('messageReactionAdd', reaction, bot.users.cache.get(packet.d.user_id));
            }*/
        });
    } 
}