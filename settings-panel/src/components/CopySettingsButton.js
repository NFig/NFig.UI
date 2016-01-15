import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import Portal from 'react-portal';
import pick from 'lodash/pick';
import { connect } from 'react-redux';
import request from 'superagent';
import {
    showCopyModal,
    setCopyHost,
    setCopyDirection,
    clearCopyMessage,
    confirmCopy
} from '../store-actions';
import keys from '../keys';

import CopySettingsModal from './CopySettingsModal';
import CopySettingsConfirm from './CopySettingsConfirm';

class CopySettingsButton extends Component {

    static propTypes = {
        className              : PropTypes.string.isRequired,

        show                   : PropTypes.bool.isRequired,
        host                   : PropTypes.string,
        copyFrom               : PropTypes.bool,
        showConfirm            : PropTypes.bool,
        currentRedisConnection : PropTypes.string,
        message                : PropTypes.string,
        error                  : PropTypes.string
    };

    static defaultState = {
        showConfirm: false
    };

    constructor(props) {
        super(props);
        this.state = CopySettingsButton.defaultState;
    }

    handleClose() {
        const { dispatch } = this.props;
        this.setState(CopySettingsButton.defaultState);
        dispatch(showCopyModal(false));
    }

    handleHostChange(host) {
        this.props.dispatch(setCopyHost(host));
    }

    handleDirectionChange(copyFrom) {
        this.props.dispatch(setCopyDirection(copyFrom));
    }

    showModal(show) {
        this.props.dispatch(showCopyModal(show));
    }

    showConfirm(show) {
        this.setState({showConfirm: show});
    }

    handleCopySettings() {
        const { dispatch } = this.props;
        dispatch(confirmCopy());
        dispatch(setCopyHost(''));
        this.showConfirm(false);
    }

    render() {
        const {
            showConfirm
        } = this.state;

        const {
            show: showModal,
            className,
            currentRedisConnection,
            host: redisHost = '',
            copyFrom = false,
            error,
            message
        } = this.props;

        return (
            <span className="copy-settings">
                <button onClick={(e) => this.showModal(true)}>Copy Settings</button>

                <Portal display-if={showModal} isOpened={true} className="copy-settings-modal">
                    <CopySettingsModal {...{ className, currentRedisConnection, redisHost, copyFrom, message, error }}
                        onRequestClose={() => this.handleClose()}
                        onHostChange={e => this.handleHostChange(e.target.value)}
                        onDirectionChange={copyFrom => this.handleDirectionChange(copyFrom)}
                        onCopyClick={() => this.showConfirm(true)}
                    />
                </Portal>

                <Portal display-if={showConfirm} isOpened={true} className="copy-settings-modal confirm">
                    <CopySettingsConfirm {...{ className, currentRedisConnection, redisHost, copyFrom }}
                        onRequestClose={() => this.setState({showConfirm: false})}
                        onConfirm={() => this.handleCopySettings()}
                    />
                </Portal>
            </span>
        );
    }
};




function mapStateToProps({ copySettings }) {
    return {...copySettings};
}

export default connect(mapStateToProps)(CopySettingsButton);
