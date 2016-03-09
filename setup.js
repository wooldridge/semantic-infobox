var config = require('./config'),
    rp = require('request-promise'),
    fs = require('fs');

function createDatabase() {
  var options = {
    method: 'POST',
    uri: 'http://' + config.host + ':8002/manage/v2/databases',
    body: config.databaseSetup,
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.auth
  };
  rp(options)
    .then(function (parsedBody) {
      console.log('Database created: ' + config.databaseSetup["database-name"]);
      getHost();
    })
    .catch(function (err) {
      console.log(err);
    });
}

var hostName = '';

function getHost() {
  var options = {
    method: 'GET',
    uri: 'http://' + config.host + ':8002/manage/v2/hosts',
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.auth
  };
  rp(options)
    .then(function (parsedBody) {
      hostName = parsedBody['host-default-list']['list-items']['list-item'][0].nameref;
      console.log('Host name: ' + hostName);
      createForest(hostName);
    })
    .catch(function (err) {
      console.log(err);
    });
}

function createForest(hostName) {
  config.forestSetup["host"] = hostName;
  var options = {
    method: 'POST',
    uri: 'http://' + config.host + ':8002/manage/v2/forests',
    body: config.forestSetup,
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.auth
  };
  rp(options)
    .then(function (parsedBody) {
      console.log('Forest created and attached: ' + config.forestSetup["forest-name"]);
      createREST();
    })
    .catch(function (err) {
      console.log(err);
    });
}

function createREST() {
  var options = {
    method: 'POST',
    uri: 'http://' + config.host + ':8002/v1/rest-apis',
    body: config.restSetup,
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.auth
  };
  rp(options)
    .then(function (parsedBody) {
      console.log('REST instance created at port: ' + config.restSetup["rest-api"]["port"]);
      createOptions();
    })
    .catch(function (err) {
      console.log(err);
    });
}

function createOptions() {
  var options = {
    method: 'PUT',
    uri: 'http://' + config.host + ':8554/v1/config/query/infobox',
    body: config.searchSetup,
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: config.auth
  };
  rp(options)
    .then(function (parsedBody) {
      console.log('Search options created');
      loadDocs();
    })
    .catch(function (err) {
      console.log(err);
    });
}

var docsPath = config.path + 'data/documents/',
    docsFiles = fs.readdirSync(docsPath);
    count = 0;

function loadDocs() {
  var currDoc = docsFiles.shift();
  count++;
  var buffer;
  buffer = fs.readFileSync(docsPath + currDoc);

  var options = {
    method: 'PUT',
    uri: 'http://' + config.host + ':8554/v1/documents?uri=/oscars/' + currDoc,
    body: buffer,
    headers: {
      'Content-Type': 'application/xml'
    },
    auth: config.auth
  };
  rp(options)
    .then(function (parsedBody) {
      if (docsFiles.length > 0) {
        loadDocs();
      } else {
        console.log('Documents loaded: ' + count);
        loadTriples();
      }
    })
    .catch(function (err) {
      console.log(err);
    });
}

var triplesPath = config.path + 'data/triples/oscartrips.ttl';

function loadTriples() {
  var content = fs.readFileSync(triplesPath);
  var options = {
    method: 'PUT',
    uri: 'http://' + config.host + ':8554/v1/graphs?default',
    body: content,
    headers: {
      'Content-Type': 'text/turtle'
    },
    auth: config.auth
  };
  rp(options)
    .then(function (response) {
      console.log('Triples loaded');
      loadApp();
    })
    .catch(function (err) {
      console.log(err);
    });
}

var appPath = config.path + 'app/'
    appFiles = fs.readdirSync(appPath);

function loadApp() {
  var currFile = appFiles.shift();
  count++;
  var buffer;
  buffer = fs.readFileSync(appPath + currFile);

  var options = {
    method: 'PUT',
    uri: 'http://' + config.host + ':8554/v1/documents?database=infobox-modules&uri=/' + currFile,
    body: buffer,
    auth: config.auth
  };
  rp(options)
    .then(function (parsedBody) {
      console.log('Document loaded: ' + currFile);
      if (appFiles.length > 0) {
        loadApp();
      } else {
        console.log('App loaded');
      }
    })
    .catch(function (err) {
      console.log(err);
    });
}

function start() {
  createDatabase();
}

start();
