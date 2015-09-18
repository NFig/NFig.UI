import express from 'express';
import _ from 'underscore';
import { urlencoded } from 'body-parser';

const app = express();

const dataCenters = [
  "Any",
  "Local"
];

const defaultSettings = {
 "settings": [{
  "isOverride": false,
  "isBool": true,
  "activeValues": [{
   "dataCenter": "Any",
   "tier": "Any",
   "value": "False"
  }],
  "defaults": [{
   "dataCenter": "Any",
   "tier": "Any",
   "value": "False"
  }, {
   "dataCenter": "Any",
   "tier": "Dev",
   "value": "True"
  }, {
   "dataCenter": "Any",
   "tier": "Prod",
   "value": "True"
  }],
  "overrides": [],
  "current": {
   "dataCenter": "Any",
   "tier": "Any",
   "value": "False"
  },
  "name": "Bosun.Enabled",
  "description": "Enables sending metrics to Bosun."
 }, {
  "isOverride": false,
  "isBool": false,
  "activeValues": [{
   "dataCenter": "Any",
   "tier": "Local",
   "value": "http://192.168.59.103:8070/api/put"
  }],
  "defaults": [{
   "dataCenter": "Any",
   "tier": "Any",
   "value": null
  }, {
   "dataCenter": "Any",
   "tier": "Local",
   "value": "http://192.168.59.103:8070/api/put"
  }, {
   "dataCenter": "Colorado",
   "tier": "Dev",
   "value": "http://co-devbosun/api/put"
  }, {
   "dataCenter": "NewYork",
   "tier": "Dev",
   "value": "http://ny-devbosun/api/put"
  }, {
   "dataCenter": "Any",
   "tier": "Prod",
   "value": "http://bosun/api/put"
  }],
  "overrides": [],
  "current": {
   "dataCenter": "Any",
   "tier": "Local",
   "value": "http://192.168.59.103:8070/api/put"
  },
  "name": "Bosun.ApiUrl",
  "description": "The URL where to send Bosun metrics. Should end in /api/put"
 }, {
  "isOverride": false,
  "isBool": false,
  "activeValues": [{
   "dataCenter": "Any",
   "tier": "Any",
   "value": "30"
  }],
  "defaults": [{
   "dataCenter": "Any",
   "tier": "Any",
   "value": "30"
  }],
  "overrides": [],
  "current": {
   "dataCenter": "Any",
   "tier": "Any",
   "value": "30"
  },
  "name": "Bosun.Interval",
  "description": "The reporting interval (in seconds) for Bosun. **Any change requires an application restart to take effect.**"
 }, {
  "isOverride": false,
  "isBool": false,
  "activeValues": [{
   "dataCenter": "Any",
   "tier": "Any",
   "value": "10"
  }],
  "defaults": [{
   "dataCenter": "Any",
   "tier": "Any",
   "value": "10"
  }],
  "overrides": [],
  "current": {
   "dataCenter": "Any",
   "tier": "Any",
   "value": "10"
  },
  "name": "Bosun.AggregateGaugeMinimumEvents",
  "description": "Determines the default minimum number of events which must be recorded during a reporting interval before an AggregateGauge will report anything. See [BosunReporter docs](https://github.com/bretcope/BosunReporter.NET/blob/master/docs/MetricTypes.md#aggregategauge)."
 }],
 "availableDataCenters": ["Any", "Local"]
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
