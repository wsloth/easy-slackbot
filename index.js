'use strict';
var Slack = require('slackbotapi');

function SlackBot(options) {

    var token = options.token;
    var prefix = options.prefix ? options.prefix : '!';
    var commands = options.commands ? options.commands : [];
    var cmdswitch = {};

    var name;
    var welcome;
    var api;

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

    var addCommand = function (command) {
        if (command instanceof Command)
            commands.push(command);
        else
            throw new Error('You must give an instance of a Command object.');
    };
    
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
    };

    // PRIVATE METHODS ====================================================== #

    var _onMessage = function (data) {
        if (typeof data.text == 'undefined') return;

        // Received a command
        var isValidMention = data.text.startsWith(name);
        if (data.text.charAt(0) === prefix || isValidMention) {
            console.log('Command message received.');

            // Split the command and it's arguments into an array
            var command;
            if (isValidMention) {
                command = data.text.substring(name.length).split(' ');
                command.splice(0, 1);

                if (command[0].startsWith(prefix))
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
            console.log(cmd);
            console.log(cmdswitch);
            if (typeof cmdswitch[cmd] == 'function') {
                cmdswitch[cmd](data, command, this, function (res) {
                    api.sendMsg(data.channel, res);
                });
            }
            else {
                // Do other interactive things that do not require a set cmd
                // Basically, someone said an @botname !command or similar
                // but that command doesn't exist
                // handle that here
            }
        }
    };


    // API SETUP ============================================================ #

    var connect = function () {
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
            'autoReconnect': true,
        });

        api.on('message', _onMessage);
        api.on('team_join', welcome);
    };

    // PUBLIC METHODS ======================================================= #

    return {
        getUser: (id) => { return api.getUser(id) },
        sendMsg: (channel, message) => api.sendMsg(channel, message),
        sendPM: (userID, message) => api.sendPM(userID, message),
        connect: connect,
        addCommand: addCommand,
        addCommandDirectly: addCommandDirectly,
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
module.exports.Command = Command;