'use strict';
var Slack = require('slackbotapi');

class SlackBot {

    constructor(options) {
        this.token = options.token;
        this.prefix = options.prefix ? options.prefix : '!';
        this.commands = options.commands ? options.commands : [];
        this.switch = {};

        if (options.name)
            this.name = options.name;
        else if (process.env.SLACK_BOTNAME)
            this.name = `<@${process.env.SLACK_BOTNAME}>`;
        else
            console.warn('No $SLACK_BOTNAME found. See the documentation.');

        if (typeof options.welcome === 'function')
            this.welcome = options.welcome;
        else {
            console.warn(`No welcome message handler found! Using default.`);
            this.welcome = (dt, ctx, cb) => {
                cb(`Hey there @${this.api.getUser(dt.user).name}! Welcome to the team!`);
            };
        }
    }

    addCommand(command) {
        if (command instanceof Command)
            this.commands.push(command);
        else
            throw new Error('You must give an instance of a Command object.');
    }

    // PRIVATE METHODS ====================================================== #

    _onMessage(data) {
        if (typeof data.text == 'undefined') return;

        // Received a command
        var isValidMention = data.text.startsWith(this.name);
        if (data.text.charAt(0) === this.prefix || isValidMention) {

            // Split the command and it's arguments into an array
            var command;
            if (isValidMention) {
                command = data.text.substring(this.name.length).split(' ');
                command.splice(0, 1);

                if (command[0].startsWith(this.prefix))
                    command[0] = command[0].substring(1);
            }
            else
                command = data.text.substring(1).split(' ');

            // if [command] [extra] [more], store all in [extra]
            if (typeof command[2] != 'undefined') {
                for (var i = 2; i < command.length; i++) {
                    command[1] = command[1] + ' ' + command[i];
                }
            }

            // Respond if the command is in the commands array
            var cmd = command[0].toLowerCase();
            if (typeof this.commands[cmd] == 'function') {
                this.commands[cmd](data, command, this, function(res) {
                    this.api.sendMsg(data.channel, res);
                });
            }
            else {
                // Do other interactive things that do not require a set cmd
                // Basically, someone said an @botname !command or similar
                // but that command doesn't exist
                // handle that here
            }
        }
    }


    // API SETUP ============================================================ #

    connect() {
        // Construct the commands switch
        for (let command in this.commands) {
            for (let cmd in command) {
                if (this.switch[cmd])
                    throw new Error(`Command "${cmd}" already exists.`);
                else
                    this.switch[cmd] = command.handler;
            }
        }

        // Connect to the API
        this.api = new Slack({
            'token': this.token,
            'logging': true,
            'autoReconnect': true,
        });

        this.api.on('message', this._onMessage);
        this.api.on('team_join', this.welcome);
    }

    // PUBLIC METHODS ======================================================= #

    sendMsg(channel, message) {
        this.api.sendMsg(channel, message);
    }

    getUser(id) {
        return this.api.getUser(id);
    }

}

class Command {
    
    constructor(commands) {
        if (Object.prototype.toString.call(commands) === '[object Array]')
            this.commands = commands;
        else if (typeof commands === 'string')
            this.commands = [commands];
        else
            throw new Error('You must provide a command string or a string array.');
    }

    * [Symbol.iterator]() {
        yield * this.commands;
    }

    handler(data, ctx, callback) {
        throw new Error('You must override the default handler() method.');
    }
}


module.exports.Bot = SlackBot;
module.exports.Command = Command;