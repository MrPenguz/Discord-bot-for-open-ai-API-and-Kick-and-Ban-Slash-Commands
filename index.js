require('dotenv/config');
const eventHandler = require('./handlers/eventHandler');
const { Client, ActivityType } = require('discord.js');
const { OpenAI } = require("openai");
const client = new Client({
    intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent']
});
client.on('ready', () => {
    client.user.setActivity('Customized Status for your bot'); //customizing your bot status
    console.log('The Bot Is Online') //bot Check one Before Registering The Commands
});
const IGNORE_PREFIX = "!";
const CHANNELS = ['Place The Channel Id where your chatgpt api want it to work']; //Replace with your Channel ID
const YOUR_SERVER_ID = process.env.SERVER_ID; // Replace with your server ID
const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
})
client.login(process.env.TOKEN);
client.on('messageCreate', async (message) => {
    //console.log(message.content)
    if (message.channel.type === 'DM') return; // No Dms!

    if (message.guild.id !== YOUR_SERVER_ID) return; //Only Your Server

    if (message.author.bot) return; //never talks with bots 

    if (message.content.startsWith(IGNORE_PREFIX)) return; //never answer if we start with !

    if (!CHANNELS.includes(message.channelId)) return; //he  send only into specific channels

    if (!message.mentions.users.has(client.user.id)) return; //only answer when mentioned (Optional)

    const sendTypingInterval = setInterval(() => {
        message.channel.sendTyping();
    }, 5000);

    let conversationMemory = [];
    conversationMemory.push({
        role: 'system',
        "content": " Your Bot Discription" // Here You Can place how your bot will behave 
    });

    let prevMessages = await message.channel.messages.fetch({ limit: 10 });

    prevMessages.reverse();

    prevMessages.forEach((msg) => {
        if (msg.author.bot && msg.author.id !== client.user.id) return;

        if (msg.content.startsWith(IGNORE_PREFIX)) return;

        const username = msg.author.username.replace(/\s+/g, '_').replace(/[^\w\s]/gi, '');

        if (msg.author.id === client.user.id) {
            conversationMemory.push({
                role: 'assistant',
                name: username,
                content: msg.content,
            });
            return;
        }

        conversationMemory.push({
            role: 'user',
            name: username,
            content: msg.content,
        })
    })

    const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: conversationMemory,
    })
        .catch((error) => console.error('OPENAI Problem : ', error));

    clearInterval(sendTypingInterval);
    if (!response) {
        message.reply('Im Having Trouble With OpenAI Services Try Again in a moment');
        return;
    }

    const responsemessage = response.choices[0].message.content;

    const chunksizelimit = 2000;

    for (let i = 0; i < responsemessage.length; i += chunksizelimit) {
        const chunk = responsemessage.substring(i, i + chunksizelimit);

        await message.reply(chunk);
    }

})
eventHandler(client)
client.login(process.env.TOKEN)