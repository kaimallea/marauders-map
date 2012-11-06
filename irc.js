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
          console.log(warn('db does not exist, creating...'));
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
        hour = 
        min  = Math.abs(min);
        min  = String("0" + min).slice(-3);
        sec  = String("0" + sec).slice(-2);
        
        //String Interp Vars
        if (doc.plant == 1) {           //Sets plant bool for changing timer var color
            time = ic.red(min)+ic.white(':')+ic.red(sec);
        } else {
            time = ic.green(min)+ic.white(':')+ic.green(sec);
        };
        if (doc.ateam == 2) {           //Sets irc color for attacker var
            attacker = ic.red(doc.attacker)
            } else if(doc.ateam == 3) {
            attacker = ic.navy(doc.attacker)
        }
        if (doc.vteam == 2) {           //Sets irc color for victim var
            victim = ic.red(doc.victim)
            } else if(doc.vteam == 3) {
            victim = ic.navy(doc.victim)
        }
        if (doc.team == 2) {            //Sets irc color for client var
            name = ic.red(doc.name)
            } else if(doc.team == 3) {
            name = ic.navy(doc.name)
        }
        switch (doc.type) {
            case "pd":      //Handle Player Death
                if (doc.headshot == 1) {
                headshot = 'o'+ic.red('<');
                bot.say(
                '#wpcsgo'
                , util.format('[%s] [%s] killed [%s] with a [%s] [%s]'
                , time, attacker, victim, doc.weapon, headshot
                )
                //, time+'['+attacker+'] killed ['+victim+'] with a ['+doc.weapon+'] [o'+ic.red('<')+']'
                );
                } else { 
                bot.say(
                '#wpcsgo'
                , util.format('[%s] [%s] killed [%s] with a [%s]' 
                , time, attacker, victim, doc.weapon 
                )
                );
                }
                break;
        case "fb":      // Handle Flashbangs
            bot.say(
            '#wpcsgo'
            , util.format('[%s] [%s] was blinded by a flashbang'
            , time, name
            )
            ); 
            break;
        case "re":      // Handle Round End
            bot.say(
            '#wpcsgo'
                    , util.format('[%s] Team: [%i] won! Reason: [%i]'
            , time, doc.winner, doc.reason
            )
            );
            break;
        case "bp":      // Handle Bomb Planted
            bot.say(
            '#wpcsgo'
            , time+'['+ic.red(doc.name)+']'+'planted the bomb.'
            );
            break;
        case "bd":      // Handle Bomb Defused
            bot.say(
            '#wpcsgo'
            , time+'['+ic.navy(doc.name)+']'+'defused the bomb.'
            );
        break;

        case "hed":     //Handle He Detonated 
            bot.say(
            '#wpcsgo'
            , time+'['+name+']'+'\'s HE exploded at ['+ic.red('X: '+doc.x+' Y: '+doc.y)+']'
            );
        break;
        default: bot.say('#wpcsgo', "fart");
    }
    });
});
