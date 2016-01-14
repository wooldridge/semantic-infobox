## semantic-infobox

This project sets up an example search application that includes a semantic infobox. It borrows some of the strategy described here:

https://developer.marklogic.com/learn/semantic-infopanel

1. On your MarkLogic Server, install the New Example Application (Oscars search) using Application Builder:

   http://localhost:8000/appbuilder

   Name the application and the application's database "oscars" and deploy it using the default settings.

2. Add the full set of documents to the application database in Info Studio:

   http://localhost:8000/infostudio

   Create a New Flow and select the Oscars Example Data Loader as the Collector. This loads 391 documents. Under Document Settings, set    the URL pattern to the following:
```
   /oscars/{$filename}{$dot-ext}
```
   (Otherwise the new documents will not be searched in your application.)

3. Download the set of Oscar-related RDF triples located here:

   https://gist.github.com/mdubinko/7418688/raw/17a364828d7054ceb5eb630d8ea060307fcb4569/oscartrips.ttl

4. Load the triples into the "oscars" database in Query Console:
```
   import module namespace sem="http://marklogic.com/semantics"
     at "MarkLogic/semantics.xqy";
   sem:rdf-load("/path/to/oscartrips.ttl")
```
5. Enable the triple index for the "oscars" database in the Admin UI. I.e., set the "triple index" setting to "true".

   In Query Console, you should now be able to run the following SPARQL query and get results:
```
   prefix foaf: <http://xmlns.com/foaf/0.1/>
   construct { ?topic ?p ?o }
   where
   {
     ?topic foaf:name "Zorba the Greek"@en .
     ?topic ?p ?o .
   }
```
6. In the Admin UI, select Groups > Default > App Servers. Create a WebDAV server to give you filesystem access to the 
   Oscars application data. Use the following and click OK:

   server name: webdav-oscars
   root: /
   port: 8998
   database: oscars-modules

   On a Mac, you can access the WebDAV server in the Finder by selecting Go > Connect to Server. Use the following as 
   the server address:

   http://localhost:8998

7. Place the project files into the root directory via the WebDAV interface.

8. Access the application here:

   http://localhost:7998/semantic-infobox
