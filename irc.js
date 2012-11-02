#!/usr/bin/env node


//requires
var cradle = require('cradle'),
    clc = require('cli-color'),
    irc = require('irc'),
    util = require('util'),
    ic = require('irc-colors');

// Cli-color styling
var error = clc.red;
var warn = clc.yellow;
var notice = clc.blue;
var green = clc.green;

// IRC color styling



// Cradle Config
cradle.setup({
    host: '192.168.234.92',
    cache: true,
    raw: false,
    });

//IRCBOT
var bot = new irc.Client('irc.esper.net', 'wpcsgo', {
    channels:   ['#wpcsgo'],
    debug:      true,
});

//Listeners
bot.addListener('connect', function (message) {
    console.log(notice(message));
});

bot.addListener('registered', function (message) {
    console.log(notice(message));
});
bot.addListener('error', function (message) {
    console.log(error('Error: ', message));
});

bot.addListener('pm', function (from, message) {
    console.log(green(from + ' => ME: ' + message));
});

bot.addListener('message', function (from, to, message) {
    console.log(green(from + ' => ' + to + ': ' + message));
});

//DB
var c = new(cradle.Connection);
var db = c.database('google-strike');

// Checks if db exists, if not, creates.
db.exists(function (err, exists) {
    if (err) {
        console.log('Error:', err);
    } else if (exists) {
      console.log(error('Lights...') + '    ' + warn('Camera...') + '    ' + green('Counter!'));
    } else {
      console.log(warning('db does not exist, creating...'));
      db.create();
    }
});

var dbfeed = db.changes({ since: "now" });

// Feed of messages
dbfeed.on('change', function(change) {
    db.get(change.id, function(err, doc) {
    //type cases
    //pd = player_death
    //fb = flashbang
    //re = round_end
    //bp = bomb_planteda
    time = doc.time;
    min  = Math.floor(time /60);
    sec  = time - min *60;
    min  = String("0" + min).slice(-2);
    sec  = String("0" + sec).slice(-2);
    if (doc.plant == 1) {
        time = ic.red('[')+ic.white(min)+ic.red(':')+ic.white(sec)+ic.red(']');
    } else {
        time = ic.white('[')+ic.green(min)+ic.white(':')+ic.green(sec)+ic.white(']');
    };
    switch (doc.type) {
        case "pd":
            if (doc.headshot == 1) {
            bot.say(
            '#wpcsgo'
            , time+'['+ic.red(doc.attacker)+'] killed ['+ic.navy(doc.victim)+'] with a ['+doc.weapon+'] [H]'
            );
            } else { 
            bot.say(
            '#wpcsgo'
            , time+'['+ic.red(doc.attacker)+'] killed ['+ic.navy(doc.victim)+'] with a ['+doc.weapon+']'
            );
            }
            break;
        case "fb":
            bot.say(
            '#wpcsgo'
            , '['+ic.red(doc.name)+'] is blinded by a flashbang!]'
            ); 
            break;
        case "re":
            bot.say(
            '#wpcsgo'
            , time+ ' Team ['+ic.red(doc.winner)+'] won the round ['+ic.blue('reason'+doc.reason)+']'
            );
            break;
        case "bp":
            bot.say(
            '#wpcsgo'
            , time+'['+ic.red(doc.name)+']'+'planted the bomb.'
            );
            break;
        default: bot.say('#hackers', "fart");
    }
    });
});
