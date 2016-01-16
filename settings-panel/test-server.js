import express from 'express';
import webpack from 'webpack';
import { urlencoded } from 'body-parser';
import { readFileSync } from 'fs';

import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackConfig from './webpack.config.babel';

// Set up for -d switch
webpackConfig.devtool = 'source-map';
webpackConfig.debug = true;
webpackConfig.output.pathinfo = true;

const debug = require('debug')('test-server');

const app = express();

app.set('views', './views');
app.set('view engine', 'jade');

const compiler = webpack(webpackConfig);
app.use(webpackDevMiddleware(compiler, { publicPath: webpackConfig.output.publicPath }));

const config = {
  dataCenter: "Local",
  tier: "Local"
};

const dataCenters = [
  "Any",
  "Local"
];

const settingsData = JSON.parse(readFileSync(`${__dirname}/settings.json`, 'utf8'));

const setActiveOverride = setting => {
  // 'Any' is the fallback
  let o = setting.allOverrides.find(o => o.dataCenter === config.dataCenter);
  debug('Override for %s: ', config.dataCenter, o);
  if (!o) {
    o = setting.allOverrides.find(o => o.dataCenter === 'Any');
    debug('Override for Any: ', o);
  }

  setting.activeOverride = o;
};

app.use(urlencoded({ extended: false }));

app.get('/', (req, res) => res.render('index', settingsData));

app.get('/settings.json', (req, res) => {
  res.json(settingsData);
});


app.post('/set', (req, res) => {
  const { settingName, dataCenter, value } = req.body;

  debug('Body:', req.body);
  debug('Config:', config);

  const setting = settingsData.settings.find(s => s.name === settingName);

  if (!setting)
  {
    res.status(404).end();
    return;
  }

  const existing = setting.allOverrides.find(o => o.dataCenter === dataCenter);
  if (existing) {
    existing.value = value;
  } else {
    const override = {
      dataCenter,
      tier: config.tier,
      value
    };
    setting.allOverrides.push(override);
  }

  setActiveOverride(setting);

  res.json(setting);
});

app.post('/clear', (req, res) => {
  const { settingName, dataCenter } = req.body;

  const setting = settingsData.settings.find(s => s.name === settingName);

  if (!setting)
  {
    res.status(404).end();
    return;
  }

  setting.allOverrides = setting.allOverrides.filter(o => o.dataCenter !== dataCenter);
  setActiveOverride(setting);

  res.json(setting);
});

app.use(express.static('public'));
// app.use(express.static('dist'));


const server = app.listen(3000, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log(`Example app listening at http://${host}:${port}`);
});
