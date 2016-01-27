/*jslint node: true */
'use strict';
var Slack = require('slackbotapi');

function SlackBot(options) {

    var token = options.token,
        prefix = options.prefix || '!',
        commands = options.commands || [],
        cmdswitch = {},
        name,
        welcome,
        api;

    if (options.name)
        name = `<@${options.name}>`;
    else if (process.env.SLACK_BOTNAME)
        name = `<@${process.env.SLACK_BOTNAME}>`;
    else
        console.warn('No $SLACK_BOTNAME found. See the documentation.');

    if (typeof options.welcome === 'function')
        welcome = options.welcome;
    else {
        console.warn(`No welcome message handler found! Using default.`);
        welcome = (dt, ctx, cb) => {
            cb(`Hey there @${api.getUser(dt.user).name}! Welcome to the team!`);
        };
    }

    /*
     * Add a command to the bot.
     * @param {Command} command Instance of a Command class.
     * @example addCommand(new MyCommand())
     */
    var addCommand = function(command) {
        if (command instanceof Command)
            commands.push(command);
        else
            throw new Error('You must give an instance of a Command object.');
    };

    /*
     * Add a new command directly without using Command.
     * @param {string} cmd Lowercase string of command trigger word.
     * @param {Function} func Callback function that accepts 4 arguments.
     * @example addCommandDirectly('hello', (a, b, c, cb) => cb('Hey!'))
     */
    var addCommandDirectly = function(cmd, func) {
        if (typeof func === 'function') {
            if (typeof cmdswitch[cmd] === 'function') {
                throw new Error(`The command "${cmd}" already exists.`);
            } else {
                cmdswitch[cmd] = func;
            }
        } else {
            throw new Error('You must provide a function to add directly.');
        }
    }

    // PRIVATE METHODS ====================================================== #

    var _onMessage = function(data) {
        if (typeof data.text === 'undefined') return;

        // Received a command
        var isValidMention = data.text.startsWith(name);
        if (data.text.charAt(0) === prefix || isValidMention) {

            // Split the command and it's arguments into an array
            var command;
            if (isValidMention) {
                command = data.text.substring(name.length).split(' ');
                command.splice(0, 1);

                if (!command[0])
                    return;
                
                if (command[0].startsWith(prefix))
                    command[0] = command[0].substring(1);
            } else
                command = data.text.substring(1).split(' ');

            // if [command] [extra] [more], store all in [extra]
            if (typeof command[2] !== 'undefined') {
                for (var i = 2; i < command.length; i++) {
                    command[1] = command[1] + ' ' + command[i];
                }
            }

            // Respond if the command is in the commands array
            var cmd = command[0].toLowerCase();
<<<<<<< HEAD
            if (typeof cmdswitch[cmd] == 'function') {
                cmdswitch[cmd](data, command, this, function (res) {
=======
            if (typeof cmdswitch[cmd] === 'function') {
                cmdswitch[cmd](data, command, this, function(res) {
>>>>>>> 89dd128e4914f683ebc3ff96d1b4294854ca757a
                    api.sendMsg(data.channel, res);
                });
            } else {
                // Do other interactive things that do not require a set cmd
                // Basically, someone said an @botname !command or similar
                // but that command doesn't exist
                // handle that here
            }
        }
    };


    // API SETUP ============================================================ #

    /*
     * Initializes the registered commands and connects to Slack.
     */
    var connect = function() {
        // Construct the commands switch
        for (var command in commands) {
            for (var cmd of commands[command]) {
                if (cmdswitch[cmd])
                    throw new Error(`Command "${cmd}" already exists.`);
                else {
                    cmdswitch[cmd] = commands[command].handler;
                }
            }
        }

        // Connect to the API
        api = new Slack({
            'token': token,
            'logging': true,
            'autoReconnect': true
        });

        api.on('message', _onMessage);
        api.on('team_join', welcome);
    };

    // PUBLIC METHODS ======================================================= #

    return {
        // Slackbotapi methods
        getUser: (term) => api.getUser(term),
        getUserByEmail: (term) => api.getUserByEmail(term),
        getChannel: (term) => api.getChannel(term),
        getIM: (term) => api.getIM(term),
        sendMsg: (channel, message) => api.sendMsg(channel, message),
        sendPM: (userID, message) => api.sendPM(userID, message),
        getSlackData: () => api.getSlackData(),
        sendTyping: (channel) => api.sendTyping(channel),

        // Custom methods
        connect: connect,
        addCommand: addCommand,
        addCommandDirectly: addCommandDirectly
    };
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
module.exports.SlackBot = SlackBot;
module.exports.Command = Command;
