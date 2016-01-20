import React, { Component, PropTypes } from 'react';

import { render } from '../../marked-renderer';
import imgTrue from '../../assets/setting-true.png';
import imgFalse from '../../assets/setting-false.png';
import intersperse from '../../intersperse';


const ValueFor = setting => {
  if (setting.isEnum)
    return EnumValue;

  return {
    'System.Boolean': BoolValue
  }[setting.typeName] || TextValue;
}

function shouldUpdate(nextProps) { 
    return nextProps.setting !== this.props.setting;
}

export default class SettingValue extends Component {

    static propTypes = {
        setting: PropTypes.object.isRequired
    };

    shouldComponentUpdate = shouldUpdate;

    render() {
        const { setting } = this.props;

        const { 
            activeOverride,
            allOverrides
        } = setting;


        let overrideInfo = null;
        if (activeOverride) {
            const { dataCenter: dcOverride } = activeOverride;

            overrideInfo = (
                <p className="overrides">
                    Overridden by Data Center: <strong>{dcOverride}</strong>
                </p>
            );
        } else if (allOverrides.length > 0) {
            const children = allOverrides.map((o, i) => <strong key={o.dataCenter}>{`${o.tier}-${o.dataCenter}`}</strong>);
            overrideInfo = (
                <p className="overrides">
                    Has overrides for&nbsp;
                    {intersperse(children, ", ")}
                </p>
            );
        }

        const Value = ValueFor(setting);
        return (
            <div className='editable value'>
                <Value {...this.props} />
                {overrideInfo}
            </div>
        );
    }
}

class EnumValue extends Component {
    shouldComponentUpdate = shouldUpdate;
    render() {
        const { setting: { activeOverride, defaultValue, enumNames } } = this.props;
        const value = (activeOverride || defaultValue).value;
        const name = enumNames[value].name;
        const description = enumNames[value].description;
        return (
            <div>
                <strong>{`${name} (${value})`}</strong>
                <span render-if={description} dangerouslySetInnerHTML={{__html: render(description)}} />
            </div>
        );
    }
}


class BoolValue extends Component {
    shouldComponentUpdate = shouldUpdate;
    render() {
        const {setting: {activeOverride, defaultValue}} = this.props;
        const value = (activeOverride || defaultValue).value;
        const boolVal = typeof value === 'string'
            ? value.toLowerCase() === 'true'
            : !!value;

            return (<img src={boolVal ? imgTrue : imgFalse} alt={value} />);
    }
};

class TextValue extends Component {
    shouldComponentUpdate = shouldUpdate;
    render() {
        const { setting: { activeOverride, defaultValue } } = this.props;
        const value = (activeOverride || defaultValue).value;
        return (<pre className="value">{value}</pre>);
    }
};

