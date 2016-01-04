import React, { Component } from 'react';
import { connect } from 'react-redux';

import SettingsGroup from './SettingsGroup';

export default class SettingsGroups extends Component {
  render() {

    const { groups } = this.props;

    return (
      <div className="setting-groups" display-if={groups.length}>
        {groups.map(group => (
          <SettingsGroup
            group={group}
            key={`group-${group.name}`}
            ref={group.name}
          />
          ))}
        </div>
    );
  }
}


