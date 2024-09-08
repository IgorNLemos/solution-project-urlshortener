require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const urlencoded = require('body-parser/lib/types/urlencoded');
const req = require('express/lib/request');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.use('/',(req, res, next)  => {
  console.log( req.method + ' ' + req.path + ' - ' + req.body.url);
  next();
});



const urlDatabase = {};
let counter = 1;
function generateShortUrl() {
  return counter++;
}



// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  const longUrl = req.body.url;

  if (!longUrl) {
    return res.json({ error: 'invalid url' });
  }
 
  function isValidHttpUrl(string) {
    if (typeof string !== 'string') {
      return false;
    }  
   
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;  
    }
  }

  if (!isValidHttpUrl(longUrl)) {
    return res.json({ error: 'invalid url' });
  }

  const shortUrl = generateShortUrl();
  urlDatabase[shortUrl] = longUrl;

  res.json({ original_url: longUrl, short_url: shortUrl });
});

app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = req.params.short_url;
  const longUrl = urlDatabase[shortUrl];
  if (longUrl) {
    res.redirect(longUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
