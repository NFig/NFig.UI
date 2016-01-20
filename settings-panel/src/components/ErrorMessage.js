import React, { Component, PropTypes } from 'react';

import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import property from 'lodash/property';

const mapStateToProps = createSelector(
    property('error'),
    ({editing}) => editing !== null,
        (error, editing) => ({error, editing})
);

@connect(mapStateToProps)
export default class ErrorMessage extends Component {
    static propTypes = {
        error     : PropTypes.string,
        editing   : PropTypes.bool.isRequired,
        className : PropTypes.string.isRequired,
    };

    render() {
        const { error, editing, className } = this.props;
        return (
            <div>
                <div 
                    display-if={error && !editing} 
                    className={`${className || 'settings-panel'}-error`}>
                    {error}
                </div>
            </div>
        );
    }
};
