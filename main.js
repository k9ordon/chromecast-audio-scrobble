var chromecastPlayer = require('chromecast-player')();
var scribble = require('scribble');
var ping = require('ping');

var config = require('./config.json');

var accounts = config.accounts;
var base_scrobblers = [];
var ip_scrobblers = {};

// STATUS
var STATUS = false;
var LAST_TRACK = false;
var LAST_LAST_FM_RESPONSE = false;
var ONLINE_ACCOUNTS = false;

// iterate accounts
// setup scrobblers
accounts.forEach(function(account) {
    console.log(account.lastfm_username, account.ip);

    var scrobbler = new scribble(
        config.lastfm.key,
        config.lastfm.secret,
        account.lastfm_username,
        account.lastfm_password
    );

    if(account.ip) {
        ip_scrobblers[account.ip] = scrobbler;
    } else {
        base_scrobblers.push(scrobbler);
    }
});

// discover and init chromecast
chromecastPlayer.attach(function(err, p) {
    var session = p.currentSession;

    STATUS = session.playerState;

    p.on('status', onStatus);
});

// on chromecast status change
var onStatus = function(status) {
    console.log(status.playerState);

    STATUS = status.playerState;

    // if we play a track
    if(status.playerState == "PLAYING" && status.media && status.media.metadata) {

        var song = {
            artist: status.media.metadata.artist,
            track: status.media.metadata.songName,
            album: status.media.metadata.albumName
        };

        LAST_TRACK = song.artist + ' - ' + song.track;

        scrobbleSongOnAllScrobblers(song);
    }
}

var scrobbleSongOnAllScrobblers = function(song) {
    base_scrobblers.forEach(function(scrobbler) {
        scrobbleSong(scrobbler, song)
    });

    ONLINE_ACCOUNTS = [];

    for( var ip in ip_scrobblers) {
        ping.sys.probe(ip, function(isAlive){
            if(isAlive) {
                ONLINE_ACCOUNTS.push(ip_scrobblers[ip].username)
                scrobbleSong(ip_scrobblers[ip], song);
            }
        });
    }
}

var scrobbleSong = function(scrobbler, song) {
    console.log("scrobbleSong", scrobbler.username, song.track);

    scrobbler.Scrobble(song, function(response) {
        LAST_LAST_FM_RESPONSE = response;
    });
}

// simple http status server
var http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(STATUS + '\n\nLAST_TRACK\n' + LAST_TRACK + '\n\nONLINE_ACCOUNTS\n'  + ONLINE_ACCOUNTS + '\n\nLAST_FM_RESPONSE\n' + LAST_LAST_FM_RESPONSE);
}).listen(8123);
