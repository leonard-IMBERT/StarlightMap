const express = require('express');
const Crawler = require('./src/back/Crawler')
const app = express();
const path = require('path');

const day = 24 * 3600 * 1000; //in ms

app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'src/front/html'));

app.get('/', (req, res) => {
  res.render('index.html');
});

app.get('/css', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/front/css/style.css'));
});

app.get('/map', (req, res) => {
  res.sendFile(path.join(__dirname, 'save/map.png'));
});

app.get('/script', (req, res) => {
  res.sendFile(path.join(__dirname, 'compile/script.front.js'));
});

app.get('/metadata', (req, res) => {
  res.sendFile(path.join(__dirname, 'metadata/metadata.json'), {
    headers: {
      "Content-Type": "application/json"
    }
  });
});

app.post('/refresh', (req, res) => {
  Crawler.refresh()
  res.send("Refresh lanched")
});

app.get('/info', (req, res) => {
  Crawler.getInfoByCoord(req.query.col, req.query.row).then(d => res.send(d), {
    headers: {
      "Content-Type": "application/json"
    }
  })
})

app.get('/stats', (req, res) => {
  Crawler.getItemCounts().then(d => res.send(d), {
    headers: {
      "Content-Type": "application/json"
    }
  })
})

const port = process.env.STARLIGHT_PORT || 3000

app.listen(port, _ => {
  console.log(`Server listening on ${port}`)

  Crawler.refresh()
  setInterval(Crawler.refresh, day);
});
