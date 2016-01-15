## semantic-infobox

This project sets up an example search application in MarkLogic that includes a semantic infobox in the results. It borrows from the following tutorial:

https://developer.marklogic.com/learn/semantic-infopanel

1. On your MarkLogic Server, install the New Example Application (one that searches Oscars data) using Application Builder:

   http://localhost:8000/appbuilder

   Name the application and the application's database "oscars" and deploy it using the default settings. This loads a small sample dataset and sets up a REST server that we'll use for our application.

2. Add the full set of Oscars documents to the "oscars" database using Info Studio:

   http://localhost:8000/infostudio

   Create a New Flow and select the Oscars Example Data Loader as the Collector. Under Document Settings, set the URL pattern to the following:
   ```
   /oscars/{$filename}{$dot-ext}
   ```
   Click Start Loading to load the documents.
   
3. Download a set of Oscar-related RDF triples located here:

   https://gist.github.com/mdubinko/7418688/raw/17a364828d7054ceb5eb630d8ea060307fcb4569/oscartrips.ttl

4. Load the triples into the "oscars" database in Query Console (http://localhost:8000/qconsole) with the following script:
   ```
   import module namespace sem="http://marklogic.com/semantics"
     at "MarkLogic/semantics.xqy";
   sem:rdf-load("/path/to/oscartrips.ttl")
   ```
   Click Run to execute the script.
   
5. Enable the triple index for the "oscars" database in the Admin UI. I.e., set the "triple index" setting to "true".

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
6. Create a WebDAV server to get filesystem access to the MarkLogic server-side application data. 
   
   In the Admin UI, select Groups > Default > App Servers. Click Create WebDAV and fill in the following:

   - server name: webdav-oscars
   - root: /
   - port: 8998
   - database: oscars-modules
   
   Click OK to create the server.

   On a Mac, you can access the WebDAV server in the Finder by selecting Go > Connect to Server. Use the following as 
   the server address:

   http://localhost:8998

7. Place the `semantic-infobox` directory into the application's root directory via the WebDAV interface.

8. The application should now be ready to go. Access it here:

   http://localhost:7998/semantic-infobox
