/**
 * Construct snippet HTML from match values.
 * @param {object} matches - matches data from search result.
 */
function formatSnippet(matches) {
  var result = '<div class="snippet">';
  for (var match of matches) {
    for (var m of match['match-text']) {
      if (m.highlight) {
        result += '<span class="highlight">' + m.highlight + '</span> ';
      } else {
        result += m + ' ';
      }
    }
    result += '... ';
  }
  result += '</div>';
  return result;
}

/**
 * Get region metadata string from results.
 * @param {object} results - search results.
 */
function getRegion(results) {
  var result = [];
  // Cycle through result items
  for (var r in results) {
    var metadata = results[r].metadata;
    for (var m in metadata) {
      if (metadata[m]["region"]) {
        result.push(metadata[m]["region"]);
      }
    }
  }
  return result;
}

/**
 * Extract useful infobox data from triple results.
 * @param {object} items - triple results from SPARQL endpoint.
 */
function processTriples(items) {
  // Predicates to search for
  var map = {}
  map['http://dbpedia.org/ontology/abstract'] = 'abstract';
  map['http://dbpedia.org/property/cities'] = 'cities';
  var result = {};
  // Cycle through result items
  for (var subj in items) {
    for (var pred in items[subj]) {
      var obj = items[subj][pred][0];
      // If predicate matches, store object value in results
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
  return $.unique(result);
}

/**
 * Handle UI search submission by performing search and getting infobox data.
 */
$( "#submit" ).on( "click", function(event) {
  event.preventDefault();
  // Dismiss any previous results
  $('#summary').html('');
  $('#results').html('');
  $('#infobox').html('').hide();
  $('#spinner').show();
  var results = '';
  // Build structured query
  var term = $('#query').val(); // term from search box
  var query = {
    "query": {
      "queries": [{
        "and-query": {
          "queries": [
            {
              "container-query": {
                // constrain to documents
                "element": {
                  "name": "search-metadata",
                  "ns": "http://marklogic.com/poolparty/worldbank"
                },
                // with search-box term
                "term-query": {
                  "text": [ term ]
                }
              }
            }
          ]
        }
      }]
    }
  };
  // Get search results
  $.ajax({
    method: 'POST',
    url: '/v1/search?options=infobox&directory=/worldbank/documents/&format=json',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    data: JSON.stringify(query)
  }).done(
    function(data) {
      console.dir(data);
      $('#spinner').hide();
      $('#summary').html('Results found: ' + data.total);
      if (data.total > 0) {
        var region = getRegion(data.results);
        console.dir('Region: ' + region);
        for (var res of data.results) {
          results += '<div class="result">';
          results += '<div class="result-title">';
          results += res.metadata[0].display_title + ' - "' + res.metadata[1].lang + '"';
          results += '</div>';
          results += '<div class="result-uri">' + res.uri + '</div>';
          results += formatSnippet(res.matches);
          results += '</div>';
        }
        $('#results').html(results);
        // Get infobox data
        var q = '"' + region[0] + '"@en';
        var results2 = '';
        var sparql = 'SELECT ?geo ?abstract ?thumbnail ?externalLink ' +
                     'WHERE { ' +
                     'bind("' + region[0] + '" AS ?label) . ' +
                     '?geo <http://www.w3.org/2000/01/rdf-schema#label> ' + q + ' ; ' +
                          '<http://dbpedia.org/ontology/abstract> ?abstract ; ' +
                          '<http://dbpedia.org/ontology/thumbnail> ?thumbnail ; ' +
                          '<http://www.w3.org/ns/prov#wasDerivedFrom> ?externalLink ' +
                     '} LIMIT 1 ';
        $.ajax({
            method: 'POST',
            url: '/v1/graphs/sparql',
            headers: {
              'Accept': 'application/rdf+json',
              'Content-Type': 'application/sparql-query'
            },
            data: sparql
          }).done(
            function(data2) {
              if (data2.results) {
                var results = data2.results.bindings[0];
                if (results) {
                  $('#infobox').show();
                  results2 += '<div class="infobox-heading">Spotlight</div>';
                  results2 += '<div class="infobox-title">' + region + '</div>';
                  var desc = $.trim(results.abstract.value).substring(0, 300)
                    .split(' ').slice(0, -1).join(' ') + '...';
                  results2 += '<div class="infobox-desc">' + desc + '</div>';
                  $('#infobox').html(results2);
                }
              }
            }).fail(function(jqXHR2, textStatus2) {
              console.dir(jqXHR2);
            });
      }
  }).fail(function(jqXHR, textStatus) {
    console.dir(jqXHR);
  });
});
