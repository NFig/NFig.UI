import {
    CANCEL_NEW_OVERRIDE,
    CLEAR_COPY_MESSAGE,
    SET_COPY_DIRECTION,
    SET_COPY_HOST,
    SET_COPY_MESSAGE,
    SET_COPY_ERROR,
    SET_EDITING,
    SET_ERROR,
    SET_FOCUSED_INDEX,
    SET_NEW_OVERRIDE_DATACENTER,
    SET_NEW_OVERRIDE_VALUE,
    SET_SEARCH_TEXT,
    SET_SETTINGS,
    SHOW_COPY_MODAL,
    SHOW_OVERRIDE_DETAILS,
    UPDATE_QUERYSTRING,
    UPDATE_SETTING,
} from './action-types';

import omit from 'lodash/omit';
import { combineReducers } from 'redux';

export function error(state = null, action) {
    switch (action.type) {
      case SET_ERROR:
        return action.message;
      default:
        return state;
    }
}

export function settings(state = [], action) {
    switch (action.type) {
      case SET_SETTINGS:
        return action.data.settings;

      case SET_FOCUSED_INDEX:
        return state.map((setting, idx) => {
            return idx === action.index
                ? { ...setting, focused: true }
                : { ...setting, focused: false }
        });


      case UPDATE_SETTING:
        const index = state.findIndex(s => s.name === action.setting.name);
        return [
            ...state.slice(0, index),
            action.setting,
            ...state.slice(index + 1)
        ];
      default: 
        return state;
    }
}

export function dataCenters (state = [], action) {
    switch (action.type) {
      case SET_SETTINGS:
        return action.data.availableDataCenters;
      default: 
        return state;
    }
}


export function editing (state = null, action) {
    switch (action.type) {
      case SET_EDITING:
        return action.setting;
      default:
        return state;
    }
}



export function focused (state = -1, action) {
    switch (action.type) {
      case SET_FOCUSED_INDEX:
        return action.index;
      default:
        return state;
    }
}

export function search (state = '', action) {
    switch (action.type) {
      case SET_SEARCH_TEXT:
        return action.searchText;
      default:
        return state;
    }
}


export function queryString (state = {}, action) {
    switch (action.type) {
      case UPDATE_QUERYSTRING:
        if (action.value) {
            return {...state, [action.key]: action.value };
        } else {
            return omit(state, action.key);
        }
      default:
        return state;
    }
}


export function override (state = {}, action) {
    switch (action.type) {
      case SET_EDITING:
        return (action.setting === null) ? {} : state;
      case CANCEL_NEW_OVERRIDE:
        return omit(state, 'dataCenter', 'overrideValue');
      case SET_NEW_OVERRIDE_DATACENTER:
        return {...state, dataCenter: action.dataCenter};
      case SET_NEW_OVERRIDE_VALUE:
        return {...state, overrideValue: action.value};
      case SHOW_OVERRIDE_DETAILS:
        return {...state, showDetails: action.show};
      default:
        return state;
    }
}

// Copy Settings sub-reducers
export const copySettings = (function () {

    function show(state = false, action) {
        switch (action.type) {
          case SHOW_COPY_MODAL:
            return action.show;
          default: 
            return state;
        }
    }

    function host(state = '', action) {
        switch (action.type) {
          case SHOW_COPY_MODAL:
            return '';
          case SET_COPY_HOST:
            return action.host;
          default:
            return state;
        }
    }

    function copyFrom(state = null, action) {
        switch (action.type) {
          case SHOW_COPY_MODAL:
            return null;
          case SET_COPY_DIRECTION:
            return !!action.copyFrom;
          default:
            return state;
        }
    }

    function message(state = null, action) {
        switch (action.type) {
          case SHOW_COPY_MODAL:
            return '';
          case SET_COPY_MESSAGE:
            return action.message;
          case CLEAR_COPY_MESSAGE:
            return null;
          default:
            return state;
        }
    }

    function error(state = null, action) {
        switch (action.type) {
          case SHOW_COPY_MODAL:
            return '';
          case SET_COPY_ERROR:
            return action.error;
          case CLEAR_COPY_MESSAGE:
            return null;
          default:
            return state;
        }
    }

    const currentRedisConnection = (c = null) => c;

    return combineReducers({
        show,
        host,
        copyFrom,
        message,
        error,
        currentRedisConnection
    });

})();

export const urls = (state = {}) => state;
