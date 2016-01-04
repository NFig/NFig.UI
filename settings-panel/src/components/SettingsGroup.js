import React, { Component } from 'react';
import { Setting } from './Setting';

export default class SettingsGroup extends Component {
    render() {
        const { group } = this.props;
        return (
            <div className="setting-group" ref={node => {this.node = node;}}>
                <h4>{group.name}</h4>
                {group.settings.map(({setting, index}) => <Setting key={setting.name} setting={setting} index={index} />)}
            </div>
        );
    }
}

