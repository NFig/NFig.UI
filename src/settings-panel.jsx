import React from 'react';
import MicroEvent from 'microevent';
import _ from 'underscore';
import ajax from './micro-ajax';
import marked from 'marked';
import autosize from 'autosize';
import 'babel/polyfill';



const SettingsEvents = new MicroEvent();

const Keys = {
    UP_ARROW: 38,
    DOWN_ARROW: 40,
    ENTER: 13,
    ESCAPE: 27,
};


const containsText = (string, search) => string.toLowerCase().indexOf(search.toLowerCase()) !== -1;

export default class SettingsPanel extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            settings: [],
            availableDataCenters: [],

            currentlyEditing: null,
            currentlyFocused: -1, // Index into visible settings, set before rendering, reset when search text changes
            searchText: ''
        }

        this.subscribers = [];

        // Debounce the URL updater
        this.updateSearchUrl = _.debounce(this.updateSearchUrl, 500);
    }

    cancelEditing(e) {
        e.stopImmediatePropagation();
        e.stopPropagation();
        SettingsEvents.trigger("cancel-edit");
    }

    componentDidMount() {

        if (!this.props.settingsUrl || typeof this.props.settingsUrl !== 'string')
            throw 'Must must set the prop "settingsUrl" of this component!';


        this.subscribeToEvents();

        ajax.get(this.props.settingsUrl).then(result => {
            this.setState(result.body, () => {
                window.onpopstate(null);
            });
        });

        document.addEventListener('click', this.handleDocumentClick);

        document.addEventListener('keydown', e => this.handleKeyDown(e));

        window.onpopstate = event => {
            if (location.hash.length > 1) {
                this.setSearchText(location.hash.substr(1));
            } else {
                this.setSearchText('');
            }
        };
    }

    subscribeToEvents() {
         const handlers = {
            "begin-edit": setting => this.setEditingState(setting),
            "cancel-edit": () => this.clearEditingState(),
            "update-setting": data => this.updateSetting(data),
            "clear-override": setting => this.clearOverride(setting),
            "set-focused-index": index => this.setFocusedIndex(index),
        };

        _.each(handlers, (handler, event) => SettingsEvents.bind(event, handler));
    }

    updateSetting(data) {
        if (this.state.currentlyEditing === null)
            return;

        ajax.post({
            url: this.props.setUrl,
            data
        }).then(response => this.updateSettingState(response.body));
    }

    clearOverride(setting) {
        ajax.post({
            url: this.props.clearUrl,
            data: { settingName: setting.name }
        }).then(response => this.updateSettingState(response.body));
    }

    updateSearchUrl(value) {
        history.pushState(null, null, this.getUrlForSearch(value));
    }

    setSearchText(value, cb) {
        this.setState({searchText: value}, cb);
    }

    getUrlForSearch(value) {
        return '//' + location.host + location.pathname + location.search + (value.length > 0 ? ('#' + value) : '');
    }

    setEditingState(setting) {
        this.setState({ currentlyEditing: setting });
        if (setting.index !== undefined) {
            this.setFocusedIndex(setting.index);
        }
    }

    clearEditingState() {
        if (this.state.currentlyEditing != null) {
            this.setState({ currentlyEditing: null });
        }
    }

    updateSettingState(r) {
        const index = _.findIndex(this.state.settings, s => s.name === r.name);
        const updateData = {
            settings: {}
        };

        updateData.settings[index] = {$set: r};
        updateData.currentlyEditing = {$set: null};
        this.setState(React.addons.update(this.state, updateData));
    }

    quickEditVisibleSetting(searchText) {
        const visibleSettings = this.getVisibleSettings(searchText);
        if (visibleSettings.length === 1) {
            SettingsEvents.trigger('begin-edit', visibleSettings[0]);
        }
    }

    editVisibleSetting(searchText) {
        const visibleSettings = this.getVisibleSettings(searchText);
        if (visibleSettings.length === 1) {
            location.href = visibleSettings[0].editPage;
        }
    }

    goToEditPage(setting) {
        location.href = setting.editPage;
    }

    getVisibleSettings(searchText) {
        searchText = searchText || this.state.searchText;
        return this.state.settings.filter(setting =>
            [setting.name, setting.description].some(s => containsText(s, searchText))
        );
    }

    getGroupName(setting) {
        return setting.name.replace(/^([^\.]+)\..+$/, '$1');
    }

    getVisibleSettingsGroups(settings) {
        return _.chain(settings)
                .groupBy(s => this.getGroupName(s))
                .map((settings, name) => ({ name, settings}))
                .value();
    }

    handleDocumentClick(e) {
        // make sure we're not clicking on a div.value
        let node = e.target;
        while (node && node != document) {
            if (node.tagName === 'DIV' && node.className.indexOf('value') !== -1)
                return; // we are in a div.value, bail
            node = node.parentNode;
        }

        SettingsEvents.trigger('cancel-edit');
    }

    componentWillUnmount() {
        this.subscribers.forEach(s => s());
        document.removeEventListener('click', this.handleDocumentClick);
    }

    getSettingComponent(name) {
        var group = name.replace(/^([^\.]+)\..+$/, '$1');
        return this.refs[group].refs[name];
    }

    setFocusedIndex(index) {

        const visible = this.getVisibleSettings();

        if (index >= -1 && index < visible.length) {
            this.setState({currentlyFocused: index});

            if (index >= 0) {
                this.refs.search.blur();
                const component = this.getSettingComponent(visible[index].name);
                component.scrollIntoView();
            } else {
                this.refs.search.focus();
            }
        }
    }

    editFocusedSetting() {
        const visible = this.getVisibleSettings();
        location.href = visible[this.state.currentlyFocused].editPage;
    }

    quickEditFocusedSetting() {
        const visible = this.getVisibleSettings();
        SettingsEvents.trigger('begin-edit', visible[this.state.currentlyFocused]);
    }

    handleKeyDown(e) {
        switch (e.which) {
            case Keys.ESCAPE:
                if (this.state.currentlyEditing) {
                    this.cancelEditing(e);
                } else {
                    this.setFocusedIndex(-1);
                }
                break;
            case Keys.UP_ARROW:
                e.preventDefault();
                this.setFocusedIndex(this.state.currentlyFocused - 1);
                break;
            case Keys.DOWN_ARROW:
                e.preventDefault();
                this.setFocusedIndex(this.state.currentlyFocused + 1);
                break;
            case Keys.ENTER:
                if (this.state.currentlyFocused >= 0) {
                    e.preventDefault();
                    if (e.ctrlKey) this.quickEditFocusedSetting();
                    else this.editFocusedSetting();
                }
                break;
        }
    }

    render() {
        const settings = _.each(this.getVisibleSettings(), (setting, i) => {
                            setting.isFocused = (this.state.currentlyFocused === i);
                            setting.index = i;
                          });

        const settingsGroups = this.getVisibleSettingsGroups(settings);

        const children = settingsGroups.map((group, idx) => (
            <SettingsGroup
                name={group.name}
                settings={group.settings}
                key={"group-" + idx}
                dataCenters={this.state.availableDataCenters}
                currentlyEditing={this.state.currentlyEditing}
                ref={group.name}
            />
        ));

        return (
            <div className="settings-panel">
                <SettingsSearchBox
                    placeholder="Filter"
                    aria-describedby="sizing-addon3"
                    tabIndex="0"
                    value={this.state.searchText}
                    onChange={e => {
                        const value = e.target.value;
                        this.setSearchText(value, () => this.updateSearchUrl(value));
                    }}

                    onEdit={e => this.editVisibleSetting(this.state.searchText)}
                    onQuickEdit={e => this.quickEditVisibleSetting(this.state.searchText)}
                    ref="search"
                />
                <div className="setting-groups">
                    {children}
                </div>
            </div>
        );
    }
}

