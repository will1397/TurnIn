# TurnIn
## Dependencies
1. Node 
````
apt-get install node
````
2. MySql
````
apt-get install mysql-server
````
## Installation
1. clone the git repo
2. cd into the directory
3. run `npm install`
## Setting up database
1. Create a Mysql database. Do not create any tables.
2. Create your config file by copying the example, and entering your credentials
````
cp config/config.example.json config/config.json
````
3. Run
````
npm run db_setup
````
## Running the server
to run an instance, run
````
npm start server.js
````
to run it forever, run
````
npm install forever
forever start server.js
````
Then to connect, on your browser navigate to 
````
localhost:80
````
