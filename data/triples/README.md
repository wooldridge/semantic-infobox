# http://dbpedia.org/sparql
# Run the following to generate country triples

PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX dbp: <http://dbpedia.org/property/>
PREFIX prov: <http://www.w3.org/ns/prov#>

CONSTRUCT {
  ?s rdfs:label ?label .
  ?s dbo:abstract ?abstract .
  ?s dbo:thumbnail ?thumb .
  ?s prov:wasDerivedFrom ?from .
  ?s a dbo:Country
}
where {
?s rdfs:label ?label .
?s a dbo:Country .
?s dbo:abstract ?abstract .
?s rdf:type <http://schema.org/Country> .
$s dbo:flag ?flag . # helps filter out non-country data
$s dbo:thumbnail ?thumb .
?s prov:wasDerivedFrom ?from .
FILTER(lang(?abstract) = "en")
FILTER(lang(?label) = "en")
MINUS { ?s dbp:micronation 'yes'@en . }
}
