import React, { Component } from 'react';
import Keys from './keys';

import searchIcon from './search.png';

export default class SettingsSearchBox extends Component {

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
        this.refs.textbox.focus();
    }

    blur() {
        this.refs.textbox.blur();
    }

    render() {
        return (
            <div className="search-box">
                <span className="search-icon">
                    <img src={searchIcon} alt="Search" />
                </span>
                <input
                    {...this.props}
                    type="text"
                    onKeyDown={e => this.handleKeyDown(e)}
                    ref="textbox" />
            </div>
        );
    }
}

