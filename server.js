var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var mongodb = require('mongodb');
var md5 = require('md5');
var request = require('request');

var app = express();

app.use(cors());
app.use(bodyParser.urlencoded({
  extended: true
}));

var MongoClient = mongodb.MongoClient;
var mongoUrl = 'mongodb://heroku_170lq4bt:lcub1n65o4c2tukinjm5ih6i0e@ds029715.mlab.com:29715/heroku_170lq4bt';
var timeStamp = Date.now();

var NBA_API_KEY = process.env.NBA_API_KEY;
var NBA_API_KEY_2 = process.env.NBA_API_KEY_2;
var NBA_API_KEY_3 = process.env.NBA_API_KEY_3;

/***************** our backend routes ******************************/

/* welcome page */
app.get('/', function(request, response) {
  response.json({
    "description": "Welcome to the NBA API demo"
  });
});

/***************** routes for `nba` endpoint ********************/


/* player endpoint welcome page */
app.get('/player', function(req, response) {
  // sends to FE & displays at localhost:3000
  response.json({
    "description": "player endpoint"
  });
  // prints to terminal:
  console.log("NBAAAA PLAYERRR");
}); // end welcome

//nba team search
app.post('/team', function(req, res) {
  var baseUrl = "http://api.sportradar.us/";
  var nbaTeamQueryString = 'nba-t3/teams/';
  var apiKeyQueryString = "?api_key=";
  var profileString = '/profile.json';
  var queryString = req.body.queryString;
  var fullQuery = baseUrl + nbaTeamQueryString + queryString + profileString + apiKeyQueryString + NBA_API_KEY_2;
  console.log("fullQuery:", fullQuery); // prints to terminal

  request({
    url: fullQuery,
    method: 'GET',
    callback: function(error, response, body) {
      res.send(body);
    }
  })
});

//PLAYER STATS
app.post('/player', function(req, res) {
  var baseUrl = "http://api.sportradar.us/nba-t3/players/";
  var apiKeyQueryString = "/profile.json?api_key=";
  var queryString = req.body.queryString;
  var fullQuery = baseUrl + queryString + apiKeyQueryString + NBA_API_KEY_3;
  console.log("fullQuery:", fullQuery); // prints to terminal

  //http://api.sportradar.us/nba-t3/players/82e44ba0-efd4-41de-b998-056d2865cebf/profile.json?api_key=a9yp4mac4nys63m4v7a2w3pc

  request({
    url: fullQuery,
    method: 'GET',
    callback: function(error, response, body) {
      res.send(body);
    }
  })
});

//GET SAVED PLAYERS
app.get('/player/new', function(request, response){
  MongoClient.connect(mongoUrl, function (err, db) {
    var playerCollection = db.collection('players');
    if (err) {
      console.log('Unable to connect to the mongoDB server. ERROR:', err);
    } else {
      //GET ALL
      playerCollection.find().toArray(function (err, result) {
        if (err) {
          console.log("ERROR!", err);
          response.json("error");
        } else if (result.length) {
          console.log('Found:', result);
          response.json(result);
        } else {
          console.log('No document(s) found with defined "find" criteria');
          response.json("no players found");
        }
        db.close(function() {
          console.log( "database CLOSED");
        });
      }); // end find

    } // end else
  }); // end mongo connect
}); // end get all

//INDIVIDUAL NBA TEAM STATS
app.post('/team-stats', function(req, res) {
  var baseUrl = "http://api.sportradar.us/";
  var nbaTeamQueryString = 'nba-t3/seasontd/2015/REG/teams/';
  var apiKeyQueryString = "?api_key=";
  var profileString = '/statistics.json';
  var queryString = req.body.queryString;
  var fullQuery = baseUrl + nbaTeamQueryString + queryString + profileString + apiKeyQueryString + NBA_API_KEY_3;
  console.log("fullQuery:", fullQuery); // prints to terminal

  //url example
  //http://api.sportradar.us/nba-t3/seasontd/2015/REG/teams/583ecd4f-fb46-11e1-82cb-f4ce4684ea4c/statistics.json?api_key=ze9yff9kdg6gwsmmnjn7hqu3

  request({
    url: fullQuery,
    method: 'GET',
    callback: function(error, response, body) {
      res.send(body);
    }
  })
});

//get NBA STANDINGS
app.post('/standing', function(req, res) {
  var baseUrl = "http://api.sportradar.us/";
  var apiKeyQueryString = "?api_key=";
  var nbaTeamQueryString = 'nba-t3/';
  var jsonString = '.json';
  var queryString = req.body.queryString;
  var fullQuery = baseUrl + nbaTeamQueryString + queryString + jsonString + apiKeyQueryString + NBA_API_KEY_3;
  console.log("fullQuery:", fullQuery); // prints to terminal

  request({
    url: fullQuery,
    method: 'GET',
    callback: function(error, response, body) {
      res.send(body);
    }
  })
}); // end post request

//fav player save
app.post('/player/new', function(request, response){
  // response.json({"description":"add new"});
  console.log("request.body", request.body);

  MongoClient.connect(mongoUrl, function (err, db) {
    var playerCollection = db.collection('players');
    if (err) {
      console.log('Unable to connect to the mongoDB server. ERROR:', err);
    } else {
      // We are connected!
      console.log('Connection established to', mongoUrl);
      console.log('Adding new user...');

      /* Insert */
      var newPlayer = request.body;
      playerCollection.insert([newPlayer], function (err, result) {
        if (err) {
          console.log(err);
          response.json("error");
        } else {
          console.log('Inserted.');
          console.log('RESULT!!!!', result);
          console.log("end result");
          response.json(result);
        }
        db.close(function() {
          console.log( "database CLOSED");
        });
      }); // end insert
    } // end else
  }); // end mongo connect
}); // end add new

/* delete */
app.delete('/player/:id', function(request, response) {
  // response.json({"description":"delete by name"});

  console.log("request.body:", request.body);
  console.log("request.params:", request.params);

  MongoClient.connect(mongoUrl, function (err, db) {
    var playerCollection = db.collection('players');
    if (err) {
      console.log('Unable to connect to the mongoDB server. ERROR:', err);
    } else {
      // We are connected!
      console.log('Deleting by name... ');

      /* Delete */
      playerCollection.remove(request.params, function(err, numOfRemovedDocs) {
        console.log("numOfRemovedDocs:", numOfRemovedDocs);
        if(err) {
          console.log("error!", err);
        } else { // after deletion, retrieve list of all
          playerCollection.find().toArray(function (err, result) {
            if (err) {
              console.log("ERROR!", err);
              response.json("error");
            } else if (result.length) {
              console.log('Found:', result);
              response.json(result);
            } else { //
              console.log('No document(s) found with defined "find" criteria');
              response.json("none found");
            }
            db.close(function() {
              console.log( "database CLOSED");
            });
          }); // end find

        } // end else
      }); // end remove

    } // end else
  }); // end mongo connect

}); // end delete

/* tell our app where to listen */
app.listen(js PORT = process.env.PORT || 80, function() {
  console.log('listen to events on a "port".')
});
