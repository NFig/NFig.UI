import React, { Component, PropTypes } from 'react';
import { render } from '../../marked-renderer';

export default class SettingDescription extends Component {
    static propTypes = {
        setting : PropTypes.object.isRequired
    };

    render() {
        const { setting } = this.props;
        return (<span className="desc" dangerouslySetInnerHTML={{__html: render(setting.description)}} />);
    }
}

// vim: ts=4 sw=4 et
