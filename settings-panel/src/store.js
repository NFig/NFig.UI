import {
    applyMiddleware,
    createStore as createReduxStore,
    combineReducers,
    compose
} from 'redux';

import {
    batchingEnhancer,
    batchingMiddleware,
    batchReduce
} from './batch-middleware';

import * as reducers from './reducers';

// Support for stateTransformer
import { Iterable } from 'immutable';
import isPlainObject from 'lodash/isPlainObject';
import mapValues from 'lodash/mapValues';

// Middlewares
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';


const middlewares = [
    thunk,
    batchingMiddleware,
];


/**
 * If we're in development mode, set up
 * redux-logger so we can see what's going on
 */
if (process.env.NODE_ENV === 'development') {

    const stateTransformer = (state) => {
        if (Iterable.isIterable(state))
            return state.toJS();
        if (Array.isArray(state))
            return state.map(stateTransformer);
        if (isPlainObject(state))
            return mapValues(state, stateTransformer);

        return state;
    };

    middlewares.push(
        createLogger({
            collapsed: true,
            stateTransformer,
            actionTransformer: stateTransformer
        })
    );
}


export function createStore(initialState) {

    const reducer = batchReduce(combineReducers(reducers));

    return createReduxStore(
        reducer,
        initialState,
        applyMiddleware(...middlewares)
    );
}

