import React, { Component, PropTypes } from 'react';

export default class ButtonGroup extends Component {
    static propTypes = {
        name: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        children: PropTypes.node.isRequired
    };

    render() {
        const {name, selectedValue, onChange, children} = this.props;

        const mapped = React.Children.map(children, child => {
            const {value} = child.props;
            return React.cloneElement(child, {...child.props, name, active: value === selectedValue, onChange});
        })

        return (
            <span className="radio-button-group">
                {mapped}
            </span>
        );
    }
}
