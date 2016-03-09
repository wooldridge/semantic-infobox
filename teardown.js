var config = require('./config'),
    rp = require('request-promise');

function deleteREST() {
  var options = {
    method: 'DELETE',
    uri: 'http://' + config.host + ':8002/v1/rest-apis/' + config.database.name + "-rest" +
         '?include=content&include=modules',
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.auth
  };
  rp(options)
    .then(function (parsedBody) {
      console.log('REST instance deleted: ' + config.database.name + "-rest");
      //deleteDatabases();
    })
    .catch(function (err) {
      console.log(err);
    });
}

function start() {
  deleteREST();
}

start();
