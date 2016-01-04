/**
 * Bring in React and ReactDOM
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Components
 */
import SettingsSearchBox from './SettingsSearchBox';
import SettingsGroups from './SettingsGroups';
import EditorModal from './Editor';
import ErrorMessage from './ErrorMessage';


import Keys from '../keys';
import { actions, getGroups, getVisibleSettings } from '../store';

import _ from 'underscore';


/**
 * Some handy-dandy functions
 */

class SettingsPanel extends Component {
    componentDidMount() {
        const {
            className,
            customStyleSheet
        } = this.props;

        if (!className)
            require('../assets/styles.less');

        if (customStyleSheet)
            this.loadCustomStyleSheet(customStyleSheet);

        document.addEventListener('keydown', e => this.handleKeyDown(e));
    }

    handleKeyDown(e) {
        const { which } = e;
        const {
            groups,
            visible,
            editing,
            focused,
            dispatch
        } = this.props;

        switch (which) {
          case Keys.ESCAPE:
            if (editing) {
                dispatch(actions.setEditing(null));
            } else if (focused !== -1) {
                dispatch(actions.setFocused(-1));
            } else if (focused === -1) {
                this.searchBox.getWrappedInstance().focus();
            }
            break;
          case Keys.UP_ARROW:
            if (focused >= 0) {
                e.preventDefault();
                dispatch(actions.setFocused(focused - 1));
            }
            break;
          case Keys.DOWN_ARROW:
            if (focused < visible.length - 1) {
                e.preventDefault();
                dispatch(actions.setFocused(focused + 1));
            }
            break;
          case Keys.ENTER:
            if (!editing && focused >= 0 && focused < visible.length) {
                e.preventDefault();
                const setting = visible[focused].setting;
                dispatch(actions.setEditing(setting));
            }
            break;
        }
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


    render() {
        let {
            editing,
            className,
            groups,
            visible
        } = this.props;

        className = className || 'settings-panel';

        return (
            <div className={className}>
                <SettingsSearchBox className={className} ref={n => this.searchBox = n} settings={visible} />
                <ErrorMessage className={className} />
                <SettingsGroups groups={groups} className={className} />
                <EditorModal
                    display-if={editing}
                    className={`${className}-editor`}
                />
            </div>
        );
    }
}



export default connect(
    ({settings, focused, editing, search}) => {
        const visible = getVisibleSettings(settings, search);
        return {
            groups: getGroups(visible),
            visible,
            focused,
            editing
        };
    }
)(SettingsPanel);

