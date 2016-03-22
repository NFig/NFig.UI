import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { findDOMNode } from 'react-dom';

import {
    loadCustomStyleSheet,
    markdown,
    matches,
    scrollToElement,
    getQueryString,
    intersperse
} from './utils';

import {
    groupedSettingsSelector,
    focusedIndexSelector,
    focusedSettingSelector,
    searchSelector,
    dataCentersSelector,
    editingSelector,
    copySettingsSelector,
} from './selectors';

import * as actions from './actions';
import * as thunks from './thunks';
import * as keys from './keys';

import classnames from 'classnames';
import imgTrue from './assets/setting-true.png';
import imgFalse from './assets/setting-false.png';

import SearchBox from './SearchBox';
import Dialog from './Dialog';
import OverrideEditor from './OverrideEditor';

import {
    CopySettingsButton,
    CopySettingsModal,
} from './CopySettings';


const dialogSelector = createSelector(

    editingSelector,
    focusedSettingSelector,
    dataCentersSelector,
    copySettingsSelector,

    (editing, setting, dataCenters, copySettings) => {

        const dialog = { component: null, props: null };

        if (editing) {
            dialog.component = OverrideEditor;
            dialog.props = { setting, dataCenters };
        } else if (copySettings.show) {
            dialog.component = CopySettingsModal;
            dialog.props = {...copySettings};
        }

        return dialog;
    }
);

const mapState = createSelector(
    groupedSettingsSelector,
    focusedIndexSelector,
    searchSelector,
    dialogSelector,
    (groups, focusedIndex, search, dialog) => ({
        groups,
        focusedIndex,
        search,
        dialog
    })
);


@connect(mapState)
export default class SettingsPanel extends Component {

    static childContextTypes = {
        className: PropTypes.string
    };

    getChildContext() {
        return {
            className   : this.getClassName(),
        };
    }

    getClassName() {
        return this.props.className || 'settings-panel';
    }

    componentDidMount() {

        const {
            className,
            customStyleSheet,
            dispatch
        } = this.props;

        if (!className)
            require('./assets/styles.less');

        if (customStyleSheet)
            loadCustomStyleSheet(customStyleSheet);


        document.addEventListener('keydown', this.onKeyDown);

        window.addEventListener('popstate', () => {
            dispatch(thunks.loadQueryString);
        });

        // Load 'em up
        dispatch(thunks.fetchSettings);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.onKeyDown);
    }

    componentDidUpdate() {
        const { dialog } = this.props;

        if (dialog.component) {
            document.removeEventListener('keydown', this.onKeyDown);
        } else {
            document.addEventListener('keydown', this.onKeyDown);
        }
    }

    onKeyDown = (e) => {

        const { dispatch, dialog } = this.props;

        switch (e.which) {

          case keys.ESCAPE:
            dispatch(thunks.escape);
            const node = findDOMNode(this.refs.searchBox);
            scrollToElement(node);
            break;

          case keys.DOWN:
            dispatch(thunks.nextSetting);
            break;

          case keys.UP:
            dispatch(thunks.prevSetting);
            break;

          case keys.ENTER:
            dispatch(thunks.enter);
            break;

          default:
            return;
        }

        e.preventDefault();
    };


    render() {

        const {
            groups,
            dialog,
            copySettingsUrl,
            currentRedisConnection
        } = this.props;


        const className = this.getClassName();
        const showCopyButton = !!copySettingsUrl && !!currentRedisConnection;


        return (
            <div className={className}>
                <div className="top-bar">
                    <SearchBox ref="searchBox" />
                    {showCopyButton ?
                        <CopySettingsButton />
                    : null}
                </div>
                <Groups groups={groups} />
                <Dialog dialog={dialog} />
            </div>
        );
    }
}



class Groups extends Component {
    render() {

        const { groups } = this.props;

        if (groups.size === 0)
            return null;

        return (
            <div className="setting-groups">
                {groups.entrySeq().map(([name, settings]) => {
                    if (settings.size === 0)
                        return null;

                    return (
                        <div className="setting-group" key={name}>
                            <h4>{name}</h4>
                            {settings.valueSeq().map(([index, setting]) => (
                                <Setting
                                    key={setting.get('name')}
                                    setting={setting}
                                    index={index}
                                />
                            ))}
                        </div>
                    );
                })}
            </div>
        );
    }
}


function hasOverride(setting) {
    const activeOverride = setting.get('activeOverride');
    const allOverrides = setting.get('allOverrides');
    return activeOverride || allOverrides.size > 0;
}

