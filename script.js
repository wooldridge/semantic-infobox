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

$('#submit').click(function(event) {
  event.preventDefault();
  var str = $('#query').val();
  // Dismiss any previous results
  $('#summary').html('');
  $('#results').html('');
  $('#infobox').html('').hide();
  $('#spinner').show();
  var results = '';
  var results2 = '';
  // Get search results
  var url = '/search?q=' + str;
  $.get(url, function(data) {
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
      // Get spotlight result
      var url2 = '/sparql?q=' + first;
      $.get(url2, function(data2) {
        if (data2.name) {
          $('#infobox').show();
          results2 += '<div class="infobox-heading">Spotlight</div>';
          results2 += '<div class="infobox-title">' + data2.name + '</div>';
          var desc = $.trim(data2.description).substring(0, 300)
            .split(' ').slice(0, -1).join(' ') + '...';
          results2 += '<div class="infobox-desc">' + desc + '</div>';
          $('#infobox').html(results2);
        }
      });
    }
  });
});
