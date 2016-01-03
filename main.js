var chromecastPlayer = require('chromecast-player')();
var scribble = require('scribble');
var ping = require('ping');
var express = require('express')
var webapp = express();

var config = require('./config.json');

var accounts = config.accounts;
var scrobblers = {};

// STATUS
var STATUS = false;
var LAST_TRACK = false;
var LAST_LAST_FM_RESPONSE = false;

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
  if (account.active != true) return false;

  console.log('added', account.lastfm_username);
  scrobblers[account.lastfm_username] = createScrobbler(account);
});

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
  if (status.playerState == "PLAYING" && status.media && status.media.metadata) {

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

  scrobbler.Scrobble(song, function(response) {
      LAST_LAST_FM_RESPONSE = response;
  });
}

// simple http status server
webapp.get('/', function(req, res) {
  res.send("<meta http-equiv='refresh' content='5'><meta name='viewport' content='user-scalable=no, width=device-width, minimum-scale=1.0, maximum-scale=1.0' /><body><pre>" + STATUS + '\n\nLAST_TRACK\n' + LAST_TRACK + '\n\nONLINE_ACCOUNTS\n' + Object.keys(scrobblers).toString() + '\n\nLAST_FM_RESPONSE\n' + LAST_LAST_FM_RESPONSE);
});

webapp.get('/add/:username', function(req, res) {
  var username = req.params.username;
  if (!username) return res.send('no username');

  var account = getAccountFromUsername(username);
  if (!account) return res.send('no user');

  scrobblers[account.lastfm_username] = createScrobbler(account);

  console.log('added', account.lastfm_username);
  // res.send('added ' + account.lastfm_username);
  res.redirect('/');
});

webapp.get('/remove/:username', function(req, res) {
  var username = req.params.username;
  if (!username) return res.send('no username');

  delete scrobblers[username];

  console.log('removed', username);
  // res.send('removed ' + account.lastfm_username);
  res.redirect('/');
});

var getAccountFromUsername = function(username) {
  var user = false;
  accounts.forEach(function(account) {
    if (account.lastfm_username === username) user = account;
  });
  return user;
}

webapp.listen(8123);
