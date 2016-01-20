/**
 * Bring in React and ReactDOM
 */
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

/**
 * Components
 */
import SettingsTopBar from './SettingsTopBar';
import SettingsGroups from './SettingsGroups';
import EditorModal from './Editor';
import ErrorMessage from './ErrorMessage';
import CopySettingsButton from './CopySettingsButton';


import Keys from '../keys';
import { getGroups, getVisibleSettings } from '../store';

import { 
    setFocusedIndex,
    setEditing,
    showCopyModal
} from '../actions';


import { createSelector } from 'reselect';
import property from 'lodash/property';
import negate from 'lodash/negate';

/**
 * Use reselect to memoize things
 */

const visibleSettingsSelector = createSelector(
    property('settings'),
    property('search'),
    (settings, search) => {
        const visible = getVisibleSettings(settings, search);
        const groups = getGroups(visible);
        return { visible, groups };
    }
);



const mapStateToProps = createSelector(
    visibleSettingsSelector,
    property('focused'),
    property('editing'),
    ({urls}) => !!urls.copySettingsUrl,
    (settings, focused, editing, showCopyButton) => {
        return {
            ...settings,
            focused,
            editing,
            showCopyButton
        };
    }
);

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        setFocusedIndex,
        setEditing,
        showCopyModal
    }, dispatch);
}


@connect(mapStateToProps, mapDispatchToProps)
export default class SettingsPanel extends Component {

    static propTypes = {
        groups         : PropTypes.array.isRequired,
        visible        : PropTypes.array.isRequired,
        focused        : PropTypes.number.isRequired,
        editing        : PropTypes.object,
        showCopyButton : PropTypes.bool.isRequired
    };

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
            setFocusedIndex,
            setEditing,
        } = this.props;

        switch (which) {
          case Keys.ESCAPE:
            if (editing) {
                setEditing(null);
            } else {
                if (focused !== -1)
                    setFocusedIndex(-1);
                window.scrollTo(0, 0);
                this.refs.topbar.focusSearch();
            }
            break;
          case Keys.UP_ARROW:
            if (focused >= 0 && !editing) {
                e.preventDefault();
                setFocusedIndex(focused - 1);
            }
            break;
          case Keys.DOWN_ARROW:
            if (focused < visible.length - 1 && !editing) {
                e.preventDefault();
                setFocusedIndex(focused + 1);
            }
            break;
          case Keys.ENTER:
            if (!editing && focused >= 0 && focused < visible.length) {
                e.preventDefault();
                const setting = visible[focused].setting;
                setEditing(setting);
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
            visible,
            showCopyButton
        } = this.props;

        className = className || 'settings-panel';

        return (
            <div className={className}>
                <SettingsTopBar 
                    className={className} 
                    showCopyButton={showCopyButton}
                    visible={visible}
                    ref="topbar"
                />
                <ErrorMessage className={className} />
                <SettingsGroups groups={groups} className={className} />
                <EditorModal className={className} />
            </div>
        );
    }
}




