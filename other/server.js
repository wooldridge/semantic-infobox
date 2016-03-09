// NODE.JS MIDDLE TIER - NOT USED

var request = require('request'),
    express = require('express');

// Set up EXPRESS
var app = express(),
    port = 8555,
    router = express.Router();
app.use(express.static(__dirname + '/'));

// Log requests
router.use(function(req, res, next) {
  console.log('%s %s', req.method, req.url);
  next();
});

var auth = {
  user: 'admin',
  pass: 'admin',
  sendImmediately: false
};

// /v1/search POST
app.get('/search', function(req, res){
  var q = req.query.q;
  var url = 'http://localhost:8554/v1/search?options=infobox';
  var body = {
    "query": {
      "queries": [{
        "and-query": {
          "queries": [{
            "container-query": {
              "element": {
                "name": "nominee",
                "ns": "http://marklogic.com/wikipedia"
              },
              "term-query": {
                "text": [ q ]
              }
            }
          }]
        }
      }]
    }
  };
  request({
    method: "POST",
    url: url,
    body: JSON.stringify(body),
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: auth
  }, function (error, response, body) {
    if (response) {
      if ((response.statusCode >= 200) && (response.statusCode < 300)) {
        res.set('Content-Type', 'application/json');
        // response may or may not have body
        if(body) {
          console.log(JSON.stringify(body));
          res.send(body);
        // if not, send response (which includes ML-generated URI in location)
        } else {
          console.log(JSON.stringify(response.headers));
          res.send(response);
        }
      } else {
        console.log('Error: '+ response.statusCode);
        console.log(body);
        res.status(response.statusCode).send();
      }
    } else {
      console.log('Error: No response object');
    }
  });
});

// Predicates to search for
var map = {}
map['http://xmlns.com/foaf/0.1/name'] = 'name';
map['http://dbpedia.org/ontology/abstract'] = 'description';
map['http://dbpedia.org/ontology/thumbnail'] = 'thumbnail';
map['http://dbpedia.org/ontology/Work/runtime'] = 'runtime';
map['http://dbpedia.org/ontology/gross'] = 'gross';
map['http://dbpedia.org/ontology/budget'] = 'budget';

function processResults(items) {
  var result = {};
  // Cycle through results
  for (var subj in items) {
    for (var pred in items[subj]) {
      var obj = items[subj][pred][0];
      // If predicate matches, store in results
      if (map[pred]) {
        // Can be an object or string
        if (obj.value) {
          result[map[pred]] = obj.value;
        } else {
          result[map[pred]] = obj;
        }
      }
      // Handle 8.0-3 API (value props)
      if (map[pred.value]) {
        if (obj.value) {
          result[map[pred.value]] = obj.value;
        } else {
          result[map[pred.value]] = obj;
        }
      }
    }
  }
  return result;
}

// /v1/graphs/sparql POST
app.get('/sparql', function(req, res){
  var url = 'http://localhost:8554/v1/graphs/sparql';
  var q = '"' + req.query.q + '"@en';
  var body = 'PREFIX foaf: <http://xmlns.com/foaf/0.1/> ' +
              'CONSTRUCT { ?subj ?pred ?obj } ' +
              'WHERE ' +
              '{ ' +
              '  ?subj foaf:name ' + q + ' . ' +
              '?subj ?pred ?obj . ' +
              '}';
  request({
    method: "POST",
    url: url,
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: auth,
    body: body
  }, function (error, response, body) {
    if (response) {
      if ((response.statusCode >= 200) && (response.statusCode < 300)) {
        res.set('Content-Type', 'application/json');
        // response may or may not have body
        if(body) {
          var results = processResults(body);
          res.send(results);
        // if not, send response (which includes ML-generated URI in location)
        } else {
          console.log(JSON.stringify(response.headers));
          res.send(response);
        }
      } else {
        console.log('Error: '+ response.statusCode);
        console.log(body);
        res.status(response.statusCode).send();
      }
    } else {
      console.log('Error: No response object');
    }
  });
});

var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
