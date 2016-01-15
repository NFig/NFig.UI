import React, { Component, PropTypes } from 'react';
import Modal from './Modal';
import { render as markdown } from '../marked-renderer';

import arrowPng from '../assets/arrow.png';

function md(str) {
    return markdown(str, {
        paragraph: str => str // don't bother with paragraphs
    });
}

const extractPort = str => str.replace(/^.+:(\d{1,5})$/, '$1');

export default class CopySettingsConfirm extends Component {


    static propTypes = {
        className              : PropTypes.string.isRequired,
        currentRedisConnection : PropTypes.string.isRequired,
        redisHost              : PropTypes.string.isRequired,
        copyFrom               : PropTypes.bool.isRequired,
        onRequestClose         : PropTypes.func.isRequired,
        onConfirm              : PropTypes.func.isRequired
    };

    areSamePorts(redis1, redis2) {
        return extractPort(redis1) === extractPort(redis2);
    }

    render() {

        const { 
            onRequestClose,
            className,
            currentRedisConnection,
            redisHost,
            copyFrom,
            onConfirm
        } = this.props;

        const src = copyFrom ? redisHost : currentRedisConnection;
        const dst = copyFrom ? currentRedisConnection : redisHost;

        const samePorts = this.areSamePorts(src, dst);

        return (
            <Modal className={className} onRequestClose={onRequestClose}>
                <div className={`${className}-header`}>
                    <button type="button" className="close" onClick={onRequestClose}>
                        <span aria-hidden="true">&times;</span>
                        <span className="sr-only">Close</span>
                    </button>
                    <h2>Are you sure?</h2>
                </div>
                <div className={`${className}-body`}>
                    <p dangerouslySetInnerHTML={{__html:
                        md(`**\`${dst}\` will have all of its setting overrides completely replaced** by
                           the overrides from **\`${src}\`**.  
                           _**This action cannot be undone**_`)
                        }} 
                    />
                    <div 
                        display-if={!samePorts} 
                        className="settings-panel-error"
                        dangerouslySetInnerHTML={{__html: 
                            md(`**\*Warning\***: The port numbers you have specified do not match.`) 
                        }}
                    />
                </div>
                <div className={`${className}-footer diag`}>
                    <span>{src}</span>
                    <img src={arrowPng} />
                    <span>{dst}</span>
                </div>
                <div className={`${className}-footer`}>
                    <span className="dlg-cta">
                        <button
                            className="submit label-button"
                            onClick={onConfirm}
                            >
                            Confirm
                        </button>
                    </span>
                </div>
            </Modal>
        );
    }
}
