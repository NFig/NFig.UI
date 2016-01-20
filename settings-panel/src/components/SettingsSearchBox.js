import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Keys from '../keys';

import {
    setFocusedIndex,
    setEditing,
    setSearchText
} from '../actions';

import autobind from 'autobind-decorator';
import { createSelector } from 'reselect';
import property from 'lodash/property';

const mapStateToProps = createSelector(
    property('search'),
    property('focused'),
    property('copySettings'),
    property('editing'),
    (searchText, focused, copySettings, editing) => ({
        searchText, focused, copySettings, editing
    })
);


function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        setFocusedIndex,
        setEditing,
        setSearchText
    }, dispatch);
}

@connect(mapStateToProps, mapDispatchToProps, undefined, { withRef: true })
export default class SettingsSearchBox extends Component {

    static propTypes = {
        searchText      : PropTypes.string,
        visible         : PropTypes.array.isRequired,
        setFocusedIndex : PropTypes.func.isRequired,
        setEditing      : PropTypes.func.isRequired,
        setSearchText   : PropTypes.func.isRequired,
    };

    focus() { 
        this.textbox.selectionStart = this.textbox.value.length;
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

    @autobind
    handleFocus(e) {
        if (this.props.focused !== -1)
            this.props.setFocusedIndex(-1);
    }

    @autobind
    handleKeyDown(e) {
        const { searchText, visible, setEditing, setFocusedIndex } = this.props;
        switch (e.which) {
          case Keys.ENTER:
            if (visible.length === 1) {
                e.stopPropagation();
                setEditing(visible[0].setting);
                setFocusedIndex(0);
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

    @autobind
    setSearchText(e) {
        this.props.setSearchText(e.target.value);
    }

    render() {
        return (
            <input
                placeholder="Filter"
                aria-describedby="sizing-addon3"
                tabIndex="0"
                value={this.props.searchText}
                type="text"
                onKeyDown={this.handleKeyDown}
                onChange={this.setSearchText}
                ref={node => {this.textbox = node;}} 
                onFocus={this.handleFocus}
            />
        );
    }
}


