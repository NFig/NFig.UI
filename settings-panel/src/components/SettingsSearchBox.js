import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import Keys from '../keys';

import {
    setFocusedIndex,
    setEditing,
    setSearchText
} from '../store-actions';

class SettingsSearchBox extends Component {

    static propTypes = {
        searchText: PropTypes.string,
        dispatch: PropTypes.func.isRequired,
        visible: PropTypes.array.isRequired
    };

    focus() { 
        this.textbox.selectionStart = this.textbox.value.length;
        // console.trace();
        this.textbox.focus(); 
        window.scrollTo(0, 0);
    }

    blur() { 
        this.textbox.blur(); 
    }

    componentDidMount() {
        if (this.props.focused === -1)
            this.focus();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.focused !== this.props.focused) { 
            return true; 
        }

        if (nextProps.searchText !== this.props.searchText) { 
            return true; 
        }

        return false;
    }

    componentDidUpdate() {

        const { focused, copySettings, editing } = this.props;

        if (copySettings.show || editing)
            return; // bail if the copy settings dialog is showing

        if (focused === -1) {
            this.focus();
            return;
        }

        if (focused !== -1) {
            this.blur();
            return;
        }

    }

    handleFocus(e) {
        if (this.props.focused !== -1)
            this.props.dispatch(setFocusedIndex(-1));
    }

    handleKeyDown(e) {
        const { searchText, dispatch, visible } = this.props;
        switch (e.which) {
          case Keys.ENTER:
            if (visible.length === 1) {
                e.stopPropagation();
                dispatch(setEditing(visible[0].setting));
                dispatch(setFocusedIndex(0));
            }
            break;
          case Keys.ESCAPE:
            if (searchText.replace(/^\s+|\s+$/g, '') !== '') {
                e.stopPropagation();
                this.setSearchText('');
            }
            break;
        }
    }

    setSearchText(text) {
        this.props.dispatch(setSearchText(text))
    }

    render() {
        return (
            <input
                placeholder="Filter"
                aria-describedby="sizing-addon3"
                tabIndex="0"
                value={this.props.searchText}
                type="text"
                onKeyDown={e => this.handleKeyDown(e)}
                onChange={e => this.setSearchText(e.target.value)}
                ref={node => {this.textbox = node;}} 
                onFocus={e => this.handleFocus(e)}
            />
        );
    }
}


export default connect(
    ({search, focused, copySettings, editing}) => ({
        searchText: search,
        focused,
        copySettings,
        editing
    }),
    undefined,
    undefined, 
    {
        withRef: true
    }
)(SettingsSearchBox);
