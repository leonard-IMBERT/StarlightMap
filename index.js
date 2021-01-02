const express = require('express');
const path = require('path');

const Crawler = require('./src/back/Crawler');
const Logger = require('./src/back/Logger');
const Queries = require('./src/back/database/Queries');

const app = express();

const day = 24 * 3600 * 1000; // in ms

const onError = req => err => Logger.error(`Got an error with the request: ${err} on the request ${req.originalUrl}`);

app.engine('html', require('ejs').renderFile);

app.use('/', express.static('starlight-front/dist'));

app.use('/dist', express.static('starlight-front/dist'));

app.set('views', path.join(__dirname, 'src/front/html'));

app.get('/old', (req, res) => {
  res.render('index.html');
});

app.get('/css', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/front/css/style.css'));
});

app.get('/map', (req, res) => {
  res.sendFile(path.join(__dirname, 'save/map.png'));
});

app.get('/blankmap', (req, res) => {
  res.sendFile(path.join(__dirname, 'save/blankmap.png'));
});

app.get('/script', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/script.front.js'));
});

app.get('/metadata', (req, res) => {
  res.sendFile(path.join(__dirname, 'metadata/metadata.json'), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
});

app.get('/details', (req, res) => {
  res.append('Content-Type', 'application/json');
  Queries.getDetailsAboutStat(req.query.stat).then(d => res.send(d)).catch(onError(req));
});

app.post('/refresh', (req, res) => {
  Crawler.refresh();
  res.send('Refresh launched\n');
});

app.get('/info', (req, res) => {
  res.append('Content-Type', 'application/json');
  Queries.getInfoByCoord(req.query.col, req.query.row).then(d => res.send(d)).catch(onError(req));
});

app.get('/allinfo', (req, res) => {
  res.append('Content-Type', 'application/json');
  Queries.getAllInfo().then(d => res.send(d)).catch(onError(req));
});

app.get('/stats', (req, res) => {
  res.append('Content-Type', 'application/json');
  Queries.getCounts().then(d => res.send(d)).catch(onError(req));
});

app.get('/turn', (req, res) => {
  res.append('Content-Type', 'application/json');
  Queries.getTurnInfo().then(d => res.send(d)).catch(onError(req));
});

const port = process.env.STARLIGHT_PORT || 3000;

app.listen(port, () => {
  Logger.info(`Server listening on ${port}`);
  try {
    Crawler.refresh();
  } catch (e) { Logger.error(e); }
  setInterval(() => {
    try {
      Crawler.refresh();
    } catch (e) { Logger.error(e); }
  }, day);
});
