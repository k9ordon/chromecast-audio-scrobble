var castv2Cli = require('castv2-client');
var inherits = require('util').inherits;
var Application = castv2Cli.Application;
var RequestResponseController = castv2Cli.RequestResponseController;

var Api = function(client, session) {
  Application.apply(this, arguments);
  this.reqres = this.createController(RequestResponseController,
    'urn:x-cast:com.google.cast.media');
};

inherits(Api, Application);

Api.prototype.getStatus = function(cb) {
  var that = this;
  this.reqres.request({ type: 'GET_STATUS' },
    function(err, response) {
      if(err) return callback(err);
      var status = response.status[0];
      that.currentSession = status;
      cb(null, status);
    }
  );
};

module.exports = Api;