import React, { Component } from 'react';
import Setting from './Setting';

export default class SettingsGroup extends Component {
    render() {
        const { name, settings, dataCenters, onSettingClick } = this.props;
        return (
            <div className="setting-group" ref={name}>
                <h4>{name}</h4>
                {settings.map(setting => (
                    <Setting 
                        ref={setting.name}
                        name={setting.name}
                        setting={setting}
                        dataCenters={dataCenters}
                        onSettingClick={onSettingClick}
                        key={setting.name} />
                ))}
            </div>
        );
    }
}

