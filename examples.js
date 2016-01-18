'use strict'; // Important! This uses many ES6 features.

var slack = require('./index');
var SlackBot = slack.Bot;
var Command = slack.Command;

// Create your custom command
class MyCmd extends Command {
    constructor(commands) {
        // Commands are the commands that will trigger your handler
        // can be 'string' or ['string', 'array']
        super(commands);
    }

    // Override the default handler (!)
    handler(data, ctx, slack, callback) {
        // This scope is NOT MyCmd. It is the SlackBot scope.
        // To access private methods, I recommend making them
        // static and accessing them through `MyCmd.Method()`
        var response = 'Hello there!';
        callback(response);
    }
}

// Set up the bot
var bot = new SlackBot({
    // API Auth token
    token: '<your slack token>',
    // Botname from @botmention
    name: 'U0J1BG81G',
    // Provide a onTeamJoin handler
    welcome: function(data) {
        callback('Welcome!');
    },
    // Command prefix
    prefix: '!',
    // Pass any custom commands
    commands: [
        new MyCmd(['hi', 'hello', 'hey']),
    ]
});

// Add an anonymous function if you can't be bothered to
// set up a whole extends Command class.
bot.addCommandDirectly('help', (data, ctx, slack, callback) => {
    callback('Read the docs, *fool*.');
});

// Connect async
bot.connect();
