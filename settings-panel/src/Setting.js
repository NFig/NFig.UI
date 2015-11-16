import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import SettingValue from './SettingValue';
import { render } from './marked-renderer';

import SettingDescription from './SettingDescription';

export default class Setting extends Component {

    scrollIntoView() {
        const node = ReactDOM.findDOMNode(this);

        // check if contained by window
        const rect = node.getBoundingClientRect();

        const bottom = (window.innerHeight || document.documentElement.clientHeight);

        if (rect.top < 94) { // arbitrary point below the nav bar
            // off the top of the screen
            window.scrollBy(0, rect.top - 94);
        } else if (rect.bottom > bottom) {
            // off the bottom edge
            window.scrollBy(0, (rect.bottom - bottom) + 10); // add 10px padding just because
       }
    }

    handleClick(e) {
        e.stopPropagation();
        this.props.events.trigger('begin-edit', this.props.setting);
    }

    render() {
        const setting = this.props.setting;

        let className = setting.activeOverride ? 'active-override ' : "";

        if (setting.allOverrides.length > 0)
          className += 'overrides ';

        if (setting.isFocused)
          className += 'focused ';



        return (
            <div className={className + 'setting' } onClick={e => this.handleClick(e)}>
                <div className="name">
                    <strong>
                        <a>{setting.name}</a>
                    </strong>
                    <SettingDescription setting={setting} />
                </div>

                <SettingValue {...this.props} />
            </div>
        );
    }
}
