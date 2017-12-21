# Checkfixup

A web service that works with Github to make sure you don't merge pull requests that contain Fixups.

Checkfixup works by receiving a webhook call from Github and checking the branch associated with the commit. If the branch contains a fixup then the head commit is marked to indicate the branch contains the fixup.

Checkfixup is a [Github App](https://developer.github.com/apps/building-github-apps/).

## Github app installation
- Goto repository settings
- Select the 'Intergration & services' tab 
- Click on 'Add a service' and look for 'Checkfixup' and select it
- Authorise the application

If you want to stop fixups getting merged then protect your branch and pick checkfixup from the list of status checks that are requried.

Github will create the required webhook.

## Security

The application requires read only access to a repositorys contents and read/write access to the repository commit statuses, so that it can indicate if a commit belongs to a branch with a fixup or not.

If you are concerned that the application has read only access to a potentially private repository no source from the repository is analysed, only the commit messages are searched for the occurance of the 'fixup' phrase. The service makes no changes to code and only sets a status on commit messages.

All source for the service is available in this Github repository. All communication between Github and the Fixup service is carried out over HTTPS/TLS.

## Stack
Checkup is a Node/Express app. No database or external storage is used at this time.

## Local installation/development

### Required
- Node JS >= 8.1
- NPM

### Installation steps
- Create a '.env' based on the sample provided
- Run 'npm install'
- Run 'npm start'

Additionally a Github application must be created to act as a source for events if you need to test the code in action. A github application is not required to run the unit tests.

### .env Values
- APP_ID - The 'ID' from the github application 'About' section
- KEY - The private key generated as part of the application setup on github.

### NPM Scripts
Run npm run 'script name'

- *start* - Runs the application
- *dev* - Runs the application and watches source for changes, when a change is made the service automatically restarts
- *lint* - Executes [ESLint](https://eslint.org/) using rules based on [Standard JS](https://standardjs.com/) to confirm that the source is formatted using a set of common rules
- *test:unit* - Executes the mocha based unit tests
- *test:watch* - Executes the mocha based unit tests and auto re-runs them when changes are made
- *test:ci* - Used by Circle CI to execute unit tests and test coverage and export them in a format compatible with Circle CI
- *coverage* - Executes unit tests and reports the number of lines covered by tests, to confirm that application is thoroughly tested
