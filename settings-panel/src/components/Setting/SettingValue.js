import React from 'react';

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

const SettingValue = props => {
    const { setting } = props;

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
          <Value {...props} />
            {overrideInfo}
        </div>
    );
};

const EnumValue = props => {
    const { setting: { activeOverride, defaultValue, enumNames } } = props;
    const value = (activeOverride || defaultValue).value;
    const name = enumNames[value].name;
    const description = enumNames[value].description;
    return (
        <div>
            <strong>{`${name} (${value})`}</strong>
            <span render-if={description} dangerouslySetInnerHTML={{__html: render(description)}} />
        </div>
    );
};

const BoolValue = ({setting: {activeOverride, defaultValue}}) => {
    const value = (activeOverride || defaultValue).value;
    const boolVal = typeof value === 'string'
        ? value.toLowerCase() === 'true'
        : !!value;

    return (<img src={boolVal ? imgTrue : imgFalse} alt={value} />);
};

const TextValue = ({ setting: { activeOverride, defaultValue } }) => {
    const value = (activeOverride || defaultValue).value;
    return (<pre className="value">{value}</pre>);
};

export default SettingValue;
