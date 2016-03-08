// SERVER-SIDE SEMANTICS SCRIPT - NOT USED

var sem = require('/MarkLogic/semantics.xqy');

// Format search query from HTTP request (example: "Titanic"@en)
var str = '"' + xdmp.getRequestField('query') + '"@en';

// Build SPARQL query
var query = 'PREFIX foaf: <http://xmlns.com/foaf/0.1/> ' +
            'CONSTRUCT { ?subj ?pred ?obj } ' +
            'WHERE ' +
            '{ ' +
            '  ?subj foaf:name ' + str + ' . ' +
            '?subj ?pred ?obj . ' +
            '}';

// Predicates to search for
var map = {}
map['http://xmlns.com/foaf/0.1/name'] = 'name';
map['http://dbpedia.org/ontology/abstract'] = 'description';
map['http://dbpedia.org/ontology/thumbnail'] = 'thumbnail';
map['http://dbpedia.org/ontology/Work/runtime'] = 'runtime';
map['http://dbpedia.org/ontology/gross'] = 'gross';
map['http://dbpedia.org/ontology/budget'] = 'budget';

var itr = sem.sparql(query);

var result = {};

// Cycle through results
for (var item of itr) {
  var itemObj = item.toObject();
  var pred = itemObj.triple.predicate;
  var obj = itemObj.triple.object;
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

result;
