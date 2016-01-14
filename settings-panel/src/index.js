/**
 * React
 */
import React from 'react';
import ReactDOM from 'react-dom';

/**
 * Redux <-> React
 */
import { connect, Provider } from 'react-redux';

/**
 * Redux store
 */
import { createStore } from './store';
import { fetchSettings, handlePopState } from './store-actions';

/**
 * Other libs
 */
import pick from 'lodash/pick';
import Keys from './keys';

/**
 * Components
 */
import SettingsPanel from './components/SettingsPanel';

module.exports = {
  init(element, props) {

    const store = createStore(
      pick(props, 'settingsUrl', 'setUrl', 'clearUrl', 'copySettingsUrl'), 
      {
        settings: props.settings || [],
        dataCenters: props.availableDataCenters || props.dataCenters || [],
        copySettings: {
            currentRedisConnection: props.currentRedisConnection
        }
      }
    );

    if (!props.settings && props.settingsUrl) 
        store.dispatch(fetchSettings());
    else 
        store.dispatch(handlePopState);

    return ReactDOM.render(
      <Provider store={store}>
        <SettingsPanel {...pick(props, 'customStyleSheet')} />
      </Provider>
    , element);
  }
};
