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
import { createStore, actions, handlePopState } from './store';

/**
 * Other libs
 */
import _ from 'underscore';
import Keys from './keys';

/**
 * Components
 */
import SettingsPanel from './components/SettingsPanel';





module.exports = {
  init(element, props) {

    const store = createStore(
      _.pick(props, 'settingsUrl', 'setUrl', 'clearUrl'), 
      {
        settings: props.settings || [],
        dataCenters: props.availableDataCenters || props.dataCenters || []
      }
    );

    if (!props.settings && props.settingsUrl) {
      store.dispatch(actions.fetchSettings(props.settingsUrl));
    } else {
        store.dispatch(handlePopState);
    }


    return ReactDOM.render(
      <Provider store={store}>
        <SettingsPanel {..._.pick(props, 'customStyleSheet')} />
      </Provider>
    , element);
  }
};
