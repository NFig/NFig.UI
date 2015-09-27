import React from 'react';
import MicroEvent from 'microevent';
import _ from 'underscore';
import ajax from './micro-ajax';
import marked from 'marked';
import autosize from 'autosize';
import 'babel/polyfill';
import Modal from 'react-modal';


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

    static init(element, props) {
        Modal.setAppElement(element);
        Modal.injectCSS();
        return React.render(<SettingsPanel {...props} />, element);
    }

    cancelEditing(e) {
        e.stopImmediatePropagation();
        e.stopPropagation();
        SettingsEvents.trigger('cancel-edit');
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

        document.addEventListener('keydown', e => this.handleKeyDown(e));

        window.onpopstate = event => {
            if (location.hash.length > 1) {
                if (/^#edit:/.test(location.hash)) {
                    this.setEditingState(this.getSettingByName(location.hash.split(':')[1]));
                } else {
                    this.clearEditingState();
                    this.setSearchText(location.hash.substr(1));
                }
            } else {
                this.clearEditingState();
                this.setSearchText('');
            }
        };
    }

    subscribeToEvents() {
         const handlers = {
            'begin-edit': setting => this.setEditingState(setting),
            'cancel-edit': () => this.clearEditingState(),
            'new-override': data => this.setNewOverride(data),
            'clear-override': data => this.clearOverride(data),
            'set-focused-index': index => this.setFocusedIndex(index),
        };

        _.each(handlers, (handler, event) => SettingsEvents.bind(event, handler));
    }

    setNewOverride(data) {
        if (this.state.currentlyEditing === null)
            return;

        ajax.post({
            url: this.props.setUrl,
            data
        }).then(response => this.updateSettingState(response.body));
    }

    clearOverride(data) {
        ajax.post({
            url: this.props.clearUrl,
            data
        }).then(response => this.updateSettingState(response.body));
    }

    updateSearchUrl(value) {
        history.pushState(null, null, this.getUrlForSearch(value));
    }

    setSearchText(value, cb) {
        this.setState({searchText: value, currentlyFocused: -1}, cb);
    }

    getUrlForSearch(value) {
        return '//' + location.host + location.pathname + location.search + (value.length > 0 ? ('#' + value) : '');
    }

    getUrlForEdit(setting) {
        return '//' + location.host + location.pathname + location.search + (setting ? ('#edit:' + setting.name) : '');
    }

    setEditingState(setting) {
        this.setState({ currentlyEditing: setting }, () => {
            if (setting.index !== undefined) {
                this.setFocusedIndex(setting.index);
            }
            const editHash = 'edit:' + setting.name;
            if (location.hash !== '#' + editHash) {
                history.pushState(null, null, this.getUrlForEdit(setting));
            }
        });
    }

    clearEditingState() {
        if (this.state.currentlyEditing != null) {
            this.setState({ currentlyEditing: null });
            if (/^#edit:/.test(location.hash)) {
                if (this.state.searchText) {
                    history.pushState(null, null, this.getUrlForSearch(this.state.searchText));
                } else {
                    history.pushState(null, null, this.getUrlForEdit(null));
                }
            }
        }
    }

    updateSettingState(r) {
        const index = _.findIndex(this.state.settings, s => s.name === r.name);
        const updateData = {
            settings: {}
        };

        updateData.settings[index] = {$set: r};
        // updateData.currentlyEditing = {$set: null};
        if (this.state.currentlyEditing && this.state.currentlyEditing.name === r.name) {
            updateData.currentlyEditing = {$set: r};
        }
        this.setState(React.addons.update(this.state, updateData));
    }


    editVisibleSetting(searchText) {
        const visibleSettings = this.getVisibleSettings(searchText);
        if (visibleSettings.length === 1) {
            this.setEditingState(visibleSettings[0]);
        }
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

    componentWillUnmount() {
        this.subscribers.forEach(s => s());
        document.removeEventListener('click', this.handleDocumentClick);
    }

    getSettingComponent(name) {
        var group = name.replace(/^([^\.]+)\..+$/, '$1');
        return this.refs[group].refs[name];
    }

    getSettingByName(name) {
        return _.find(this.state.settings, s => s.name === name);
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
        const visibleSettings = this.getVisibleSettings(this.state.searchText);
        const index = this.state.currentlyFocused;
        if (index > -1 && index < visibleSettings.length)
            SettingsEvents.trigger('begin-edit', visibleSettings[index]);
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
                    this.editFocusedSetting();
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
                    ref="search"
                />
                <div className="setting-groups">
                    {children}
                </div>
                {this.state.currentlyEditing ? <EditorModal setting={this.state.currentlyEditing} dataCenters={this.state.availableDataCenters} /> : null}
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
                this.props.onEdit();
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
                    className={"addon-right " + (this.props.className || '')}
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
            return (
                <Setting
                    setting={setting}
                    key={setting.name}
                    dataCenters={this.props.dataCenters}
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
        SettingsEvents.trigger('begin-edit', this.props.setting);
    }

    handleDescriptionClick(e) {
        if (e.target.tagName === 'A') {
            e.stopPropagation();
            e.target.setAttribute('target', '_blank');
        }
    }

    render() {
        const setting = this.props.setting;
        let className = setting.activeOverride ? 'overridden ' : "";
        if (setting.isFocused) {
            className += "focused ";
        }

        return (
            <div className={className + "setting" } onClick={e => this.handleClick(e)}>
                <div className="name">
                    <strong>
                        <a>{setting.name}</a>
                    </strong>
                    <span onClick={e => this.handleDescriptionClick(e)} dangerouslySetInnerHTML={{__html: marked(setting.description)}} />
                </div>

                <SettingValue {...this.props} />
            </div>
        );
    }
}


class SettingValue extends React.Component {
    constructor() {
        super();
    }


    render() {
        const setting = this.props.setting;

        const child = setting.isBool
            ? <BoolValue {...this.props} />
            : <TextValue {...this.props} />;

        let overrideInfo = null;
        if (this.props.setting.activeOverride) {

            const dcOverride = this.props.setting.activeOverride.dataCenter;

            overrideInfo = (
                <p className="overridden">
                    Overridden by Data Center: <strong>{dcOverride}</strong>
                </p>
            );
        }

        return (
            <div className='editable value'>
                {child}
                {overrideInfo}
            </div>
        );
    }
}

class BoolValue extends React.Component {
    render() {
        const setting = this.props.setting;
        const value = (setting.activeOverride || setting.defaultValue).value;

        const boolVal = typeof value === 'string'
            ? value.toLowerCase() === 'true'
            : !!value;

        return (
            <span className={`bool-val-${boolVal}`}>{
                boolVal
                ? <i>&#x2714;</i>
                : <i>&times;</i>
            }</span>
        );
    }
}

class TextValue extends React.Component {
    render() {
        const setting = this.props.setting;
        const value = (setting.activeOverride || setting.defaultValue).value;
        return (
            <pre className="value">{value}</pre>
        );
    }
}

class EditorModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showDetails: false,
            selectedDataCenter: null,
            newOverrideValue: null
        };
    }

    handleClose(e) {
        SettingsEvents.trigger('cancel-edit');
    }

    showDetails() { this.setState({showDetails: true}); }
    hideDetails() { this.setState({showDetails: false}); }

    clearOverride(dc) {
        const {
            state: { selectedDataCenter: dataCenter },
            props: { setting: { name: settingName } }
        } = this;
        this.cancelNewOverride();
        const data = {settingName:this.props.setting.name, dataCenter:dc};
        SettingsEvents.trigger('clear-override', data);
    }

    selectDataCenter(e) {
        const selectedDataCenter = e.target ? e.target.value : e;

        const override = this.props.setting.allOverrides.find(o => o.dataCenter === selectedDataCenter);

        this.setState({selectedDataCenter, newOverrideValue: override && override.value});
    }

    handleOverrideChange(e) {
        this.setState({newOverrideValue: e.target.value});
    }

    setNewOverride() {

        const {
            state: { newOverrideValue: value, selectedDataCenter: dataCenter },
            props: { setting: { name: settingName } }
        } = this;

        SettingsEvents.trigger('new-override', { settingName, dataCenter, value });
        this.setState({selectedDataCenter: null});
    }

    cancelNewOverride() {
        this.setState({selectedDataCenter: null});
    }

    render() {
        const {setting, dataCenters} = this.props;
        const {activeOverride: override, defaultValue: defval} = setting;
        const {selectedDataCenter} = this.state;

        return (
            <Modal isOpen={true} onRequestClose={_ => this.handleClose()} className="editor-modal modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" onClick={() => this.handleClose()}>
                            <span aria-hidden="true">&times;</span>
                            <span className="sr-only">Close</span>
                        </button>
                        <h3 className="modal-title">{setting.name}</h3>
                        <p dangerouslySetInnerHTML={{__html:marked(setting.description)}} />
                    </div>
                    <div className="modal-body">
                        <div className="values">
                            {override ?
                            <div className="override active">
                                <h5>Active Override</h5>
                                <p>Data Center: <strong>{override.dataCenter}</strong></p>
                                <pre>{override.value}</pre>
                                <button className="btn btn-xs btn-link" onClick={() => this.selectDataCenter(override.dataCenter)}>Edit</button>
                                <span>&nbsp;</span>
                                <button className="btn btn-xs btn-danger" onClick={() => this.clearOverride(override.dataCenter)}>Clear</button>
                            </div> : null}
                            <div className="default">
                                <h5>Default Value</h5>
                                <p>Data Center: <strong>{defval.dataCenter}</strong></p>
                                <pre>{defval.value}</pre>
                            </div>
                        </div>
                        <div className="newoverride">
                            <p>
                                <span>Set new override for&nbsp;</span>
                                <DataCenterSelector
                                    selectedValue={this.state.selectedDataCenter}
                                    onChange={e => this.selectDataCenter(e)}
                                    dataCenters={dataCenters}
                                />
                            </p>
                            {selectedDataCenter ?
                            <div>
                                <SettingEditor {...this.props} value={this.state.newOverrideValue} onChange={e => this.handleOverrideChange(e)}/>
                                <p>
                                    <button className="btn btn-success btn-small" onClick={() => this.setNewOverride()}>Set Override</button>
                                    <span>&nbsp;</span>
                                    <button className="btn btn-danger btn-small" onClick={() => this.cancelNewOverride()}>Cancel</button>
                                </p>
                            </div>
                            : null}
                        </div>
                    </div>
                    <div className="modal-body show-details">
                        {this.state.showDetails
                        ? <a className="toggle" style={{cursor:"pointer"}} onClick={() => this.hideDetails()}>Hide Details</a>
                        : <a className="toggle" style={{cursor:"pointer"}} onClick={() => this.showDetails()}>Show Details</a>
                        }
                        <div className="details" style={this.state.showDetails ? {} : {display:'none'}}>
                            <div className="overrides">
                                <h5>Overrides</h5>
                                <ValueTable {...this.props} propName="allOverrides" onClear={dc => this.clearOverride(dc)} />
                            </div>
                            <div className="defaults">
                                <h5>Defaults</h5>
                                <ValueTable {...this.props} propName="allDefaults" />
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }
}

