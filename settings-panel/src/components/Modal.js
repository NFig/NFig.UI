import React, { Component, PropTypes } from 'react';

export default class Modal extends Component {

    static propTypes = {
        className: PropTypes.string.isRequired,
        onRequestClose: PropTypes.func,
        children: PropTypes.node.isRequired
    };

    onOverlayClick(e) {
        const { onRequestClose } = this.props;
        if (onRequestClose) { 
            onRequestClose();
        }
    }

    render() {
        const { className, children } = this.props;
        return (
            <div className={`${className}-modal`} onClick={e => this.onOverlayClick(e)}>
                <div className={`${className}-dialog`} onClick={e => e.stopPropagation()}>
                    <div className={`${className}-content`}>{children}</div>
                </div>
            </div>
        );
    }
}

