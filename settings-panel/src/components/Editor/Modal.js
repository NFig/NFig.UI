import React, { Component } from 'react';

export default class Modal extends Component {

    onOverlayClick(e) {
        const { onRequestClose } = this.props;
        onRequestClose && onRequestClose();
    }

    render() {
        return (
            <div className={`${this.props.className}-modal`} onClick={e => this.onOverlayClick(e)}>
                <div className={`${this.props.className}-dialog`} onClick={e => e.stopPropagation()}>
                    <div className={`${this.props.className}-content`}>{this.props.children}</div>
                </div>
            </div>
        );
    }
}

