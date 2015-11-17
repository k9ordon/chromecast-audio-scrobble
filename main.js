var player = require('chromecast-player')();
var scribble = require('scribble');
var config = require('./config.json');

var Scrobbler = new scribble(config.lastfm.key,config.lastfm.secret,config.lastfm.username,config.lastfm.password);

var STATUS = false;
var LAST_TRACK = false;
var LAST_LAST_FM_RESPONSE = false;


player.attach(function(err, p) {
    var session = p.currentSession;
    STATUS = session.playerState;
    p.on('status', onStatus);
});

var onStatus = function(status) {
    STATUS = status.playerState;

    if(status.playerState == "PLAYING" && status.media && status.media.metadata) {
/*
        console.log('now playing: ',
            status.media.metadata.songName,
            status.media.metadata.artist,
            status.media.metadata.albumName
        );
*/
        var song = {
            artist: status.media.metadata.artist,
            track: status.media.metadata.songName,
            album: status.media.metadata.albumName
        };

        LAST_TRACK = song.artist + ' - ' + song.track;

        Scrobbler.Scrobble(song, function(response) {
            LAST_LAST_FM_RESPONSE = response;
        });
    }
}

var http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(STATUS + '\n' + LAST_TRACK + '\n' + LAST_LAST_FM_RESPONSE);
}).listen(8123);
