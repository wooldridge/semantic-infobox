var rp = require('request-promise'),
    fs = require('fs');

var auth = {
  user: 'admin',
  pass: 'admin',
  sendImmediately: false
};

function start() {
  createDatabase();
}

var databaseConfig = {
  "database-name": "infobox",
  "triple-index": true,
  "range-element-index": [
    {
      "scalar-type": "string",
      "namespace-uri": "http://marklogic.com/wikipedia",
      "localname": "name",
      "collation": "http://marklogic.com/collation/",
      "range-value-positions": false,
      "invalid-values": "reject"
    },
    {
      "scalar-type": "string",
      "namespace-uri": "http://marklogic.com/wikipedia",
      "localname": "film-title",
      "collation": "http://marklogic.com/collation/",
      "range-value-positions": false,
      "invalid-values": "reject"
    }
  ],
  "range-element-attribute-index": [
    {
      "scalar-type": "gYear",
      "parent-namespace-uri": "http://marklogic.com/wikipedia",
      "parent-localname": "nominee",
      "namespace-uri": "",
      "localname": "year",
      "collation": "",
      "range-value-positions": false,
      "invalid-values": "reject"
    },
    {
      "scalar-type": "string",
      "parent-namespace-uri": "http://marklogic.com/wikipedia",
      "parent-localname": "nominee",
      "namespace-uri": "",
      "localname": "award",
      "collation": "http://marklogic.com/collation/",
      "range-value-positions": false,
      "invalid-values": "reject"
    },
    {
      "scalar-type": "string",
      "parent-namespace-uri": "http://marklogic.com/wikipedia",
      "parent-localname": "nominee",
      "namespace-uri": "",
      "localname": "winner",
      "collation": "http://marklogic.com/collation/",
      "range-value-positions": false,
      "invalid-values": "reject"
    }
  ],
};

function createDatabase() {
  var options = {
    method: 'POST',
    uri: 'http://localhost:8002/manage/v2/databases',
    body: databaseConfig,
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: auth
  };
  rp(options)
    .then(function (parsedBody) {
      console.log('Database created');
      getHost();
    })
    .catch(function (err) {
      console.log(err);
    });
}

function getHost() {
  var options = {
    method: 'GET',
    uri: 'http://localhost:8002/manage/v2/hosts',
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: auth
  };
  rp(options)
    .then(function (parsedBody) {
      var hostName = parsedBody['host-default-list']['list-items']['list-item'][0].nameref;
      console.log('Host name: ' + hostName);
      createForest(hostName);
    })
    .catch(function (err) {
      console.log(err);
    });
}

var forestConfig = {
  "forest-name": "infobox",
  "host": "macpro-3170.hq.marklogic.com",
  "database": "infobox"
}

function createForest(hostName) {
  var options = {
    method: 'POST',
    uri: 'http://localhost:8002/manage/v2/forests',
    body: forestConfig,
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: auth
  };
  rp(options)
    .then(function (parsedBody) {
      console.log('Forest created and attached');
      createREST();
    })
    .catch(function (err) {
      console.log(err);
    });
}

var restConfig = {
  "rest-api": {
    "name": "infobox-rest",
    "database": "infobox",
    "modules-database": "infobox-modules",
    "port": "8554",
    "error-format": "json"
  }
}

function createREST() {
  var options = {
    method: 'POST',
    uri: 'http://localhost:8002/v1/rest-apis',
    body: restConfig,
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: auth
  };
  rp(options)
    .then(function (parsedBody) {
      console.log('REST instance created');
      createOptions();
    })
    .catch(function (err) {
      console.log(err);
    });
}