/**
 * Child components don't need the @immutableRender
 * decorator, as if the actual setting model has changed
 * it's a whole different object (from the server)
 */

@connect(createSelector(
    focusedIndexSelector,
    (focusedIndex) => ({focusedIndex})
)) // for dispatch
class Setting extends Component {

    shouldComponentUpdate(nextProps) {
        // If our setting has changed, update
        if (this.props.setting !== nextProps.setting)
            return true;

        if (this.props.index !== nextProps.index)
            return true;

        if ((this.props.index === this.props.focusedIndex) // used to be focused
            && (nextProps.focusedIndex !== this.props.index)) // but now we are not
        {
            return true
        }

        if ((this.props.index !== this.props.focusedIndex) // wasn't focused before
            && (nextProps.focusedIndex === this.props.index)) // but now we are
        {
            return true;
        }

        // Don't care
        return false;
    }

    componentDidUpdate() {
        // If we're focused, scroll into view
        const { index, focusedIndex } = this.props;
        if (index === focusedIndex)
            scrollToElement(findDOMNode(this));
    }

    handleClick = (e) => {
        e.stopPropagation();

        const { target } = e;
        const {
            setting,
            index,
            dispatch
        } = this.props;

        // Only trigger if we haven't clicked
        // on a link inside the description (as a result of
        // markdown rendering).
        if (!matches(target, 'span.desc a')) {
            dispatch(thunks.editSetting(setting.get('name')));
        }
    };


    render() {
        const { setting, index, focusedIndex } = this.props;
        const description = setting.get('description');

        const classes = classnames('setting', {
            overrides: setting.get('allOverrides').size > 0,
            'active-override': setting.get('activeOverride'),
            focused: index === focusedIndex
        });

        return (
            <div className={classes} onClick={this.handleClick}>
                <div className="name">
                    <strong>
                        <a>{setting.get('name')}</a>
                    </strong>
                    <span className="desc" dangerouslySetInnerHTML={{ __html: markdown(description) }} />
                </div>
                <SettingValue setting={setting} />
            </div>
        );
    }
}


class SettingValue extends Component {
    render() {
        const { setting } = this.props;
        const Value = valueFor(setting);

        return (
            <div className="value">
                <Value setting={setting} />
                <OverrideInfo setting={setting} />
            </div>
        );
    }
}

class OverrideInfo extends Component {
    render() {
        const { setting } = this.props;
        const activeOverride = setting.get('activeOverride');
        const allOverrides = setting.get('allOverrides');

        if (activeOverride) {
            const dc = activeOverride.get('dataCenter');
            return (
                <p className="overrides">
                    Overridden by Data Center:
                    <strong>{dc}</strong>
                </p>
            );
        }

        if (allOverrides.size > 0) {

            const children = allOverrides.map(o => (
                <strong key={o.get('dataCenter')}>
                    {o.get('tier')}
                    -
                    {o.get('dataCenter')}
                </strong>
            ));

            return (
                <p className="overrides">
                    Has overrides for
                    {intersperse(children, ', ')}
                </p>
            );
        }

        return null;
    }
}

function valueFor(setting) {
    if (setting.get('isEnum'))
        return EnumValue;

    if (setting.get('typeName') === 'System.Boolean')
        return BoolValue;

    return TextValue;
}

class EnumValue extends Component {
    render() {
        const { setting } = this.props;
        const activeOverride = setting.get('activeOverride');
        const defaultValue = setting.get('defaultValue');
        const value = (activeOverride || defaultValue).get('value');

        const enumNames = setting.get('enumNames');
        const name = enumNames.get(value).get('name');
        const description = enumNames.get(value).get('description');

        return (
            <div>
                <strong>{`${name} (${value})`}</strong>
                {description
                    ?  <span dangerouslySetInnerHTML={{__html: markdown(description)}} />
                    : null}
            </div>
        );
    }
}

class BoolValue extends Component {
    render() {
        const { setting } = this.props;
        const activeOverride = setting.get('activeOverride');
        const defaultValue = setting.get('defaultValue');
        const value = (activeOverride || defaultValue).get('value');
        const boolVal = value.toLowerCase() === 'true';

        return <img src={boolVal ? imgTrue : imgFalse} alt={value} />;
    }
}


class TextValue extends Component {
    render() {
        const { setting } = this.props;
        const activeOverride = setting.get('activeOverride');
        const defaultValue = setting.get('defaultValue');
        const value = (activeOverride || defaultValue).get('value') || '';

        return <pre className="value">{value.trim()}</pre>;
    }
}
