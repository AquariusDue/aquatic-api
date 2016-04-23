var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var yaml = require('js-yaml');
var fs = require('fs');

// Retrieve API Keys
API_KEYS = yaml.safeLoad(fs.readFileSync('./keys.yaml', 'utf8'));

// Pushbullet API Key
var PUSHBULLET_API_KEY = API_KEYS.pushbullet;

// Used to record the last call to the /hello endpoint
var previousNotification = Date.now();

// Options for the request function
var pushbulletHello = {
  url: 'https://api.pushbullet.com/v2/pushes',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Access-Token': PUSHBULLET_API_KEY
  },
  json: true,
  body: {
    "type": "note",
    "title": "Your API",
    "body": "Someone visited your website and said hello"
  }
}

// callback for the request function
function callback (error, response, body) {
      if(response.statusCode == 200){
        console.log("Everything is 200")
      } else {
        console.log('error: '+ response.statusCode)
        console.log(body)
      }
    };

app.use(bodyParser.json({ type: 'application/*+json' }));

// Enable CORS Headers for the hello route using Middleware
app.use('/hello', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // !!!! CHANGE THIS TO YOUR DOMAIN NAME BEFORE DEPOLOYING !!!!
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Send a push notification when someone hits the endpoint
// One push notification per minute, less than a minute and it logs it to the console
app.get('/hello', function (req, res) {
  var latestNotification = Date.now()
  if (latestNotification - previousNotification >= 60000) {
    console.log("Request made to Pushbullet API");
    request(pushbulletHello, callback);
    previousNotification = latestNotification;
    res.send("Hello to you too!");
  } else {
    res.send("We're on coffee break, come back in an hour!");
    console.log("Too early for next request.")
  }
});

app.listen(3000, function () {
  console.log("Pushbullet app listening on port 3000!");
})
