import React, { Component, PropTypes } from 'react';

import SettingsSearchBox from './SettingsSearchBox';
import searchIcon from '../assets/search.png';
import CopySettingsButton from './CopySettingsButton';


export default class SettingsTopBar extends Component {
    static propTypes = {
        className      : PropTypes.string.isRequired,
        showCopyButton : PropTypes.bool,
        visible        : PropTypes.array.isRequired
    };

    focusSearch() {
        this.refs.searchBox.getWrappedInstance().focus();
    }

    render() {
        const { className, showCopyButton, visible } = this.props;
        return (
            <div className="top-bar">
                <span className="search-icon">
                    <img src={searchIcon} alt="Search" />
                </span>
                <SettingsSearchBox visible={visible} ref="searchBox" />
                <CopySettingsButton display-if={showCopyButton} className={className} />
            </div>
        );
    }
}

