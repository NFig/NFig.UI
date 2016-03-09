import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import * as actions from './actions';
import * as thunks from './thunks';
import * as keys from './keys';

import Portal from 'react-portal';

import { createSelector } from 'reselect';

@connect()
export default class Dialog extends Component {

    static propTypes = {
        dialog: PropTypes.shape({
            component: PropTypes.func,
            props: PropTypes.object
        }).isRequired
    };

    onClose = () => {
        this.props.dispatch(thunks.closeDialog);
    };


    render() {

        const { dialog } = this.props;

        let child = null;

        if (dialog.component) {

            const Component = dialog.component;
            const props = dialog.props;

            child = <Component {...props} closeDialog={this.onClose} ref="child" />;
        }

        return (
            <Portal isOpened={child !== null}>
                <Modal onRequestClose={this.onClose} >
                    {child}
                </Modal>
            </Portal>
        );
    }
}



export class Modal extends Component {
    static contextTypes = {
        className: PropTypes.string.isRequired
    };

    static propTypes = {
        onRequestClose: PropTypes.func,
        children: PropTypes.node
    };

    onOverlayClick = e => {
        const { onRequestClose } = this.props;
        if (onRequestClose) onRequestClose();
    };

    onContentClick = e => {
        e.stopPropagation();
    };

    onKeyDown = e => {

        switch (e.which) {
            case keys.UP:
            case keys.DOWN:
            case keys.PAGEUP:
            case keys.PAGEDOWN:
            case keys.SPACE:
              e.preventDefault();
              break;


            case keys.LEFT:
            case keys.RIGHT:
              if (!(e.altKey || e.metaKey))
                  e.preventDefault();
              break;

            case keys.ESCAPE:
              this.onOverlayClick();
              break;
        }
    };

    // Focus in React is weird, since the event system is synthetic
    componentDidMount() {
        document.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.onKeyDown);
    }

    render() {
        const { children } = this.props;
        const { className } = this.context;
        return (
            <div className={`${className}-modal`}
                onClick={this.onOverlayClick}>
                <div className={`${className}-dialog`}>
                    <div className={`${className}-content`} onClick={this.onContentClick}>
                        {children}
                    </div>
                </div>
            </div>
        );
    }
}

