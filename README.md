# easy-slackbot

Node.js slackbot with customizable commands that makes sense.

## Installing

    $ npm install easy-slackbot --save

## Usage

Using `'use strict';` is required for this bot to run.

```javascript
'use strict';
var slack = require('easy-slackbot');
var Command = slack.Command;
var SlackBot = slack.Bot;

// Create your custom command
class MyCmd extends Command {
    constructor(commands) {
        super(commands);
    }

    // Override the default handler (!)
    handler(data, ctx, callback) {
        var response = 'Hello there!';
        callback(response);
    }
}

var bot = new SlackBot({
    // API Auth token
    token: 'your slack api token',
    // Botname from @botmention
    name: 'U0J1BG81G',
    // Provide a onTeamJoin handler
    welcome: function(data, ctx, callback) {
        callback('Welcome!');
    },
    // Command prefix
    prefix: '!',
    // Pass any custom commands
    commands: [
        new MyCmd(['hi', 'hello', 'hey']),
    ],
});

// Add commands later
bot.addCommand(new MyCmd('heyyy'));

// Initialize and connect
bot.connect();
```

## TODO

* Custom OnTeamJoin event

## License

This program is licensed under the GPL-3.0 license.