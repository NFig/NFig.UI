import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from './store';
import SettingsPanel from './SettingsPanel';
import * as actions from './actions';
import * as thunks from './thunks';
import values from 'lodash/values';
import { getQueryString } from './utils';

export function init(element, props) {
    const initialState = {
        urls: {
            settings : props.settingsUrl,
            set      : props.setUrl,
            clear    : props.clearUrl,
            copy     : props.copySettingsUrl
        },
        copySettings: {
            currentRedisConnection: props.currentRedisConnection
        }
    };

    const store = createStore(initialState);

    const instance = render(
        <Provider store={store}>
            <SettingsPanel {...props} />
        </Provider>,
        element
    );

    return { store, instance };
}


if (process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept();
}

