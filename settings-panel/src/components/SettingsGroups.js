import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import SettingsGroup from './SettingsGroup';

export default class SettingsGroups extends Component {

    static propTypes = {
        groups: PropTypes.array.isRequired,
    };

    shouldComponentUpdate(nextProps) {
        return nextProps.groups !== this.props.groups;
    }

    render() {
        const { groups } = this.props;

        return (
            <div className="setting-groups" display-if={groups.length}>
                {groups.map(group => <SettingsGroup
                    group={group}
                    key={`group-${group.name}`}
                    ref={group.name}
                />)}
            </div>
        );
    }
}