var searchOptions = {
  "options": {
    "search-option": [
      "unfiltered"
    ],
    "page-length": 10,
    "term": {
      "apply": "term",
      "empty": {
        "apply": "all-results"
      },
      "term-option": [
        "punctuation-insensitive"
      ]
    },
    "constraint": [
      {
        "name": "award",
        "range": {
          "collation": "http://marklogic.com/collation/",
          "type": "xs:string",
          "facet": true,
          "facet-option": [
            "limit=10"
          ],
          "attribute": {
            "ns": "",
            "name": "award"
          },
          "element": {
            "ns": "http://marklogic.com/wikipedia",
            "name": "nominee"
          }
        }
      },
      {
        "name": "decade",
        "range": {
          "type": "xs:gYear",
          "facet": true,
          "bucket": [
            {
              "ge": "2000",
              "name": "2000s",
              "label": "2000s"
            },
            {
              "lt": "2000",
              "ge": "1990",
              "name": "1990s",
              "label": "1990s"
            },
            {
              "lt": "1990",
              "ge": "1980",
              "name": "1980s",
              "label": "1980s"
            },
            {
              "lt": "1980",
              "ge": "1970",
              "name": "1970s",
              "label": "1970s"
            },
            {
              "lt": "1970",
              "ge": "1960",
              "name": "1960s",
              "label": "1960s"
            },
            {
              "lt": "1960",
              "ge": "1950",
              "name": "1950s",
              "label": "1950s"
            },
            {
              "lt": "1950",
              "ge": "1940",
              "name": "1940s",
              "label": "1940s"
            },
            {
              "lt": "1940",
              "ge": "1930",
              "name": "1930s",
              "label": "1930s"
            },
            {
              "lt": "1930",
              "name": "1920s",
              "label": "1920s"
            }
          ],
          "facet-option": [
            "limit=10"
          ],
          "attribute": {
            "ns": "",
            "name": "year"
          },
          "element": {
            "ns": "http://marklogic.com/wikipedia",
            "name": "nominee"
          }
        }
      },
      {
        "name": "win",
        "range": {
          "collation": "http://marklogic.com/collation/",
          "type": "xs:string",
          "facet": true,
          "facet-option": [
            "limit=10"
          ],
          "attribute": {
            "ns": "",
            "name": "winner"
          },
          "element": {
            "ns": "http://marklogic.com/wikipedia",
            "name": "nominee"
          }
        }
      },
      {
        "name": "name",
        "range": {
          "collation": "http://marklogic.com/collation/",
          "type": "xs:string",
          "facet": true,
          "facet-option": [
            "frequency-order",
            "descending",
            "limit=10"
          ],
          "element": {
            "ns": "http://marklogic.com/wikipedia",
            "name": "name"
          }
        }
      },
      {
        "name": "film",
        "range": {
          "collation": "http://marklogic.com/collation/",
          "type": "xs:string",
          "facet": true,
          "facet-option": [
            "frequency-order",
            "descending",
            "limit=10"
          ],
          "element": {
            "ns": "http://marklogic.com/wikipedia",
            "name": "film-title"
          }
        }
      },
      {
        "name": "inname",
        "word": {
          "element": {
            "ns": "http://marklogic.com/wikipedia",
            "name": "name"
          },
          "term-option": [
            "punctuation-insensitive"
          ]
        },
        "annotation": [
          ""
        ]
      },
      {
        "name": "intitle",
        "word": {
          "element": {
            "ns": "http://marklogic.com/wikipedia",
            "name": "film-title"
          },
          "term-option": [
            "punctuation-insensitive"
          ]
        },
        "annotation": [
          ""
        ]
      }
    ],
    "operator": [
      {
        "name": "sort",
        "state": [
          {
            "name": "relevance",
            "sort-order": [
              {
                "score": null
              }
            ]
          },
          {
            "name": "year",
            "sort-order": [
              {
                "direction": "descending",
                "type": "xs:gYear",
                "attribute": {
                  "ns": "",
                  "name": "year"
                },
                "element": {
                  "ns": "http://marklogic.com/wikipedia",
                  "name": "nominee"
                }
              },
              {
                "score": null
              }
            ]
          }
        ]
      },
      {
        "name": "results",
        "state": [
          {
            "name": "compact",
            "transform-results": {
              "apply": "snippet",
              "preferred-elements": {
                "element": {
                  "ns": "http://www.w3.org/1999/xhtml",
                  "name": "p"
                }
              },
              "max-matches": "2",
              "max-snippet-chars": "150",
              "per-match-tokens": "20"
            }
          },
          {
            "name": "detailed",
            "transform-results": {
              "apply": "snippet",
              "preferred-elements": {
                "element": {
                  "ns": "http://www.w3.org/1999/xhtml",
                  "name": "p"
                }
              },
              "max-matches": "2",
              "max-snippet-chars": "400",
              "per-match-tokens": "30"
            }
          }
        ]
      }
    ],
    "transform-results": {
      "apply": "snippet",
      "preferred-elements": {
        "element": [
          {
            "ns": "http://www.w3.org/1999/xhtml",
            "name": "p"
          }
        ]
      },
      "max-matches": "2",
      "max-snippet-chars": "150",
      "per-match-tokens": "20"
    },
    "return-query": true,
    "extract-metadata": {
      "qname": [
        {
          "elem-ns": "http://marklogic.com/wikipedia",
          "elem-name": "name"
        },
        {
          "elem-ns": "http://marklogic.com/wikipedia",
          "elem-name": "film-title"
        },
        {
          "elem-ns": "http://marklogic.com/wikipedia",
          "elem-name": "nominee",
          "attr-ns": "",
          "attr-name": "award"
        },
        {
          "elem-ns": "http://marklogic.com/wikipedia",
          "elem-name": "nominee",
          "attr-ns": "",
          "attr-name": "year"
        }
      ],
      "constraint-value": [
        {
          "ref": "award"
        },
        {
          "ref": "decade"
        },
        {
          "ref": "win"
        },
        {
          "ref": "name"
        },
        {
          "ref": "film"
        }
      ]
    }
  }
};

