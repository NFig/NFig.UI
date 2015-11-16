// cannot be stateless as it's ref'ed

import React, { Component } from 'react';
import Setting from './Setting';

export default class SettingsGroup extends Component {
    render() {
        const { settings, dataCenters, name, events } = this.props;

        const children = settings.map(setting => {
            return (
                <Setting
                    setting={setting}
                    key={setting.name}
                    dataCenters={dataCenters}
                    events={events}
                    ref={setting.name}
                />
            );
        });

        return (
            <div className="setting-group">
                <h4>{name}</h4>
                {children}
            </div>
        );
    }
}

