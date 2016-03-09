import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import classnames from 'classnames';
import * as actions from './actions';
import * as thunks from './thunks';

import { markdown } from './utils';

import ButtonGroup from './ButtonGroup';
import RadioButton from './RadioButton';
import { Modal } from './Dialog';
import Portal from 'react-portal';

import arrowPng from './assets/arrow.png';
import spinner from './assets/ajax-loader.gif';


@connect()
export class CopySettingsButton extends Component {

    onCopySettingsClick = () => {
        this.props.dispatch(actions.showCopySettings(true));
    };

    render() {
        return (
            <span className="copy-settings">
                <button onClick={this.onCopySettingsClick}>Copy Settings</button>
            </span>
        );
    }
}



// Functions for ip address / host name checks
const isHostName = str =>  /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/.test(str);
const isIpAddress = str => /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(str);
const isPortNumber = str => /^0*(?:6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])$/.test(str);

@connect(state => ({
    isCopying: state.copySettings.copying
}))
export class CopySettingsModal extends Component {

    static contextTypes = {
        className: PropTypes.string
    };

    constructor(props) {
        super(props);

        this.state = {
            redisHost   : '',
            message     : null,
            error       : null,
            direction   : null,
            showConfirm : false
        };
    }

    canConfirm() {
        const { currentRedisConnection, isCopying } = this.props;
        const { redisHost, direction, } = this.state;

        if (isCopying)
            return false;

        if (redisHost.trim() === '')
            return false;

        if (redisHost.trim() === currentRedisConnection.trim())
            return false;

        if (direction === null)
            return false;

        if (redisHost.indexOf(':') !== -1) {
            const parts = redisHost.split(':');
            if (parts.length > 2)
                return false;

            const isHost = isHostName(parts[0]);
            const isPort = isPortNumber(parts[1]);

            return isHost && isPort;
        }

        return isHostName(redisHost) || isIpAddress(redisHost);
    }

    onCopyClick = () => {
        this.setState({showConfirm: true});
    }

    onCopyConfirm = () => {
        const { redisHost, direction } = this.state;
        const copyFrom = direction === 'from';

        this.props.dispatch(
            thunks.copySettings(redisHost, copyFrom, (error, message) => {
                const state = {
                    showConfirm: false,
                    error: null,
                    message: null
                };

                if (error)
                    state.error = error;
                else
                    state.message = message;

                this.setState(state);
            })
        );
    };

    onHostChange = (e) => {
        this.setState({redisHost: e.target.value});
    };

    onDirectionChange = (direction) => {
        this.setState({direction});
    };

    onConfirmClose = () => {
        this.setState({showConfirm: false});
    };

    render() {

        const { className } = this.context;
        const { currentRedisConnection, closeDialog, isCopying } = this.props;
        const { redisHost, message, error, direction, showConfirm } = this.state;

        return (
            <div className="copy-settings-modal" style={{
                cursor: isCopying ? 'wait' : undefined
            }}>
                <div className={`${className}-header`}>
                    <button
                        type="button"
                        className="close"
                        onClick={closeDialog}
                        disabled={isCopying}
                        >
                        <span aria-hidden="true">&times;</span>
                        <span className="sr-only">Close</span>
                    </button>

                    <h2>Copy all settings</h2>
                </div>

                {(error || message) ?
                    <div className={`${className}-body`}>
                        <p className={classnames({
                            'settings-panel-error' : !!error,
                            'settings-panel-success': !error
                        })}>
                            {error || message}
                        </p>
                    </div>
                : null}
                <div className={`${className}-body`}>
                    <p>
                        Current connection: <strong><code>{currentRedisConnection}</code></strong>
                    </p>
                    <p>
                        <input
                            type="text"
                            placeholder="Enter a redis instance (host:port)"
                            value={redisHost}
                            disabled={isCopying}
                            onChange={this.onHostChange}
                        />
                    </p>
                </div>
                <div className={`${className}-footer`}>
                    <ButtonGroup name="direction" onChange={this.onDirectionChange} selectedValue={direction}>
                        <RadioButton value="to" disabled={isCopying}>Copy To</RadioButton>
                        <RadioButton value="from" disabled={isCopying}>Copy From</RadioButton>
                    </ButtonGroup>
                    <span className="dlg-cta">
                        <button
                            className="submit label-button"
                            disabled={!this.canConfirm()}
                            onClick={this.onCopyClick}
                            >
                            Copy Settings
                        </button>
                    </span>
                </div>

                <Portal isOpened={showConfirm}>
                    <CopyConfirm
                        {...this.state}
                        className={className}
                        currentRedisConnection={currentRedisConnection}
                        isCopying={isCopying}
                        onConfirm={this.onCopyConfirm}
                        onRequestClose={this.onConfirmClose}
                    />
                </Portal>
            </div>
        );
    }
}


/**
 * helper for extracting port numbers
 */
const extractPort = str => str.replace(/^.+:(\d{1,5})$/, '$1');
const areSamePorts = (redis1, redis2) => extractPort(redis1) === extractPort(redis2);

class CopyConfirm extends Component {

    static propTypes = {
        redisHost: PropTypes.string.isRequired,
        direction: PropTypes.string,
        isCopying: PropTypes.bool.isRequired,
        onConfirm: PropTypes.func.isRequired
    };

    onRequestClose = () => {
        if (!this.props.isCopying) {
            this.props.onRequestClose();
        }
    };

    render() {

        const {
            redisHost,
            direction,
            currentRedisConnection,
            className,
            isCopying,
            onConfirm,
        } = this.props;

        const src = direction == 'to' ? currentRedisConnection : redisHost;
        const dst = direction == 'to' ? redisHost : currentRedisConnection ;

        const samePorts = areSamePorts(src, dst);

        return (
            <Modal className={className} onRequestClose={this.onRequestClose}>
                <div className='copy-settings-modal confirm' style={{
                    cursor: isCopying ? 'wait' : undefined
                }}>
                    <div className={`${className}-header`}>
                        <button
                            type="button"
                            className="close"
                            disabled={isCopying}
                            onClick={this.props.onRequestClose}
                            >
                            <span aria-hidden="true">&times;</span>
                            <span className="sr-only">Close</span>
                        </button>
                        <h2>Are you sure?</h2>
                    </div>
                    <div className={`${className}-body`}>
                        <p>
                            <strong><code>{dst}</code> will have all of its setting overrides completely replaced</strong> by
                            the overrides from <strong><code>{src}</code></strong>.<br />
                            <em><strong>This action cannot be undone</strong></em>
                        </p>
                        {!samePorts ?
                            <div className="settings-panel-error">
                                <strong>*Warning:*</strong> The port numbers you have specified do not match.
                            </div>
                        : null}
                    </div>
                    <div className={`${className}-footer diag`}>
                        <span>{src}</span>
                        <img src={arrowPng} />
                        <span>{dst}</span>
                    </div>
                    <div className={`${className}-footer`}>
                        <span className="dlg-cta">
                            {isCopying ?
                                <img src={spinner} />
                            : null}
                            <button
                                className="submit label-button"
                                onClick={onConfirm}
                                disabled={isCopying}
                                >
                                Confirm
                            </button>
                        </span>
                    </div>
                </div>
            </Modal>
        );
    }
}
