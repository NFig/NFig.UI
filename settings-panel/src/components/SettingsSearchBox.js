import React, { Component } from 'react';
import { connect } from 'react-redux';

import _ from 'underscore';

import searchIcon from '../assets/search.png';
import Keys from '../keys';
import { actions } from '../store';

class SettingsSearchBox extends Component {

    focus() { 
        this.textbox.selectionStart = this.textbox.value.length;
        this.textbox.focus(); 
    }

    blur() { 
        this.textbox.blur(); 
    }

    componentDidMount() {
        if (this.props.focused === -1)
            this.focus();
    }

    componentDidUpdate() {
        const { focused } = this.props;
        if (focused === -1 && document.activeElement !== this.textbox) {
            this.focus();
            return;
        }

        if (focused !== -1 && document.activeElement === this.textbox) {
            this.blur();
            return;
        }
    }

    handleFocus(e) {
        if (this.props.focused !== -1)
            this.props.dispatch(actions.setFocused(-1));
    }

    handleKeyDown(e) {
        const { searchText, dispatch, settings } = this.props;
        switch (e.which) {
          case Keys.ENTER:
            dispatch(actions.setEditing(settings[0]));
            dispatch(actions.setFocused(0));
            break;
          case Keys.ESCAPE:
            if (searchText.replace(/^\s+|\s+$/g, '') !== '') {
                this.textbox.value = '';
                this.setSearchText('');
            }
            break;
        }
    }

    setSearchText(text) {
        this.props.dispatch(actions.setSearchText(text))
    }

    render() {
        return (
            <div className="search-box">
                <span className="search-icon">
                    <img src={searchIcon} alt="Search" />
                </span>
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
            </div>
        );
    }
}


export default connect(
    ({search, focused}) => ({
        searchText: search,
        focused
    }),
    undefined,
    undefined, 
    {
        withRef: true
    }
)(SettingsSearchBox);
