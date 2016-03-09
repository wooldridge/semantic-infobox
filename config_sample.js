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

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = config;
}
