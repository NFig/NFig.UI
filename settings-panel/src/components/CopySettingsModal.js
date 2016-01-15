import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import Modal from './Modal';
import ButtonGroup from './ButtonGroup';
import RadioButton from './RadioButton';
import keys from '../keys';

// Functions for ip address / host name checks
const isHostName = str =>  /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/.test(str);
const isIpAddress = str => /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(str);
const isPortNumber = str => /^0*(?:6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])$/.test(str);

export default class CopySettingsModal extends Component {
    static propTypes = {
        className              : PropTypes.string.isRequired,
        currentRedisConnection : PropTypes.string.isRequired,

        redisHost              : PropTypes.string.isRequired,
        copyFrom               : PropTypes.bool.isRequired,

        onRequestClose         : PropTypes.func.isRequired,
        onHostChange           : PropTypes.func.isRequired,
        onDirectionChange      : PropTypes.func.isRequired,
        onCopyClick            : PropTypes.func.isRequired,

        message                : PropTypes.string,
        error                  : PropTypes.string
    };

    componentDidMount() {
        const node = findDOMNode(this);
        node.addEventListener('keydown', e => this.handleKeyDown(e));

        // this runs during the click handler of the show button,
        // so break the syncronicity
        setTimeout(() => {
            this.refs.hostInput.focus();
        }, 1);
    }

    componentWillUnmount() {
        const node = findDOMNode(this);
        node.removeEventListener('keydown', e => this.handleKeyDown(e));
    }


    handleKeyDown(e) {
        e.stopPropagation();
        if (e.which === keys.ESCAPE) {
            this.props.onRequestClose();
        }
    }

    canConfirm() {
        const { redisHost, currentRedisConnection } = this.props;

        if (redisHost.trim() === '')
            return false;

        if (redisHost.trim() === currentRedisConnection.trim())
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

    render() {

        const {
            className,
            currentRedisConnection,
            redisHost,
            copyFrom,

            error,
            message,

            onRequestClose,
            onHostChange,
            onDirectionChange,
            onCopyClick
        } = this.props;

        

        return (
            <Modal className={className} onRequestClose={onRequestClose}>

                <div className={`${className}-header`}>
                    <button type="button" className="close" onClick={onRequestClose}>
                        <span aria-hidden="true">&times;</span>
                        <span className="sr-only">Close</span>
                    </button>
                    <h2>Copy all settings</h2>
                </div>

                <div className={`${className}-body`} display-if={error || message}>
                    <p className={error ? 'settings-panel-error' : 'settings-panel-success'}>
                        {error || message}
                    </p>
                </div>
                <div className={`${className}-body`}>
                    <p>
                        Current connection: <strong><code>{currentRedisConnection}</code></strong>
                    </p>
                    <p>
                        <input
                            ref="hostInput"
                            type="text"
                            placeholder="Enter a redis instance (host:port)"
                            value={redisHost}
                            onChange={onHostChange}
                        />
                    </p>
                </div>
                <div className={`${className}-footer`}>
                    <ButtonGroup name="direction" onChange={onDirectionChange} selectedValue={copyFrom}>
                        <RadioButton value={false}>Copy To</RadioButton>
                        <RadioButton value={true}>Copy From</RadioButton>
                    </ButtonGroup>
                    <span className="dlg-cta">
                        <button
                            className="submit label-button"
                            disabled={!this.canConfirm()}
                            onClick={onCopyClick}
                        >
                            Copy Settings
                        </button>
                    </span>
                </div>

            </Modal>
        );
    }
}
