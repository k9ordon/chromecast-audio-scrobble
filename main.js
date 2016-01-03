var chromecastPlayer = require('chromecast-player')();
var scribble = require('scribble');
var ping = require('ping');

var config = require('./config.json');

var accounts = config.accounts;
var scrobblers = {};

// STATUS
var STATUS = false;
var LAST_TRACK = false;
var LAST_LAST_FM_RESPONSE = false;
var ONLINE_ACCOUNTS = false;

var createScrobbler = function(account) {
  var scrobbler = new scribble(
      config.lastfm.key,
      config.lastfm.secret,
      account.lastfm_username,
      account.lastfm_password
  );
  return scrobbler;
};

// iterate accounts
// setup scrobblers
accounts.forEach(function(account) {
    if(account.active != true) return false;

    console.log('add user', account.lastfm_username);
    scrobblers[account.lastfm_username] = createScrobbler(account);
});

console.log(scrobblers);

// discover and init chromecast
chromecastPlayer.attach(function(err, p) {
    var session = p.currentSession;

    STATUS = session.playerState;

    console.log('status', STATUS);
    p.on('status', onStatus);
});

// on chromecast status change
var onStatus = function(status) {
    console.log('status', status.playerState);

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
    for (var username in scrobblers) {
        scrobbleSong(scrobblers[username], song)
    }
}

var scrobbleSong = function(scrobbler, song) {
    console.log("scrobble", scrobbler.username, song.track);

    // scrobbler.Scrobble(song, function(response) {
    //     LAST_LAST_FM_RESPONSE = response;
    // });
}

// simple http status server
var http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(STATUS + '\n\nLAST_TRACK\n' + LAST_TRACK + '\n\nONLINE_ACCOUNTS\n'  + ONLINE_ACCOUNTS + '\n\nLAST_FM_RESPONSE\n' + LAST_LAST_FM_RESPONSE);
}).listen(8123);