SettingsPanel.propTypes = {
  settingsUrl: React.PropTypes.string.isRequired,
  clearUrl: React.PropTypes.string.isRequired,
  setUrl: React.PropTypes.string.isRequired,
};

class SettingsSearchBox extends React.Component {

    componentDidMount() {
        this.focus();
    }

    handleKeyDown(e) {
        switch (e.which) {
            case Keys.ESCAPE: e.target.value = ''; this.props.onChange(e); break;
            case Keys.ENTER:
                if (e.ctrlKey) {
                    this.props.onQuickEdit();
                } else {
                    this.props.onEdit();
                }
                break;
        }
    }

    focus() {
        React.findDOMNode(this.refs.textbox).focus();
    }

    blur() {
        React.findDOMNode(this.refs.textbox).blur();
    }

    render() {
        return (
            <div className="settings-search">
                <span className="glyphicon glyphicon-search addon addon-left"></span>
                <input
                    {...this.props}
                    type="text"
                    className={"addon-right " + this.props.className}
                    onKeyDown={e => this.handleKeyDown(e)}
                    ref="textbox" />
            </div>
        );
    }
}

class SettingsGroup extends React.Component {

    render() {
        const settings = this.props.settings;

        const children = settings.map(setting => {
            const isEditing = this.props.currentlyEditing === setting;

            return (
                <Setting
                    setting={setting}
                    key={setting.name}
                    dataCenters={this.props.dataCenters}
                    isEditing={isEditing}
                    ref={setting.name}
                />
            );
        });

        return (
            <div className="setting-group">
                <h4>{this.props.name}</h4>
                {children}
            </div>
        );
    }
}



