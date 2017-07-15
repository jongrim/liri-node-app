'use strict';
var chalk = require('chalk');
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var appKeys = require('./keys.js');

var [, , fn, ...args] = process.argv;

var app = (function() {
  function myTweets(count = 20) {
    var client = new Twitter({
      consumer_key: appKeys.twitter.consumer_key,
      consumer_secret: appKeys.twitter.consumer_secret,
      access_token_key: appKeys.twitter.access_token_key,
      access_token_secret: appKeys.twitter.access_token_secret
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

  function spotify(songName) {
    var spotify = new Spotify({
      id: appKeys.spotify.id,
      secret: appKeys.spotify.secret
    });
    spotify
      .search({ type: 'track', query: songName })
      .then(data => {
        let items = data.tracks.items;
        if (items.length === 0) {
          console.log(chalk.red('No results for that song!'));
          return;
        }
        let song = items[0];

        console.log(chalk.blue.underline(`Song: ${song.name}`));
        console.log(`Artist: ${song.artists[0].name}`);
        console.log(`Album: ${song.album.name}`);
        console.log(`Preview URL: ${song.preview_url}`);
      })
      .catch(err => {
        console.error(chalk.red(err));
      });
  }

  return {
    myTweets: myTweets,
    spotify: spotify
  };
})();

if (fn === 'my-tweets') {
  app.myTweets();
} else if (fn === 'spotify-this-song') {
  app.spotify(args.join(' '));
}