class DataCenterSelector extends React.Component {
    render() {
        const {selectedValue, onChange, dataCenters} = this.props;

        return (
            <RadioButtonGroup
                {...this.props}
                className="spaced"
                name="newOverrideValue">
                {dataCenters.map(dc =>
                    <RadioButton key={dc} className="btn-default btn-sm" value={dc}>{dc}</RadioButton>
                )}
            </RadioButtonGroup>
        );
    }
}

class ValueTable extends React.Component {

    render() {
        const {setting, propName, onClear} = this.props;
        const values = setting[propName];
        return (
            <table className="value-list table-striped">
                <thead>
                    <tr>
                        <th>Tier</th>
                        <th>Data Center</th>
                        <th>Value</th>
                        {onClear ? <th></th> : null}
                    </tr>
                </thead>
                <tbody>
                    {values.map(v =>
                        <tr key={`${v.tier}|${v.dataCenter}`}>
                            <td>{v.tier}</td>
                            <td>{v.dataCenter}</td>
                            <td className="value">{v.value}</td>
                            {onClear ?
                            <td>
                                <button type="button"
                                        className="clear-override"
                                        title="Clear this override"
                                        onClick={() => onClear(v.dataCenter)}>
                                    <span aria-hidden="true">&times;</span>
                                    <span className="sr-only">Clear</span>
                                </button>
                            </td>
                            : null}
                        </tr>
                    )}
                </tbody>
            </table>
        );
    }
}

