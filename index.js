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

app.get('/details', (req, res) => {
  res.append('Content-Type', 'application/json')
  Crawler.getDetailsAboutStat(req.query.stat).then(d => res.send(d))
})

app.post('/refresh', (req, res) => {
  Crawler.refresh()
  res.send("Refresh lanched")
});

app.get('/info', (req, res) => {
  res.append('Content-Type', 'application/json')
  Crawler.getInfoByCoord(req.query.col, req.query.row).then(d => res.send(d))
})

app.get('/stats', (req, res) => {
  res.append('Content-Type', 'application/json')
  Crawler.getCounts().then(d => res.send(d))
})

const port = process.env.STARLIGHT_PORT || 3000

app.listen(port, _ => {
  console.log(`Server listening on ${port}`)

  Crawler.refresh()
  setInterval(Crawler.refresh, day);
});
