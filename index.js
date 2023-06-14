require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));

const regex = /^[http|https]+:[\/\/www\.]|[\w+]\w+\.\w+/;

let urlArray = []

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  const url = req.body.url;

  if (regex.test(url)) {

    let domain = new URL(url).hostname;

    dns.lookup(domain, (err, address) => {

      if (err) res.json({ 'error': 'invalid URL'} );

      else {       
        const ids = urlArray.map(url => url.id)
        let id;

        if (ids) id = Math.max(ids);
        else id = 0;
        
        const newUrl = {
          'id': id + 1,
          'url': url,
          'domain': domain
        };

        urlArray = [...urlArray, newUrl];
        res.json({'original_url': url, 'short_url': newUrl.id});
      }
    })
  }
  
  else res.json({ 'error': 'invalid URL'} );
});

app.get('/api/shorturl/:id', (req, res) => {
  res.redirect(urlArray.find(url => url.id == req.params.id).url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
