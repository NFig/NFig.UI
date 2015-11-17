/**
 * Bring in React and ReactDOM
 */
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import reactUpdate from 'react-addons-update';


/**
 * Components
 */
import SettingsSearchBox from './SettingsSearchBox';
import SettingsGroup from './SettingsGroup';
import EditorModal from './EditorModal';

/**
 * Included libs
 */
import ajax from './micro-ajax';

/**
 * Other libs
 */
import MicroEvent from 'microevent';
import _ from 'underscore';
import Keys from './keys'
import 'babel/polyfill';

const containsText = (string, search) => string.toLowerCase().indexOf(search.toLowerCase()) !== -1;

export default class SettingsPanel extends Component {

    static propTypes = {
        settingsUrl: PropTypes.string,
        clearUrl: PropTypes.string,
        setUrl: PropTypes.string
    };

    static init(element, props) {
        return ReactDOM.render(<SettingsPanel {...props} />, element);
    }


    constructor(props) {
        super(props);
        this.state = {
            settings: [],
            availableDataCenters: [],

            currentlyEditing: null,
            currentlyFocused: -1, // Index into visible settings, set before rendering, reset when search text changes
            searchText: ''
        }

        // Debounce the URL updater
        this.updateSearchUrl = _.debounce(this.updateSearchUrl, 500);
    }


    cancelEditing(e) {
        e.stopImmediatePropagation();
        e.stopPropagation();
        this.events.trigger('cancel-edit');
    }

    componentDidMount() {

        const { settingsUrl, setUrl, clearUrl, className, customStyleSheet } = this.props;

        if (!className) {
            require('./styles.less');
        }

        if (customStyleSheet) {
            this.loadCustomStyleSheet(this.props.customStyleSheet);
        }


        if (!settingsUrl || typeof settingsUrl !== 'string') { 
            this.setState({
                error: 'Must set the "settingsUrl" property of this component. ' +
                       'Use the second parameter to SettingsPanel.init() to specify properties.'
            });
            return;
        }

        // check other properties now
        if (!setUrl || !clearUrl) {
            this.setState({
                error: 'Must set both the "setUrl" and "clearUrl" properties of this component. ' +
                       'Use the second parameter to SettingsPanel.init() to specify properties.'
            });
            return;
        }


        this.events = new MicroEvent();
        this.subscribeToEvents();

        ajax.get(settingsUrl).then(result => {

            if (result.status != 200) {
                this.setState({
                    error: result.body || "There was an error loading settings"
                });
                return;
            }

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

    loadCustomStyleSheet(url) {
        // Is this a .less sheet?
        const link = document.createElement('link');
        link.href = url;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        const isLess = /\.less$/.test(url);
        const less = window.less;
        if (isLess) {
            if (!less) {
                console.error && console.error(`LessJS not loaded, can't load less stylesheet ${url}`);
                return;
            }

            link.rel = 'stylesheet/less';
        }

        var head = document.getElementsByTagName('head')[0];
        head.appendChild(link);

        if (isLess) {
            less.sheets.push(link);
            less.refresh();
        }
    }

    subscribeToEvents() {
         const handlers = {
            'begin-edit': setting => this.setEditingState(setting),
            'cancel-edit': () => this.clearEditingState(),
            'new-override': data => this.setNewOverride(data),
            'clear-override': data => this.clearOverride(data),
            'set-focused-index': index => this.setFocusedIndex(index),
            'clear-error': () => this.setState({error:null})
        };

        _.each(handlers, (handler, event) => this.events.bind(event, handler));
    }

    setNewOverride(data) {
        if (this.state.currentlyEditing === null)
            return;

        ajax.post({
            url: this.props.setUrl,
            data
        }).then(response => {
            if (response.status != 200)
                this.setState({error: response.body || 'There was an error setting the new override.'});
            else
                this.updateSettingState(response.body)      
        });
    }

    clearOverride(data) {
        ajax.post({
            url: this.props.clearUrl,
            data
        }).then(response => { 
            if (response.status != 200)
                this.setState({error: response.body || 'There was an error clearing the override.'});
            else
                this.updateSettingState(response.body) 
        });
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
        this.setState({ currentlyEditing: null, error: null });

        if (/^#edit:/.test(location.hash)) {
            if (this.state.searchText) {
                history.pushState(null, null, this.getUrlForSearch(this.state.searchText));
            } else {
                history.pushState(null, null, this.getUrlForEdit(null));
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

        // clear error
        updateData.error = { $set: null };

        this.setState(reactUpdate(this.state, updateData));
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
        document.removeEventListener('click', this.handleDocumentClick);
    }

    getSettingComponent(name) {
        const groupName = name.replace(/^([^\.]+)\..+$/, '$1');
        return this.refs[groupName].refs[name];
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
            this.events.trigger('begin-edit', visibleSettings[index]);
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
                if (!this.state.currentlyEditing && this.state.currentlyFocused >= 0) {
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

        return (
            <div className={this.props.className || 'settings-panel'}>
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
                {this.state.error && !this.state.currentlyEditing ? 
                    <div className={`${this.props.className || 'settings-panel'}-error`}>{this.state.error}</div>
                : null}
                <div className="setting-groups" display-if={settingsGroups.length}>
                    {settingsGroups.map((group, idx) => (
                        <SettingsGroup
                            name={group.name}
                            settings={group.settings}
                            key={"group-" + idx}
                            dataCenters={this.state.availableDataCenters}
                            currentlyEditing={this.state.currentlyEditing}
                            ref={group.name}
                            events={this.events}
                        />
                    ))}
                </div>
                {this.state.currentlyEditing 
                    ?  <EditorModal 
                        className={`${this.props.className || 'settings-panel'}-editor`}
                        setting={this.state.currentlyEditing} 
                        dataCenters={this.state.availableDataCenters} 
                        events={this.events}
                        error={this.state.error}
                    /> 
                        : null
                }
            </div>
        );
    }
}

// vim: sw=4 ts=4 et
