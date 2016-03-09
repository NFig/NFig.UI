import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';

export default class RadioButton extends Component {

    onClick = () => {
        const { onChange, value } = this.props;
        onChange(value);
    };

    render() {

        const {
            className,
            value,
            name,
            active,
            disabled,
            title,
            children,
        } = this.props;

        const classes = classnames({
            [className]: !!className,
            'label-button': true,
            active
        });

        return (
            <button
                className={classes}
                onClick={this.onClick}
                value={value}
                disabled={disabled}
                title={title}>
                {children}
            </button>
        );
    }
}