function createOptions() {
  var options = {
    method: 'PUT',
    uri: 'http://localhost:8554/v1/config/query/infobox',
    body: searchOptions,
    json: true,
    headers: {
      'Content-Type': 'application/json'
    },
    auth: auth
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

var docsPath = '/Users/mwooldri/semantic-infobox/data/documents/',
    docsFiles = fs.readdirSync(docsPath);
    count = 0;

function loadDocs() {
  var currDoc = docsFiles.shift();
  count++;
  var buffer;
  buffer = fs.readFileSync(docsPath + currDoc);

  var options = {
    method: 'PUT',
    uri: 'http://localhost:8554/v1/documents?uri=/oscars/' + currDoc,
    body: buffer,
    headers: {
      'Content-Type': 'application/xml'
    },
    auth: auth
  };
  rp(options)
    .then(function (parsedBody) {
      console.log('Documents loaded: ' + count);
      if (docsFiles.length > 0) {
        loadDocs();
      } else {
        console.log('Documents loaded');
        loadTriples();
      }
    })
    .catch(function (err) {
      console.log(err);
    });
}

var triplesPath = '/Users/mwooldri/semantic-infobox/data/triples/oscartrips.ttl';

function loadTriples() {
  var content = fs.readFileSync(triplesPath);
  var options = {
    method: 'PUT',
    uri: 'http://localhost:8554/v1/graphs?default',
    body: content,
    headers: {
      'Content-Type': 'text/turtle'
    },
    auth: auth
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

var appPath = '/Users/mwooldri/semantic-infobox/app/',
    appFiles = fs.readdirSync(appPath);

function loadApp() {
  var currFile = appFiles.shift();
  count++;
  var buffer;
  buffer = fs.readFileSync(appPath + currFile);

  var options = {
    method: 'PUT',
    uri: 'http://localhost:8554/v1/documents?database=infobox-modules&uri=/app/' + currFile,
    body: buffer,
    auth: auth
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

start();
