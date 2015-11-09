import React, { Component } from 'react';
import { render } from './marked-renderer';

export default class SettingDescription extends Component {

    render() {
        const { setting } = this.props;
        return (<span className="desc" dangerouslySetInnerHTML={{__html: render(setting.description)}} />);
    }
}

// vim: ts=4 sw=4 et
