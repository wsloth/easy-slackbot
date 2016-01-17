# easy-slackbot [![npm version](https://badge.fury.io/js/easy-slackbot.svg)](https://badge.fury.io/js/easy-slackbot) [![issues](https://img.shields.io/github/issues/wsloth/easy-slackbot.svg)](https://github.com/wsloth/easy-slackbot/issues)

Node.js slackbot with customizable commands that makes sense.
At it's core, easy-slackbot is a wrapper around the [slackbotapi](https://github.com/xBytez/slackbotapi)
module made by @xBytez. I have tried to improve the ease of use of creating 
custom commands by providing a high-level way to add functionality.

## Installing

    $ npm install easy-slackbot --save

## Usage

*Note:* `'use strict';` is required for this bot to run. `easy-slackbot` uses
many Ecmascript 6 features.

```javascript
'use strict'; // Important! This uses many ES6 features.

var slack = require('easy-slackbot');
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
        // data = incoming message data. I recommend console.logging it
        // ctx = commandtext. Array of words in message. Log it.
        // slack = SlackBot instance. Use it to do slack.getUser(data.user).name
        // callback = call this function with your response message.
    
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

// Add an anonymous function if you can't be bothered to
// set up a whole extends Command class.
bot.addCommandDirectly('help', (data, ctx, slack, callback) => {
    callback('Read the docs, *fool*.');
});

// Connect async
bot.connect();
```

Due to the way the `slackbotapi` works, channels and users cannot be 
`@username` or `#channelname`. They must be accessed by their unique ID.
You can find this ID by running the example code with your own API token.
If you add the bot to all channels, you can start typing in any of them and 
check the console output for the event which will list the channel ID and the 
user ID of the person who is typing. Use this ID to create your custom commands.

Alternatively, use `SlackBot.getChannel('#general')` to get a channel object 
which you can use in your code. This also works for the user ID. Simply use 
`SlackBot.getUser('username')` and you will get an user object.  
After that, you can use the ID you extract from these objects to send a new 
message to a specific user or channel.

## TODO

* More detailed documentation
* Adding custom `.on('event', ...)` handlers
* Basically a high level wrapper around `slackbotapi`

## License

This program is licensed under the GPL-3.0 license.

## Documentation

For more detailed information, visit the [slackbotapi git repository.](https://github.com/xBytez/slackbotapi)  
These examples use `SlackBot.methodName()`, but you should be using your 
created instance of SlackBot. In the example above, you would use 
`bot.getChannel('#general')` to get the channel object.

### Before connecting

#### SlackBot.addCommand(command)
```
* Add a command to the bot.
* @param {Command} command Instance of a Command class.
* @example addCommand(new MyCommand())
```

#### SlackBot.addCommandDirectly(command, function)
You can use this to add commands without making use of the supplied `Command` 
class. Simply specify a word which the command will be triggered on, and add a 
function that has 4 arguments `(data, commandtext, slack, callback)`. To respond,
simply use `callback('your response')`.
```
* Add a new command directly without using Command.
* @param {string} cmd Lowercase string of command trigger word.
* @param {Function} func Callback function that accepts 4 arguments.
* @example addCommandDirectly('hello', (a, b, c, cb) => cb('Hey!'))
```

### SlackBot.connect()
This method will either work, or show you an appropriate error message.
```
* Initializes the registered commands and connects to Slack.
```

### After connecting

#### SlackBot.getUser(term)
```
* Get a user by name or ID
* @param  string  term  Search term
* @return object        Returns object with user if found, else null.
* @example getUser("xBytez")
```

#### SlackBot.getUserByEmail(term)
```
* Get a user by e-mail address
* @param  string  term  Search term
* @return object        Returns object with user if found, else null.
* @example getUserByEmail("slack@xbytez.eu")
```

#### SlackBot.getChannel(term)
```
* Get a channel by name or ID
* @param  string  term  Search term
* @return object        Returns object with channel if found, else null.
* @example getChannel("general")
```

#### SlackBot.getIM(term)
```
* Get IM by name or ID
* @param  string  term  Search term
* @return object        Returns object with IM if found, else null.
* @example getIM("xBytez")
```

#### SlackBot.sendTyping(channel)
```
* Indicates the user/bot is typing by sending a typing message to the socket
* @param  string channel  Channel/IM ID
* @example sendTyping("C0D12BCLV")
```

#### SlackBot.sendMsg(channel, text)
```
* Sends a message to a channel, private group or already existing IM/PM.
* @param  string channel  Channel/IM ID
* @param  string text  Message
* @example sendMsg("C0D12BCLV", "The cake is a lie!")
```

#### SlackBot.sendPM(userID, text)

Using `SlackBot.sendIM(userID, text)` will work too.
```
* Send a direct message, if not created, create one.
* @param  string userID Destination User ID
* @param  string text   Message
* @example sendPM("U0489398N")
```

#### SlackBot.getSlackData()
```
* Get current saved data
* @return object Returns object with locally saved data
* @example getSlackData()
```

