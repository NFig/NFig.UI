# Settings Panel Component

This is the settings panel front end component that we use in the admin section
of Stack Exchange's Ad Server, which is currently backed by [NFig][2] and
[NFig.Redis][3]. While it _might_ work with another setup, it's probably going
to be painful, and we make no guarantees.

## Usage

### Dependencies

The settings panel component is built with [ReactJS][4], and packaged/bundled
with [WebPack][5]. 

#### TL;DR

``` html
<div id="settings-panel"></div>

<script src="https://fb.me/react-with-addons-0.13.3.js"></script>
<script src="settings-panel.js"></script>
<script>
  window.settingsPanel = React.render(
      React.createElement(SettingsPanel, { 
        settingsUrl: '/settings.json',
        setUrl: '/set',
		clearUrl: '/clear'
      }),
      document.getElementById('settings-panel')
  );
</script>
```  

You'll find the `settings-panel.js` file in the `dist` folder of this repo.
Also, in there will be an `index.html` file that has some minimal css styles to
make the settings-panel a bit prettier than default (the settings-panel doesn't
do any styling on it's own).

**NOTE**: This component requires the version of ReactJS _with addons_. Make
sure you include the correct one.

### Running the Test Server / hacking

1. Make sure you have NodeJS installed (specifically: `npm`)
2. Clone this repo
3. Run `npm start`
4. Open `http://localhost:3000` in a browser.

Pretty much any ES5 compliant browser (for IE that means >= IE9) should work
fine.

The test server code itself is in `test-server.js`, and uses [ExpressJS][6]. It
doesn't do anything terribly interesting.

## Using with NFig

First, brush up on how to use NFig [here][7].

Done that? Ok good. Let's assume you've got NFig up and running in your
application. Here are the models we currently use:

### `SettingsJsonModels.cs`

``` cs
using SettingInfo = SettingInfo<Tier, DataCenter>;

public class SettingsJsonModel
{
  public List<SettingJsonValue> Settings { get; set; }
  public IList<DataCenter> AvailableDataCenters { get; set; }
}

public class SettingJsonValue
{
  public string Name { get; }
  public string Description { get; }
  public SettingValue ActiveOverride { get; set; }
  public SettingValue DefaultValue { get; set; }

  public bool IsBool { get; }

  /// <summary>
  /// Guaranteed to be in order of specificy
  /// </summary>
  public List<SettingValue> AllDefaults { get; }

  /// <summary>
  /// Guaranteed to be in order of specificy
  /// </summary>
  public List<SettingValue> AllOverrides { get; }


  public SettingJsonValue(string name)
    : this(Config.GetSettingInfo(name), Config.GetAvailableDataCenters())
  {
  }

  static readonly Config.ValueBySpecificityComparer s_byMostSpecific = new Config.ValueBySpecificityComparer();

  public SettingJsonValue(SettingInfo info, IEnumerable<DataCenter> dataCenters)
  {
    Name = info.Name;
    Description = info.Description;
    IsBool = info.PropertyInfo.PropertyType == typeof (bool);

    var activeValue = info.GetActiveValue();
    if (activeValue.IsOverride)
      ActiveOverride = new SettingValue(activeValue);

    DefaultValue = new SettingValue(info.GetDefaultValue());

    AllDefaults = info.Defaults.OrderBy(v => v, s_byMostSpecific).Select(v => new SettingValue(v)).ToList();
    AllOverrides = info.Overrides.OrderBy(v => v, s_byMostSpecific).Select(v => new SettingValue(v)).ToList();
  }


  public class SettingValue
  {
    public DataCenter DataCenter { get; }
    public Tier Tier { get; }
    public string Value { get; }

    public SettingValue(SettingValue<Tier, DataCenter> settingValue)
    {
      Value = settingValue.Value;
      DataCenter = settingValue.DataCenter;
      Tier = settingValue.Tier;
    }
  }
}
```

### `SettingsController.cs`

``` cs
[Route("settings")]
public ActionMethod Index() 
{
	return View(); // CSHTML that contains the SettingsPanel component
}

[Route("settings/json")]
public async Task<ActionMethod> SettingsJson()
{
	var settingInfos = Config.NFigStore.GetAllSettingInfosAsync(Config.ApplicationName);

  return Json(new SettingsJsonModel
  {
    Settings = settingInfos.OrderBy(i => i.Name).Select(info => new SettingJsonValue(info, dataCenters)).ToList(),
		AvailableDataCenters = Config.GetAvailableDataCenters(),
  });
}

[Route("settings/set")]
[HttpPost]
public async Task<ActionMethod> SetSetting(string settingName, string value, DataCenter dataCenter)
{
	await Config.NFigStore.SetOverrideAsync(Config.ApplicationName, settingName, value, Config.Tier, dataCenter);
	return Json(new SettingJsonValue(settingName));
}

[Route("settings/clear")]
[HttpPost]
public async Task<ActionMethod> ClearSetting(string settingName)
{
	var info = Config.NFigStore.GetSettingInfo(Config.ApplicationName, settingName);
	var activeValue = info.GetActiveValueFor(Config.Tier, Config.DataCenter);
	await Config.NFigStore.ClearOverrideAsync(Config.ApplicationName, settingName, Config.Tier, activeValue.DataCenter); 
  return Json(new SettingJsonValue(info, Config.GetAvailableDataCenters()));
}
```

### `Settings\Index.cshtml`

Component usage:

``` js

window.settingsPanel = React.render(
	React.createElement(SettingsPanel, { 
		settingsUrl: '@Url.Action("SettingsJson")',
		setUrl: '@Url.Action("SetSetting")',
		clearUrl: '@Url.Action("ClearSetting")'
	}),
	document.getElementById('settings-panel')
);

```


[2]: https://github.com/NFig/NFig
[3]: https://github.com/NFig/NFig.Redis
[4]: https://facebook.github.io/react/
[5]: https://webpack.github.io/
[6]: http://expressjs.com/
[7]: https://github.com/NFig/SampleWebApplication/blob/master/README.md
