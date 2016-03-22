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
 * Construct snippet HTML from match values.
 * @param {object} matches - matches data from search result.
 */
function formatMeta(metadata) {
  var arr = [];
  var result = '<div class="metadata">';
  for (var meta of metadata) {
    if (meta.concept) {
      arr.push(meta.concept);
    }
  }
  if (arr.length > 0) {
    result += 'Concepts: ' + arr.join(', ');
  }
  result += '</div>';
  return result;
}

/**
 * Get array of region metadata strings from results.
 * @param {object} results - search results.
 */
function getRegions(results) {
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
 * Get most important topic from result facets.
 * @param {object} results - search results.
 */
function getTopic(facets) {
  var result = '';
  if (facets.concept) {
    result = facets.concept.facetValues[0].name;
  }
  return result;
}

/**
 * Handle UI search submission by performing search and getting infobox data.
 */
$( "#submit" ).on( "click", function(event) {
  event.preventDefault();
  // Dismiss any previous results
  $('#summary').html('');
  $('#results').html('');
  $('#info_region').html('').hide();
  $('#info_topic').html('').hide();
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
                  "name": "original-txt",
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
        var regions = getRegions(data.results);
        var topic = getTopic(data.facets);
        console.dir('Region: ' + regions);
        for (var res of data.results) {
          results += '<div class="result">';
          results += '<div class="result-title">';
          results += res.metadata[0].display_title + ' - "' + res.metadata[1].lang + '"';
          results += '</div>';
          results += '<div class="result-uri">' + res.uri + '</div>';
          results += formatSnippet(res.matches);
          results += formatMeta(res.metadata);
          results += '</div>';
        }
        $('#results').html(results);
        // Get GEO infobox data
        var newArr = regions.map(function (curr, index, arr) {
          return '"' + curr + '"@en';
        });
        var regionsStr = newArr.join(', ');
        var results2 = '';
        var sparql = 'SELECT ?label ?geo ?abstract ?thumbnail ?externalLink ' +
                     'WHERE { ' +
                     '?geo <http://www.w3.org/2000/01/rdf-schema#label> ?label ; ' +
                          '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Country> ; ' +
                          '<http://dbpedia.org/ontology/abstract> ?abstract ; ' +
                          '<http://dbpedia.org/ontology/thumbnail> ?thumbnail ; ' +
                          '<http://www.w3.org/ns/prov#wasDerivedFrom> ?externalLink . ' +
                          'FILTER (?label IN  (' + regionsStr + ')) . ' +
                          'FILTER (lang(?label) = "en") . ' +
                          'FILTER (lang(?abstract) = "en") . ' +
                     '}';
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
                $('#info_region').show();
                results2 += '<div class="infobox-heading">Related</div>';
                results2 += '<div class="infobox-title">' + results.label.value + '</div>';
                var desc = $.trim(results.abstract.value).substring(0, 300)
                  .split(' ').slice(0, -1).join(' ') + '...';
                results2 += '<div class="infobox-desc">' + desc + '</div>';
                $('#info_region').html(results2);
              }
            }
          }).fail(function(jqXHR2, textStatus2) {
            console.dir(jqXHR2);
          });

        // Get TOPIC infobox data
        console.log(topic);
        var topic_formatted = '"' + topic + '"@en';
        var results3 = '';
        console.log
        var sparql2 = 'PREFIX skos:<http://www.w3.org/2004/02/skos/core#> ' +
                      'PREFIX dbo:<http://dbpedia.org/ontology/> ' +
                      'SELECT ?filterLabel ?abstract ?thumbnail ' +
                        '(GROUP_CONCAT(DISTINCT ?altLabel ; separator=", ") AS ?altLabels) ' +
                        '(GROUP_CONCAT(DISTINCT ?relLabel ; separator=", ") AS ?relLabels) ' +
                        '(GROUP_CONCAT(DISTINCT ?externalLink ; separator=", ") AS ?externalLinks) ' +
                      'WHERE { ' +
                        'BIND(' + topic_formatted + ' AS ?filterLabel) . ' +
                        '?concept skos:prefLabel|skos:altLabel ?filterLabel . ' +
                        'OPTIONAL { ' +
                          '?concept skos:prefLabel|skos:altLabel ?altLabel . ' +
                          'FILTER(?altLabel != ?filterLabel) ' +
                          'FILTER(lang(?altLabel) = "en") ' +
                        '} ' +
                        'OPTIONAL { ' +
                          '?concept skos:related ?related . ' +
                          '?related skos:prefLabel ?relLabel . ' +
                          'FILTER(lang(?relLabel) = "en") ' +
                        '} ' +
                        'OPTIONAL {  ?concept skos:exactMatch ?dbpedia . ' +
                          'GRAPH <http://en.dbpedia.org> ' +
                            '{ OPTIONAL { ?dbpedia dbo:abstract ?abstract . } } ' +
                            '{ OPTIONAL { ?dbpedia dbo:thumbnail ?thumbnail . } } ' +
                            '{ OPTIONAL { ?dbpedia dbo:wikiPageExternalLink ?externalLink .} } ' +
                        '} ' +
                      '} LIMIT 5 ';
        $.ajax({
          method: 'POST',
          url: '/v1/graphs/sparql',
          headers: {
            'Accept': 'application/rdf+json',
            'Content-Type': 'application/sparql-query'
          },
          data: sparql2
        }).done(
          function(data3) {
            if (data3.results) {
              var results = data3.results.bindings[0];
              console.dir(results);
              if (results && results.filterLabel) {
                $('#info_topic').show();
                results3 += '<div class="infobox-heading">Related</div>';
                results3 += '<div class="infobox-title">' + results.filterLabel.value + '</div>';
                var list = results.altLabels.value.split(',').reduce(function (prev, curr, index, arr) {
                  return prev + '<li>' + curr + '</li>';
                }, '');
                results3 += '<div>' + list + '</div>';
                $('#info_topic').html(results3);
              }
            }
          }).fail(function(jqXHR3, textStatus3) {
            console.dir(jqXHR3);
          });
      }
  }).fail(function(jqXHR, textStatus) {
    console.dir(jqXHR);
  });
});