class Setting extends React.Component {

    scrollIntoView() {
        const node = React.findDOMNode(this);

        // check if contained by window
        const rect = node.getBoundingClientRect();

        const bottom = (window.innerHeight || document.documentElement.clientHeight);

        if (rect.top < 94) { // arbitrary point below the nav bar
            // off the top of the screen
            window.scrollBy(0, rect.top - 94);
        } else if (rect.bottom > bottom) {
            // off the bottom edge
            window.scrollBy(0, (rect.bottom - bottom) + 10); // add 10px padding just because
       }
    }

    handleClick(e) {
        e.stopPropagation();
        SettingsEvents.trigger('set-focused-index', this.props.setting.index);
    }

    render() {
        const setting = this.props.setting;
        let className = setting.overriddenByDataCenter ? 'overridden ' : "";
        if (setting.isFocused) {
            className += "focused ";
        }

        return (
            <div className={className + "setting" } onClick={e => this.handleClick(e)}>
                <div className="name">
                    <strong>
                        <a href={setting.editPage}>{setting.name}</a>
                    </strong>
                    <span dangerouslySetInnerHTML={{__html: marked(setting.description)}}></span>
                </div>

                <SettingValue {...this.props} />
            </div>
        );
    }
}


class SettingValue extends React.Component {
    constructor() {
        super();
        this.cancelEdit = this.cancelEdit.bind(this);
    }

    beginEdit(e, setting) {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        SettingsEvents.trigger("begin-edit", setting);
    }

    cancelEdit(e) {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        SettingsEvents.trigger("cancel-edit");
    }

    clearOverride(e, setting) {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        SettingsEvents.trigger('clear-override', setting);
    }

    render() {
        const setting = this.props.setting;

        const child = this.props.isEditing
            ? (setting.isBool
                ? <BoolEditor {...this.props} dataCenters={this.props.dataCenters} />
                : <TextEditor {...this.props} dataCenters={this.props.dataCenters} />)
            : (setting.isBool
                ? <BoolValue {...this.props} />
                : <TextValue {...this.props} />);

        let overrideInfo = null;
        if (this.props.setting.overriddenByDataCenter) {

            const dcOverride = this.props.setting.overriddenByDataCenter;

            overrideInfo = (
                <p className="overridden">
                    Overridden by Data Center: <strong>{dcOverride}</strong>&nbsp;-&nbsp;
                    <a className="reset" onClick={e => this.clearOverride(e, this.props.setting)}>reset</a>
                </p>
            );
        }

        const onClick = this.props.isEditing
            ? e => e.stopPropagation()
            : e => this.beginEdit(e, setting);

        const editClass = this.props.isEditing ? "editing" : "editable";
        const className = 'value ' + editClass;

        return (
            <div className={className} onClick={onClick}>
                {child}
                {overrideInfo}
            </div>
        );
    }
}

class BoolValue extends React.Component {
    render() {
        const value = this.props.setting.value;

        const boolVal = typeof value === 'string'
            ? value.toLowerCase() === 'true'
            : !!value;

        return (
            <span className={`bool-val-${boolVal}`} dangerouslySetInnerHTML={{__html: boolVal ? '&#x2714;' : '&times;'}} />
        );
    }
}

class BoolEditor extends React.Component {

    constructor(props) {
        super(props);

        const boolValue = props.setting.value.toString().toLowerCase()

        const defaultValue = boolValue === 'true' ? 'False' : 'True';
        this.state = {
            value: defaultValue
        };
    }

    handleEnabledChange(e) {
        const value = e.target.value.toLowerCase() === 'true' ? 'False' : 'True';
        this.setState({value: value});
    }

