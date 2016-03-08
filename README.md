## semantic-infobox

This project sets up an example search application in MarkLogic that includes a semantic infobox in the results. It borrows from the following tutorial:

https://developer.marklogic.com/learn/semantic-infopanel

### Requirements

- MarkLogic version 8.0-4 or later
- Node.js version 0.10 or later

### Setup

1. In the project root directory, install the dependencies by running the following:

   `npm install`

2. Start your MarkLogic Server.

3. In the project root directory, set up the project by running the following:

   `node setup`

   This configures:

   - a MarkLogic database, database forest, and database indexes.
   - a MarkLogic REST service for communicating with the database via HTTP.
   - basic search options to support the application.

   It also loads:

   - example documents and semantic triples for our application.
   - the HTML, JavaScript, and CSS for our application into MarkLogic.

4. Restart MarkLogic to load the application, then access it here:

   http://localhost:8554/app/

