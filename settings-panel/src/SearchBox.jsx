import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import imgSearch from './assets/search.png';

import * as actions from './actions';
import * as thunks from './thunks';

import {
    focusedIndexSelector,
    focusSearchSelector,
    searchSelector,
} from './selectors';

const mapState = createSelector(
    searchSelector,
    focusedIndexSelector,
    focusSearchSelector,
    (search, focusedIndex, focusSearch) => ({
        search,
        focusedIndex,
        focusSearch
    })
);


@connect(mapState, undefined, undefined, { withRef: true })
export default class SearchBox extends Component {

    componentDidMount() {
        if (this.props.focusSearch) {
            this.focus();
        }
    }

    componentWillReceiveProps(nextProps) {
        this.refs.input.value = nextProps.search;
    }

    componentDidUpdate() {
        if (this.props.focusSearch)
            this.focus();
        else
            this.blur();
    }

    focus() {
        setTimeout(instance => {

            if (!instance.props.focusSearch)
                return; // need to double check cuz it could've changed

            document.body.scrollTop = 0;

            const node = instance.refs.input;
            node.focus();
            node.selectionStart = node.value.length;
        }, 0, this);
    }

    blur() {
        setTimeout(instance => {
            if (instance.props.focusSearch)
                return;

            instance.refs.input.blur();
        }, 0, this);
    }

    onChange = () => {
        this.props.dispatch(
            thunks.search(this.refs.input.value)
        );
    }

    onFocus = () => {
        if (this.props.focusSearch)
            return;

        this.props.dispatch(actions.focusSearch(true));
    };

    onBlur = () => {
        if (!this.props.focusSearch)
            return;

        this.props.dispatch(actions.focusSearch(false));
    };

    render() {

        const { search } = this.props;

        return (
            <span className="search-box">
                <span className="search-icon">
                    <img src={imgSearch} alt="Search" />
                </span>
                <input
                    placeholder="Filter"
                    tabIndex="0"
                    type="text"
                    defaultValue={search}
                    onChange={this.onChange}
                    onBlur={this.onBlur}
                    onFocus={this.onFocus}
                    ref="input"
                />
            </span>
        );
    }
}
