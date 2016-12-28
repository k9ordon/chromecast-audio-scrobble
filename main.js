var scanner = require('chromecast-scanner');
var castv2Cli = require('castv2-client');
var Client = castv2Cli.Client;
var api = require('./api');

// scann for chromecasts
scanner(function(err, service) {
    console.log(service);
    ondeviceup(service.data);
});

// found chromecst
function ondeviceup(host) {
    var client = new Client();
    client.connect(host, function() {
			
				// load chromecast status
        client.getStatus(function(err, status) {
            console.log("getSessions", err, status.applications.length, status);
            // @todo if err
            const apps = status.applications;
            // @todo if no application
            const firstApp = apps[0];
            console.log({
                firstApp
            });

						// join running app
            client.join(firstApp, api, function(err, player) {
                console.log('join', err, player);

								// load player status
                player.getStatus(function(err) {
                    console.log("player", player);

                    const session = player.currentSession;
                    const playerState = session.playerState;
                    const media = session.media;
                    const metadata = media.metadata;

										// win
                    console.log({
                        playerState,
                        metadata
                    });
                });
            });
        });
    });
}