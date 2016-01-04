import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import SettingValue from './SettingValue';
import SettingDescription from './SettingDescription';

import { connect } from 'react-redux';

import { render } from '../../marked-renderer';
import { actions, getVisibleSettings } from '../../store';


const matches = Element.prototype.matches 
    ? (element, selector) => element.matches(selector)
    : (element, selector) => element.matchesSelector(selector)
    ;
    
class Setting extends Component {

    componentDidUpdate() {
        const { focused, index } = this.props;

        if (focused === index) {
            this.scrollIntoView();
        }
    }

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

        const { target } = e;
        const { dispatch, setting, index } = this.props;

        if (!matches(target, 'span.desc a')) {
            dispatch(actions.setEditing(setting));
            dispatch(actions.setFocused(index));
        }
    }

    render() {
        const { setting, index, focused } = this.props;

        let className = setting.activeOverride ? 'active-override ' : "";

        if (setting.allOverrides.length > 0)
          className += 'overrides ';

        if (focused === index)
          className += 'focused ';

        return (
            <div className={className + 'setting' } onClick={e => this.handleClick(e)} ref={setting.name}>
                <div className="name">
                    <strong>
                        <a>{setting.name}</a>
                    </strong>
                    <SettingDescription setting={setting} />
                </div>

                <SettingValue setting={setting} />
            </div>
        );
    }
}

export default connect(({focused})=>({focused}))(Setting);
