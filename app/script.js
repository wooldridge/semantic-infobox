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

function processTriples(items) {
  // Predicates to search for
  var map = {}
  map['http://xmlns.com/foaf/0.1/name'] = 'name';
  map['http://dbpedia.org/ontology/abstract'] = 'description';
  map['http://dbpedia.org/ontology/thumbnail'] = 'thumbnail';
  map['http://dbpedia.org/ontology/Work/runtime'] = 'runtime';
  map['http://dbpedia.org/ontology/gross'] = 'gross';
  map['http://dbpedia.org/ontology/budget'] = 'budget';
  var result = {};
  // Cycle through result items
  for (var subj in items) {
    for (var pred in items[subj]) {
      var obj = items[subj][pred][0];
      // If predicate matches, store object value in results
      if (map[pred]) {
        result[map[pred]] = obj.value;
      }
    }
  }
  return result;
}

$('#submit').click(function(event) {
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
          "queries": [{
            "container-query": {
              // include only oscar docs...
              "element": {
                "name": "nominee",
                "ns": "http://marklogic.com/wikipedia"
              },
              // with search-box term
              "term-query": {
                "text": [ term ]
              }
            }
          }]
        }
      }]
    }
  };
  // Get search results
  $.ajax({
    method: 'POST',
    url: '/v1/search?options=infobox&format=json',
    data: JSON.stringify(query),
    contentType: 'application/json',
    dataType: 'json'
  }).done(
    function(data) {
      console.dir(data);
      $('#spinner').hide();
      $('#summary').html('Results found: ' + data.total);
      if (data.total > 0) {
        var first = data.results[0].metadata[8].film;
        for (var res of data.results) {
          results += '<div class="result">';
          results += '<div class="result-title">';
          // Actor vs. Film
          if (res.metadata[7]) {
            results += res.metadata[7].name + ' - "' + res.metadata[8].film + '"';
          } else {
            results += '"' + res.metadata[6].film + '"';
          }
          results += '</div>';
          results += '<div class="result-uri">' + res.uri + '</div>';
          results += formatSnippet(res.matches);
          results += '</div>';
        }
        $('#results').html(results);
        var q = '"' + first + '"@en';
        var results2 = '';
        var sparql = 'PREFIX foaf: <http://xmlns.com/foaf/0.1/> ' +
                     'CONSTRUCT { ?subj ?pred ?obj } ' +
                     'WHERE ' +
                     '{ ' +
                     '  ?subj foaf:name ' + q + ' . ' +
                     '?subj ?pred ?obj . ' +
                     '}';
        $.ajax({
            method: 'POST',
            url: '/v1/graphs/sparql',
            data: sparql,
            contentType: 'application/sparql-query',
            dataType: 'json'
          }).done(
            function(data2) {
              var results = processTriples(data2);
              if (results.name) {
                $('#infobox').show();
                results2 += '<div class="infobox-heading">Spotlight</div>';
                results2 += '<div class="infobox-title">' + results.name + '</div>';
                var desc = $.trim(results.description).substring(0, 300)
                  .split(' ').slice(0, -1).join(' ') + '...';
                results2 += '<div class="infobox-desc">' + desc + '</div>';
                $('#infobox').html(results2);
              }
            });
      }
  });
});
