import React from 'react';
import { render } from './marked-renderer';

import imgTrue from './setting-true.png';
import imgFalse from './setting-false.png';

// String.join helper for elements / dom nodes
const intersperse = (arr, sep) =>
  arr && arr.slice(1).reduce((xs, x, i) => xs.concat([sep,x]), [arr[0]]) || [];


const SettingValue = props => {
    const { setting } = props;

    const child = setting.isBool
        ? <BoolValue {...props} />
        : setting.isEnum
            ? <EnumValue {...props} />
            : <TextValue {...props} />;

    let overrideInfo = null;
    if (setting.activeOverride) {

        const dcOverride = props.setting.activeOverride.dataCenter;

        overrideInfo = (
            <p className="overrides">
                Overridden by Data Center: <strong>{dcOverride}</strong>
            </p>
        );
    } else if (setting.allOverrides.length > 0) {
        const children = setting.allOverrides.map((o, i) => <strong key={i}>{`${o.tier}-${o.dataCenter}`}</strong>);
        overrideInfo = (
            <p className="overrides">
                Has overrides for&nbsp;
                {intersperse(children, ", ")}
            </p>
        );
    }

    return (
        <div className='editable value'>
            {child}
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
            <strong>{name}</strong>
            {description ? <span dangerouslySetInnerHTML={{__html: render(description)}} /> : null}
        </div>
    );
};

const BoolValue = props => {
    const setting = props.setting;
    const value = (setting.activeOverride || setting.defaultValue).value;

    const boolVal = typeof value === 'string'
        ? value.toLowerCase() === 'true'
        : !!value;

    return (
      <img src={boolVal ? imgTrue : imgFalse} alt={value} />
    );
};

const TextValue = props => {
    const { setting: { activeOverride, defaultValue } } = props;
    const value = (activeOverride || defaultValue).value;
    return (<pre className="value">{value}</pre>);
};

export default SettingValue;
