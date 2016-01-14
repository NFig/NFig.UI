import React, { Component, PropTypes } from 'react';

export default class RadioButton extends Component {


    render() {
        const {value, className, onChange, name, children, active, disabled, title} = this.props;

        const classNames = (className && className.split(' ')) || [];
        classNames.push('label-button');
        if (active)
            classNames.push('active');

        return (
            <button className={classNames.join(' ')} value={value} onClick={() => onChange(value)} disabled={disabled} title={title}>
                {children}
            </button>
        );
    }
}
