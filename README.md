# Settings Panel Component

This is the settings panel front end component that we use in the admin section of Stack Exchange's Ad Server. It is currently backed by [NFig][2] and [NFig.Redis][3], but should work with any set up as long as the appropriate API endpoints are in place. However, it was originally designed to work with NFig, and will work best in conjunction with it. See below for sample NFig/ASP.net code. 

## Usage

### Dependencies

The settings panel component is built with [ReactJS][4], and packaged/bundled with [WebPack][5]. 

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

You'll find the `settings-panel.js` file in the `dist` folder of this repo. Also, in there will be an `index.html` file that has some minimal css styles to make the settings-panel a bit prettier than default (the settings-panel doesn't do any styling on it's own).

**NOTE**: This component requires the version of ReactJS _with addons_. Make sure you include the correct one.

### Running the Test Server / hacking

1. Make sure you have NodeJS installed (specifically: `npm`)
2. Clone this repo
3. Run `npm start`
4. Open `http://localhost:3000` in a browser.

Pretty much any ES5 compliant browser (for IE that means >= IE9) should work fine.

The test server code itself is in `test-server.js`, and uses [ExpressJS][6]. It doesn't do anything terribly interesting.

## API Format

### `settingsUrl`

* HTTP Method: `GET`

This URL should return Content Type `application/json`, in the following format (values are just samples):

``` js
{
	availableDataCenters: [
		"Any",
		"Colorado",
		"NewYork"
	],
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
		},
		...
	]
}

```

The UI will group related settings together based on their prefix, which is everything in the setting name up to the first period. The above two settings would be put together in a `Test` group.

#### The `setting` object

Properties:

* `isBool [boolean]`: `true` if the type of the setting is `true/false`. The UI treats these specially, showing a ✓ for `true`, and a × for `false`  
		    If this value is `false`, the setting will be treated as a text value
* `name [string]`: The name of the setting, prefixed with it's group (e.g: "Bosun.Enabled")
* `description [string]`: A description of the setting. May contain markdown.
* `value [string|boolean]`: The current applicable value of this setting. Will be `[boolean]` if `isBool` is `true`.
* `overriddenByDataCenter`: If the default value of this setting has been overridden, the applicable data center value is returned in this property. Will be one of the items in the `availableDataCenters` array of the response (see above for example).

### `setUrl`

* HTTP Method: `POST`

#### Request Fields:

* `settingName`
* `value`
* `dataCenter`

This endpoint is used to set an override for a given setting. This end point should set the override, and then return the current state of that particular setting (see **The `setting` object** above for format).

### `clearUrl`

* HTTP Method: `POST`

#### Request Fields:

* `settingName`

This endpoint is used to clear the current active override for a setting (given by `settingName`). The endpoint should clear the override, and then return the current state of that particular setting (which still may have an override, if there are multiple overrides in place for the given setting).



## Using with NFig

This component works best when the settings are backed by NFig. Here's an example of how to do that.

First, brush up on how to use NFig [here][7].

Done that? Ok good. Let's assume you've got NFig up and running in your application. Here's some sample code for ASP.NET that can interface with NFig and provide the appropriate end points for this component.

### `SettingsJsonModels.cs`

``` cs
public class SettingValue 
{
	// Convenience
	public SettingValue(string settingName)
		: this(Config.SettingInfo(Config.ApplicationName, settingName))
	{	
	}

	public SettingValue(SettingInfo<Tier, DataCenter> info)
	{
		var active = info.GetActiveValueFor(Config.Tier, Config.DataCenter);

		Name = info.Name;
		Description = info.Description;
		Value = active.Value?.Trim();
		OverriddenByDataCenter = active.IsOverride
			? active.DataCenter
			: (DataCenter?)null;
		IsBool = info.PropertyInfo.PropertyType == typeof(bool);
	}

	public string Name { get; }
    public string Description { get; }
    public string Value { get; }

    public bool IsBool { get; }
    public DataCenter? OverriddenByDataCenter { get; }

	// If you have a more detailed edit page for your settings, you can set this
	// And the name of the setting in the component will turn into a clickable link
    public string EditPage { get; set; }
}

public class SettingsModel
{
	public DataCenter[] AvailableDataCenters { get; set; }
	public SettingValue[] Settings { get; set; }
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

	var settings = settingInfos.Select(info => new SettingValue(info));

	var model = new SettingsModels
	{
		AvailableDataCenters = (DataCenter[])Enum.GetValues(typeof(DataCenter)),
		Settings = settings.ToArray();
	};

	return Json(model);
}

[Route("settings/set")]
[HttpPost]
public async Task<ActionMethod> SetSetting(string settingName, string value, DataCenter dataCenter)
{
	await Config.NFigStore.SetOverrideAsync(Config.ApplicationName, settingName, value, Config.Tier, dataCenter);
	return Json(new SettingValue(settingName));
}

[Route("settings/clear")]
[HttpPost]
public async Task<ActionMethod> ClearSetting(string settingName)
{
	var info = Config.NFigStore.GetSettingInfo(Config.ApplicationName, settingName);
	var activeValue = info.GetActiveValueFor(Config.Tier, Config.DataCenter);
	await Config.NFigStore.ClearOverrideAsync(Config.ApplicationName, settingName, Config.Tier, activeValue.DataCenter); 
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
