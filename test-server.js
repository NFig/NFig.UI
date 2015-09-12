import express from 'express';
import _ from 'underscore';
import { urlencoded } from 'body-parser';

const app = express();

const dataCenters = [
  "Any",
  "Local"
];

const defaultSettings = {
  availableDataCenters: dataCenters,
  settings: [
  {
    isBool: false,
    name: "Test.TestTextValue",
    description: "This is a test text value, with some _markdown_ in the decription.\nFor instance, [here's a google link](http://google.com)",
    value: "This\nis\na\nmultiline\nvalue",
    overriddenByDataCenter: null
  },
  {
    isBool: true,
    name: "Test.TestBoolValue",
    description: "This is a test **bool** value.",
    value: true,
    overriddenByDataCenter: null
  }
  ]
};

const currentSettings = JSON.parse(JSON.stringify(defaultSettings)) ;

app.use(urlencoded({ extended: false }));

app.get('/settings.json', (req, res) => {
  res.json(currentSettings);
});

app.post('/set', (req, res) => {
  // find the one that mathes this name
  const current = _.find(currentSettings.settings, s => s.name === req.body.settingName);
  if (!current) { 
    res.status(404).end(); 
    return;
  }

  current.value = req.body.value;
  current.overriddenByDataCenter = req.body.dataCenter;
  
  res.json(current);
});

app.post('/clear', (req, res) => {
  const current = _.find(currentSettings.settings, s => s.name === req.body.settingName);
  const def = _.find(defaultSettings.settings, s => s.name === req.body.settingName);

  current.value = def.value;
  current.overriddenByDataCenter = null;

  res.json(current);
});

app.use(express.static('public'));
app.use(express.static('dist'));


const server = app.listen(3000, _ => {
  const host = server.address().address;
  const port = server.address().port;

  console.log(`Example app listening at http://${host}:${port}`);
});
