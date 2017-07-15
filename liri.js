'use strict';
var chalk = require('chalk');
var twitterKeys = require('./keys.js');
var Twitter = require('twitter');

var [, , fn, mod] = process.argv;

var app = (function() {
  function myTweets(count = 20) {
    var client = new Twitter({
      consumer_key: twitterKeys.twitter.consumer_key,
      consumer_secret: twitterKeys.twitter.consumer_secret,
      access_token_key: twitterKeys.twitter.access_token_key,
      access_token_secret: twitterKeys.twitter.access_token_secret
    });
    const log = console.log;
    client.get('search/tweets', { q: 'from:jonjongrim', count: count }, function(error, tweets, response) {
      let msgArray = tweets.statuses;
      msgArray.forEach(msg => {
        let [wDay, month, date] = msg.created_at.split(' ');
        log(chalk.blue(`Tweet at: ${wDay}, ${month} ${date}`));
        log(`${msg.text}`);
      });
    });
  }
  return {
    myTweets: myTweets
  };
})();

if (fn === 'my-tweets') {
  app.myTweets();
}
