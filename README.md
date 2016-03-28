## semantic-infobox

This project sets up an example search application in MarkLogic that includes a semantic infobox in the results. It borrows from the following tutorial:

https://developer.marklogic.com/learn/semantic-infopanel

### Requirements

- MarkLogic version 8.0-4 or later
- Node.js version 0.10 or later

### Setup

1. In the project root directory, install dependencies by running the following:

   `npm install`

2. Start MarkLogic Server.

3. Create a `config.js` file by copying `config_sample.js`. Edit the path, host, and authentication properties for your setup.

4. In the project root directory, set up the application by running the following:

   `node setup`

   This configures:

   - a database, a database forest, and database indexes.
   - a REST service for communicating with MarkLogic via HTTP.
   - basic search options to support the application.

   It also loads:

   - example documents and semantic triples
   - HTML, JavaScript, and CSS

5. Restart MarkLogic to load the application.

6. Access the application here:

   http://localhost:8554

7. To remove the REST service, databases, and forests, you can run `node teardown`. Then you can edit the project files and run `node setup` again.
