## semantic-infobox

This project sets up an example search application in MarkLogic that includes a semantic infobox in the results. It borrows from the following tutorial:

https://developer.marklogic.com/learn/semantic-infopanel

1. On your MarkLogic Server, use the Admin Interface (at http://your-server:8001) to load the data
   into the default Documents database.

   Click "Documents" in the Databases list and then click the "Load" tab. Type the pathname for your data
   directory (e.g., /path/to/semantic-infobox/data/documents) and *.* for the filter, and then click
   "Next". On the page that follows, click "OK" to load the data.

   This will load 391 documents.

2. Load the triples into the "oscars" database in Query Console (changing the path as appropriate):
   ```
   declareUpdate();
   var sem = require('/MarkLogic/semantics.xqy');
   sem.rdfLoad("/Users/mwooldri/semantic-infobox/data/triples/oscartrips.ttl")
   ```
3. Enable the triple index for the "Documents" database in the Admin Interface. I.e., set the "triple index"
   setting to "true".

   In Query Console, you should now be able to run the following SPARQL query against the "oscars" database and get results:
   ```
   prefix foaf: <http://xmlns.com/foaf/0.1/>
   construct { ?topic ?p ?o }
   where
   {
     ?topic foaf:name "Zorba the Greek"@en .
     ?topic ?p ?o .
   }
   ```
4. Node.js is required to run this application. In the project root directory, install the project
   dependencies by running the following:

   `npm install`

5. In the project root directory, start the application by running the following:

   `node server`

6. Access the application here:

   http://your-server:8555