    updateSetting(e) {
        SettingsEvents.trigger('update-setting', {
            settingName: this.props.setting.name,
            value: this.state.value,
            dataCenter: this.refs.editctrls.state.dataCenter
        });
    }

    cancelEditing() {
        SettingsEvents.trigger('cancel-edit');
    }

    render() {
        const setting = this.props.setting;

        return (
            <div>
                <BoolValue {...this.props} /><br />
                <select className="input-sm" value={this.state.value} onChange={e => this.handleEnabledChange(e)}>
                    <option value="True">Enable</option>
                    <option value="False">Disable</option>
                </select>
                &nbsp;for&nbsp;
                <EditControls {...this.props} ref="editctrls"
                    onOk={(e, dataCenter) => this.updateSetting(e, dataCenter)}
                    onCancel={e => this.cancelEditing()}
                 />
            </div>
        );
    }
}

class TextValue extends React.Component {
    render() {
        return (
            <pre className="value">{this.props.setting.value}</pre>
        );
    }
}

class TextEditor extends React.Component {
    constructor(props) {
        super();
        this.state = {
            value: props.setting.value
        };
    }

    handleChange(e) {
        this.setState({value:e.target.value});
    }

    handleKeyDown(e) {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();

        if (e.which == Keys.ESCAPE) {
            this.cancelEditing();
            return;
        }

        if (e.ctrlKey && e.which == Keys.ENTER) {
            // CONTROL+ENTER saves
            this.updateSetting(e);
        }
    }

    cancelEditing() {
        SettingsEvents.trigger('cancel-edit');
    }

    updateSetting(e) {
        SettingsEvents.trigger('update-setting', {
            settingName: this.props.setting.name,
            value: this.state.value,
            dataCenter: this.refs.editctrls.state.dataCenter
        });
    }

    render() {
        const setting = this.props.setting;

        return (

                <form method="POST" action="/admin/settings/quick-edit">
                    <input type="hidden" name="settingName" value="Analytics.ClickThroughTimeout" />
                    <pre className="value">
                        <AutosizeTextArea
                            className="quick-editor"
                            spellCheck={false}
                            name="value"
                            defaultValue={setting.value}
                            style={{height: "1em"}}
                            onKeyDown={e => this.handleKeyDown(e)}
                            onChange={e => this.handleChange(e)}
                        />
                    </pre>
                    <EditControls {...this.props} ref="editctrls"
                        onOk={e => this.updateSetting(e)}
                        onCancel={e => this.cancelEditing()}
                    />
                </form>

        );
    }
}


class EditControls extends React.Component {

    constructor(props) {
        super();
        this.state = {
            dataCenter: props.setting.overriddenByDataCenter || props.dataCenters[0]
        }
    }

    handleDataCenterChange(e) {
        this.setState({dataCenter: e.target.value});
    }

    onOk(e) {
        this.props.onOk(e);
    }

    render() {
        return (
            <span>
                DataCenter:&nbsp;
                <select
                    name="dataCenter"
                    className="input-sm"
                    defaultValue={this.state.dataCenter}
                    onChange={e => this.handleDataCenterChange(e)}>
                    {this.props.dataCenters.map(dc => <option key={dc}>{dc}</option>)}
                </select>
                &nbsp;
                <button type="button" className="btn btn-sm btn-primary" onClick={e => this.onOk(e)}>Ok</button>&nbsp;
                <button type="button" className="btn btn-sm btn-danger cancel" onClick={e => this.props.onCancel(e)}>Cancel</button>
            </span>
        );
    }
}


class AutosizeTextArea extends React.Component {

    componentDidMount() {
        const textarea = React.findDOMNode(this.refs.textarea);
        autosize(textarea);
        textarea.focus();
        textarea.select();
    }

    componentWillUnmount() {
        this.dispatchEvent('autosize:destroy');
    }

    dispatchEvent(TYPE, defer) {
        const event = document.createEvent('Event');
        event.initEvent(TYPE, true, false);
        const dispatch = () => this.refs.textarea.getDOMNode().dispatchEvent(event);
        if (defer) {
            // Next tick
            setTimeout(dispatch);
        } else {
            dispatch();
        }
    }

    componentWillReceiveProps(nextProps) {
        this.dispatchEvent('autosize:update');
    }

    render() {
        return <textarea {...this.props} ref="textarea"></textarea>
    }
}

AutosizeTextArea.defaultProps = {
    rows: 1
};

// vim: sw=4 ts=4 et
