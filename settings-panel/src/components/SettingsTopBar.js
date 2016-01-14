import React, { Component, PropTypes } from 'react';

import SettingsSearchBox from './SettingsSearchBox';
import searchIcon from '../assets/search.png';
import CopySettingsButton from './CopySettingsButton';


class SettingsTopBar extends Component {
    static propTypes = {
        className: PropTypes.string.isRequired,
        showCopyButton: PropTypes.bool
    };

    render() {
        const { className, showCopyButton } = this.props;
        return (
            <div className="top-bar">
                <span className="search-icon">
                    <img src={searchIcon} alt="Search" />
                </span>
                <SettingsSearchBox />
                <CopySettingsButton display-if={showCopyButton} className={className} />
            </div>
        );
    }
}

export default SettingsTopBar;