class SettingEditor extends React.Component {
    render() {
        return this.props.setting.isBool
            ? <BoolEditor {...this.props} />
            : <TextEditor {...this.props} />;
    }
}

class BoolEditor extends React.Component {
    render() {
        return (
            <p>
                <RadioButtonGroup className="btn-group" name="overrideBool" selectedValue={this.props.value} onChange={this.props.onChange}>
                    <RadioButton className="btn-default" value="True">True</RadioButton>
                    <RadioButton className="btn-default" value="False">False</RadioButton>
                </RadioButtonGroup>
            </p>
        );
    }
}

class RadioButton extends React.Component {
    render() {
        const {value, className, onChange, name, children, active} = this.props;

        const classNames = (className && className.split(' ')) || [];
        classNames.push('btn');
        if (active)
            classNames.push('active');

        return (
            <label className={classNames.join(' ')}>
                <input
                    type="radio"
                    value={value}
                    name={name}
                    checked={active}
                    onChange={onChange} />
                {children}
            </label>
        );
    }
}

class RadioButtonGroup extends React.Component {
    render() {
        const {className, name, selectedValue, onChange, children} = this.props;

        const mapped = React.Children.map(children, child => {
            const {value} = child.props;
            return React.cloneElement(child, {name, active: value === selectedValue, onChange});
        })

        return (
            <span className={className}>
                {mapped}
            </span>
        );
    }
}

class TextEditor extends React.Component {
    render() {
        return (
            <pre className="value">
                <AutosizeTextArea
                    {...this.props}
                    className="quick-editor"
                    spellCheck={false}
                    name="value"
                    value={this.props.value}
                    style={{height: "1em"}}
                    onChange={this.props.onChange}
                />
            </pre>

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
