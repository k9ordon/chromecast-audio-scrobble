var player = require('chromecast-player')();
var spotify = require('spotify');
var scribble = require('scribble');
var config = require('./config.json');

console.log(config.lastfm.key,config.lastfm.secret,config.lastfm.username,config.lastfm.password);

var Scrobbler = new scribble(config.lastfm.key,config.lastfm.secret,config.lastfm.username,config.lastfm.password);


player.attach(function(err, p) {
    var session = p.currentSession;
    console.log(session.playerState, session.media.contentType);

    p.on('status', onStatus);
});

var onStatus = function(status) {
    console.log('\n\nstatus changed', status);

    if(status.playerState == "PLAYING"
        && status.media.contentType == "application/x-spotify.track") {
        console.log('spotify track',
            status.media.metadata.songName,
            status.media.metadata.artist,
            status.media.metadata.albumName
        );

/*
        spotify.lookup({type:'track', id:status.media.contentId.replace('spotify:track:','')},function(err, data) {
            if(data) {
                console.log('Now Playing: ', data.name, data.artist, data.albumName);
            }
        })
*/
    }
}
