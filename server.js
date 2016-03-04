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
  console.dir(req.query);
  next();
});

var auth = {
  user: 'admin',
  pass: 'admin',
  sendImmediately: false
};

// /v1/search GET
app.get('/search', function(req, res){
  console.log('start');
  var q = req.query.q;
  var url = 'http://localhost:8000/v1/search';
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
    console.log('ok');
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
          //res.send(response.headers);
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
