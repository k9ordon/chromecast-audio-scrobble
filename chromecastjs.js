chromecastjs = require('chromecast-js')

var browser = new chromecastjs.Browser()

browser.on('deviceOn', function(device){
    console.log('deviceOn', device);

    device.getStatus(function(status) {
        console.log('status', status);
    });

    /*
    device.connect();
    device.on('connected', function(){
        console.log('connected', device);
    });
    */
});
