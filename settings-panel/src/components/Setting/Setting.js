import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { bindActionCreators } from 'redux';

import SettingValue from './SettingValue';
import SettingDescription from './SettingDescription';

import { connect } from 'react-redux';

import { render } from '../../marked-renderer';
import { getVisibleSettings } from '../../store';

import { setEditing, setFocusedIndex } from '../../actions';

import { createSelector } from 'reselect';
import property from 'lodash/pick';
import identity from 'lodash/identity';
import autobind from 'autobind-decorator';


const mapStateToProps = createSelector(
    state => state.focused,
    focused => ({focused})
);

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        setEditing,
        setFocusedIndex
    }, dispatch);
}

const matches = Element.prototype.matches 
    ? (element, selector) => element.matches(selector)
    : (element, selector) => element.matchesSelector(selector)
    ;
    
@connect(mapStateToProps, mapDispatchToProps)
export default class Setting extends Component {

    static propTypes = {
        setting : PropTypes.object.isRequired,
        focused : PropTypes.number.isRequired,
        index   : PropTypes.number.isRequired
    };

    shouldComponentUpdate(nextProps) {
        if (nextProps.setting !== this.props.setting) {
            return true;
        }
        
        if (nextProps.focused !== this.props.focused) {
            return true;
        }

        return false;
    }

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

    @autobind
    handleClick(e) {
        e.stopPropagation();

        const { target } = e;
        const { setting, index, setEditing, setFocusedIndex } = this.props;

        if (!matches(target, 'span.desc a')) {
            setEditing(setting);
            setFocusedIndex(index);
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
            <div className={className + 'setting' } onClick={this.handleClick} ref={setting.name}>
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
