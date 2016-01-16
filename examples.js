'use strict';

var slack = require('./index');
var SlackBot = slack.Bot;
var Command = slack.Command;


// Create your custom command
class MyCmd extends Command {
    constructor(commands) {
        super(commands);
    }

    // Override the default handler (!)
    handler(data, ctx, slack, callback) {
        var response = 'Hello there!';
        callback(response);
    }
}

var bot = new SlackBot({
    // API Auth token
    token: '<your slack token>',
    // Botname from @botmention
    name: 'U0J1BG81G',
    // Provide a onTeamJoin handler
    welcome: function(data, ctx, slack, callback) {
        callback('Welcome!');
    },
    // Command prefix
    prefix: '!',
    // Pass any custom commands
    commands: [
        new MyCmd(['hi', 'hello', 'hey']),
    ],
});
bot.connect();