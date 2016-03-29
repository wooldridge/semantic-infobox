var config = {};

config.path = "/PATH/TO/PROJECT/semantic-infobox/"; // include trailing "/"

config.host = "localhost";

config.database = {
  "name": "infobox",
  "port": 8554
};

config.auth = {
  user: 'ML_USER',
  pass: 'ML_PASSWORD',
  sendImmediately: false
};

config.databaseSetup = {
  "database-name": config.database.name,
  "triple-index": true,
  "range-element-index": [
    {
      "scalar-type": "string",
      "namespace-uri": "",
      "localname": "url",
      "collation": "http://marklogic.com/collation/",
      "range-value-positions": false,
      "invalid-values": "reject"
    },
    {
      "scalar-type": "string",
      "namespace-uri": "",
      "localname": "abstracts",
      "collation": "http://marklogic.com/collation/",
      "range-value-positions": false,
      "invalid-values": "reject"
    },
    {
      "scalar-type": "string",
      "namespace-uri": "",
      "localname": "lang",
      "collation": "http://marklogic.com/collation/",
      "range-value-positions": false,
      "invalid-values": "reject"
    },
    {
      "scalar-type": "string",
      "namespace-uri": "",
      "localname": "count",
      "collation": "http://marklogic.com/collation/",
      "range-value-positions": false,
      "invalid-values": "reject"
    },
    {
      "scalar-type": "string",
      "namespace-uri": "",
      "localname": "display_title",
      "collation": "http://marklogic.com/collation/",
      "range-value-positions": false,
      "invalid-values": "reject"
    },
    {
      "scalar-type": "string",
      "namespace-uri": "http://marklogic.com/poolparty/worldbank",
      "localname": "geo-region",
      "collation": "http://marklogic.com/collation/",
      "range-value-positions": false,
      "invalid-values": "reject"
    },
    {
      "scalar-type": "string",
      "namespace-uri": "http://marklogic.com/poolparty/worldbank",
      "localname": "concept",
      "collation": "http://marklogic.com/collation/",
      "range-value-positions": false,
      "invalid-values": "reject"
    }
  ],
};

config.forestSetup = {
  "forest-name": config.database.name + '-1',
  "database": config.database.name
}

config.restSetup = {
  "rest-api": {
    "name": config.database.name + "-rest",
    "database": config.database.name,
    "modules-database": config.database.name + "-modules",
    "port": config.database.port,
    "error-format": "json"
  }
}

config.searchSetup = {
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
        "name": "display_title",
        "range": {
          "collation": "http://marklogic.com/collation/",
          "type": "xs:string",
          "facet": false,
          "element": {
            "ns": "",
            "name": "display_title"
          }
        }
      },
      {
        "name": "region",
        "range": {
          "type": "xs:string",
          "facet": true,
          "facet-option": [
            "limit=10"
          ],
          "element": {
            "ns": "http://marklogic.com/poolparty/worldbank",
            "name": "geo-region"
          }
        }
      },
      {
        "name": "lang",
        "range": {
          "collation": "http://marklogic.com/collation/",
          "type": "xs:string",
          "facet": true,
          "facet-option": [
            "limit=10"
          ],
          "element": {
            "ns": "",
            "name": "lang"
          }
        }
      },
      {
        "name": "country",
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
            "ns": "",
            "name": "count"
          }
        }
      },
      {
        "name": "concept",
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
            "ns": "http://marklogic.com/poolparty/worldbank",
            "name": "concept"
          }
        }
      }
    ],
    "transform-results": {
      "apply": "snippet",
      "preferred-elements": {
        "element": [
          {
            "ns": "http://marklogic.com/poolparty/worldbank",
            "name": "display_title"
          },
          {
            "ns": "http://marklogic.com/poolparty/worldbank",
            "name": "abstracts"
          },
          {
            "ns": "http://marklogic.com/poolparty/worldbank",
            "name": "original-txt"
          },
        ]
      },
      "max-matches": "3",
      "max-snippet-chars": "250",
      "per-match-tokens": "20"
    },
    "return-query": true,
    "extract-metadata": {
      "constraint-value": [
        {
          "ref": "display_title"
        },
        {
          "ref": "lang"
        },
        {
          "ref": "country"
        },
        {
          "ref": "region"
        },
        {
          "ref": "concept"
        }
      ]
    }
  }
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = config;
}
