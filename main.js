var player = require('chromecast-player')();
var scribble = require('scribble');
var config = require('./config.json');

var Scrobbler = new scribble(config.lastfm.key,config.lastfm.secret,config.lastfm.username,config.lastfm.password);

player.attach(function(err, p) {
    var session = p.currentSession;

    console.log(session.playerState);

    p.on('status', onStatus);
});

var onStatus = function(status) {
    //console.log('\n\nstatus changed', status);

    if(status.playerState == "PLAYING" && status.media.metadata) {

        console.log('now playing: ',
            status.media.metadata.songName,
            status.media.metadata.artist,
            status.media.metadata.albumName
        );

        var song = {
            artist: status.media.metadata.artist,
            track: status.media.metadata.songName,
            album: status.media.metadata.albumName
        };

        Scrobbler.Scrobble(song, function(post_return_data) {
            //console.log('Scrobble', post_return_data);
        });
    }
}
