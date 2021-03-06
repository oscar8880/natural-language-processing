const dotenv = require('dotenv');
dotenv.config({path:__dirname+'/../../.env'});
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const aylien = require("aylien_textapi");

/*
*
  Initialisation
*
*/

// Load environment variables


// Create express server
const app = express()

// Point server to site folder
app.use(express.static('dist'))

// Use middleware and dependencies
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}))

// Set aylien API credentials
var textapi = new aylien({
  application_id: process.env.API_ID,
  application_key: process.env.API_KEY
});

/*
*
  Routes
*
*/

app.get('/', function (req, res) {
    res.sendFile('dist/index.html')
})

app.get('/wakeup', function (req, res) {
  const status = 200;
  res.status(status).json({ status });
  console.log('Received wake up call');
})

app.get('/text', function (req, res) {
  const resultsToSend = {};

  textapi.summarize({
    'title': req.query.title,
    'text' : req.query.text,
    'sentences_number' : 1
  }, function(error, response) {
    if(error === null) {
      // Extract summary from response and clean
      if(response.sentences[0] === undefined) {
        resultsToSend.summary = 'Unable to summarise';
      } else {
        const summaryString = response.sentences[0];
        const cleanSummary = summaryString.replace(/(\r\n|\n|\r)/gm, " ");
        resultsToSend.summary = cleanSummary;
      }
    } else {
      console.log(error);
    }
  })

  textapi.combined({
    'text' : req.query.text,
    'endpoint': ['classify', 'hashtags', 'sentiment']
    }, function(error, response) {
    if (error === null) {
      // Extract classification
      if(response.results[0].result.categories[0] !== undefined) {
        const classification = response.results[0].result.categories[0].label;
        resultsToSend.classification = classification;
      } else {
        resultsToSend.classification = 'Unknown';
      }

      // Extract hastags
      const hashtags = response.results[1].result.hashtags.slice(0, 5);
      resultsToSend.hashtags = hashtags;

      // Extract sentiment
      resultsToSend.polarity = response.results[2].result.polarity;
      resultsToSend.subjectivity = response.results[2].result.subjectivity;

      // Send payload
      res.send(resultsToSend);
    } else {
      console.log(error);
    }
    })
})

app.get('/url', function (req, res) {
  console.log('Request received at /url')
  const resultsToSend = {};

  textapi.summarize({
    'url': req.query.url,
    'sentences_number' : 1
  }, function(error, response) {
    if(error === null) {
      // Extract summary from response and clean
      if(response.sentences[0] === undefined) {
        resultsToSend.summary = 'Unable to summarise';
      } else {
        const summaryString = response.sentences[0];
        const cleanSummary = summaryString.replace(/(\r\n|\n|\r)/gm, " ");
        resultsToSend.summary = cleanSummary;
      }
    } else {
      console.log(error);
    }
  })

  textapi.combined({
    'url': req.query.url,
    'endpoint': ['classify', 'hashtags', 'sentiment']
    }, function(error, response) {
    if (error === null) {
      // Extract classification
      if(response.results[0].result.categories[0] !== undefined) {
        const classification = response.results[0].result.categories[0].label;
        resultsToSend.classification = classification;
      } else {
        resultsToSend.classification = 'Unknown';
      }

      // Extract hastags
      const hashtags = response.results[1].result.hashtags.slice(0, 5);
      resultsToSend.hashtags = hashtags;

      // Extract sentiment
      resultsToSend.polarity = response.results[2].result.polarity;
      resultsToSend.subjectivity = response.results[2].result.subjectivity;

      // Send payload
      console.log('Sending response')
      res.send(resultsToSend);
    } else {
      console.log(error);
    }
    })
})

module.exports = app;

