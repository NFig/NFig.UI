import { 
    createStore as createReduxStore,
    combineReducers,
    applyMiddleware
} from 'redux';


/**
 * Middlewares
 */
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';

/**
 * Libs
 */
import debounce from 'lodash/debounce';
import omit from 'lodash/omit';
import groupBy from 'lodash/groupBy';
import map from 'lodash/map';

import request from 'superagent';
import qs from 'qs';



// =================================================================
// Location changes
// =================================================================
const getQueryString = () => location.hash.length > 1 ? qs.parse(location.hash.substr(1)) : {};
const setQueryString = query => {
    let queryString = qs.stringify(query);

    if (queryString.length > 0)
        queryString = '#' + queryString;

    history.pushState(null, null, `${location.pathname}${queryString}`);
};

const setQueryStringDebounced = debounce(setQueryString, 300);
export const handlePopState = (dispatch, getState) => {
    const query = getQueryString();

    if (query.search) {
        dispatch(search.actions.set(query.search));
    }

    if (query.editing) {
        const { settings } = getState();
        const index = settings.findIndex(s => s.name === query.editing);
        if (index !== -1) {
            dispatch(editing.actions.set(settings[index]));
            dispatch(focused.actions.set(index));
        }
    }
};

// =================================================================


// =================================================================
// Error
// =================================================================
const error = {
    actions: {
        set(message) {
            return {
                type: 'SET_ERROR',
                message
            };
        }
    },

    reducer(state = null, action) {
        switch (action.type) {
          case 'SET_ERROR':
            return action.message;
          default:
            return state;
        }
    }
};
// =================================================================

// =================================================================
// Settings
// =================================================================
const settings = {
    actions: {
        set(data) {
            return {
                type: 'SET_SETTINGS',
                data
            };
        },

        fetch() {
            return (dispatch, getState) => {
                request
                .get(getState().urls.settingsUrl)
                .end((err, res) => {
                    if (err || !res.ok) {
                        dispatch(error.actions.setError(err.message || err.toString() || res.body));
                        return;
                    }

                    dispatch(settings.actions.set(res.body));
                    dispatch(handlePopState);
                });
            };
        },

        update(setting) {
            return {
                type: 'UPDATE_SETTING',
                setting
            };
        }
    },

    reducer(state = [], action) {
        switch (action.type) {
          case 'SET_SETTINGS':
            return action.data.settings;

          case 'SET_FOCUSED_INDEX':
            return state.map((setting, idx) => {
                return idx === action.index
                    ? { ...setting, focused: true }
                    : { ...setting, focused: false }
            });


          case 'UPDATE_SETTING':
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
}
// =================================================================


// =================================================================
// dataCenters
// =================================================================
const dataCenters = {
    reducer(state = [], action) {
        switch (action.type) {
          case 'SET_SETTINGS':
            return action.data.availableDataCenters;
          default: 
            return state;
        }
    }
};
// =================================================================


// =================================================================
// Editing
// =================================================================
const editing = {
    actions: {
        set(setting) {
            return dispatch => {
                dispatch({
                    type: 'SET_EDITING',
                    setting
                });

                dispatch(queryString.actions.update(
                    'editing', 
                    setting ? setting.name : null
                ));

                if (!setting) {
                    // clear error
                    dispatch(error.actions.set(null));
                }
            };
        }
    },

    reducer(state = null, action) {
        switch (action.type) {
          case 'SET_EDITING':
            return action.setting;
          default:
            return state;
        }
    }
};
// =================================================================


// =================================================================
// Focused
// =================================================================
const focused = {
    actions: {
        set(index) {
            return {
                type: 'SET_FOCUSED_INDEX',
                index
            };
        },
    },

    reducer(state = -1, action) {
        switch (action.type) {
          case 'SET_FOCUSED_INDEX':
            return action.index;
          default:
            return state;
        }
    }
};
// =================================================================

// =================================================================
// Search
// =================================================================
const search = {
    actions: {
        set(searchText) {
            return dispatch => {
                dispatch({
                    type: 'SET_SEARCH_TEXT',
                    searchText
                });

                dispatch(queryString.actions.update('search', searchText, true));
            }
        }
    },

    reducer(state = '', action) {
        switch (action.type) {
          case 'SET_SEARCH_TEXT':
            return action.searchText;
          default:
            return state;
        }
    }
};
// =================================================================


// =================================================================
// QueryString
// =================================================================
const queryString = {
    actions: {
        update(key, value, debounced) {
            return (dispatch, getState) => {
                dispatch({
                    type: 'UPDATE_QUERYSTRING',
                    key,
                    value
                });

                (debounced 
                    ? setQueryStringDebounced
                    : setQueryString)(getState().queryString);
            }
        }
    },

    reducer(state = {}, action) {
        switch (action.type) {
          case 'UPDATE_QUERYSTRING':
            if (action.value) 
                return {...state, [action.key]: action.value };
            else
                return omit(state, action.key);
          default:
            return state;
        }
    }
};
// =================================================================


// =================================================================
// Override Modal
// =================================================================
const override = {
    actions: {
        setDataCenter(dc) {
            return {
                type: 'SET_NEW_OVERRIDE_DATACENTER',
                dataCenter: dc
            };
        },

        setValue(value) {
            return { 
                type: 'SET_NEW_OVERRIDE_VALUE',
                value
            };
        },

        cancel() {
            return {
                type: 'CANCEL_NEW_OVERRIDE'
            };
        },

        showDetails(show) {
            return {
                type: 'MODAL_SHOW_DETAILS',
                show
            };
        },

        setNewOverride() { 
            return (dispatch, getState) => {

                const { 
                    error: currentError,
                    editing: { name: settingName }, 
                    override: {
                        dataCenter,
                        overrideValue: value,
                    },
                    urls
                } = getState();

                request
                    .post(urls.setUrl)
                    .type('form')
                    .send({ settingName, dataCenter, value })
                    .end((err, res) => {
                        if (err || !res.ok) {
                            dispatch(error.actions.set(err.message || err.toString() || res.body));
                        } else {
                            dispatch(settings.actions.update(res.body));
                            dispatch(editing.actions.set(res.body));
                            dispatch(override.actions.cancelOverride());
                            if (currentError)
                                dispatch(error.actions.set(null));
                        }
                    });
            };
        },

        clearOverride(dataCenter) {
            return (dispatch, getState) => {
                const {
                    error: currentError,
                    editing: { name: settingName },
                    urls
                } = getState();

                request
                    .post(urls.clearUrl)
                    .type('form')
                    .send({settingName, dataCenter})
                    .end((err, res) => {
                        if (err || !res.ok) {
                            dispatch(error.actions.set(err.message || err.toString() || res.body));
                        } else {
                            dispatch(settings.actions.update(res.body));
                            dispatch(editing.actions.set(res.body));
                            if (currentError)
                                dispatch(error.actions.set(null));
                        }
                    });
            };
        }
    },

    reducer(state = {}, action) {
        switch (action.type) {
          case 'SET_EDITING':
            return (action.setting === null) ? {} : state;
          case 'CANCEL_NEW_OVERRIDE':
            return omit(state, 'dataCenter', 'overrideValue');
          case 'SET_NEW_OVERRIDE_DATACENTER':
            return {...state, dataCenter: action.dataCenter};
          case 'SET_NEW_OVERRIDE_VALUE':
            return {...state, overrideValue: action.value};
          case 'MODAL_SHOW_DETAILS':
            return {...state, showDetails: action.show};
          default:
            return state;
        }
    }
};
// =================================================================

// =================================================================
// Copy Settinsg Modal
// =================================================================
const copySettings = {
    actions: {
        host(value) {
            return {
                type: 'SET_COPY_HOST',
                host: value
            };
        },

        direction(copyFrom) {
            return {
                type: 'SET_COPY_DIRECTION',
                copyFrom
            };
        },

        setMessage(message) {
            return { type: 'SET_COPY_MESSAGE', message };
        },

        clearMessage: () => ({ type: 'SET_COPY_MESSAGE', message: null }),

        setError(error) {
            return { type: 'SET_COPY_MESSAGE', error };
        },

        confirm() {
            return (dispatch, getState) => {
                const state = getState();
                const { host: redisHost, copyFrom = false } = state.copySettings;
                const { copySettingsUrl } = state.urls;

                // console.log({copySettingsUrl, redisHost, copyFrom});
                request
                    .post(copySettingsUrl)
                    .type('form')
                    .send({redisHost, copyFrom})
                    .end((err, res) => {
                        if (err || !res.ok) {
                            dispatch(copySettings.actions.setError(res.body.error));
                        } else {
                            dispatch(copySettings.actions.setMessage('Settings copied successfully.'));
                            dispatch(settings.actions.set(res.body));
                        }
                    });
            };
        }
    },

    reducer (state = {}, action) {
        switch(action.type) {
          case 'SET_COPY_HOST':
            return { ...state, host: action.host };
          case 'SET_COPY_DIRECTION':
            return { ...state, copyFrom: action.copyFrom };
          case 'SET_COPY_MESSAGE':
            if (action.error) 
                return { ...state, error: action.error };
            return { ...state, message: action.message };
          default:
            return state;
        }
    }
};
// =================================================================


const middlewares = [];
middlewares.push(thunkMiddleware);
if (process.env.NODE_ENV === 'development')
    middlewares.push(createLogger());

const createStoreWithMiddleware = applyMiddleware.apply(
    undefined,
    middlewares
)(createReduxStore);

const finalReducer = combineReducers({
    error        : error.reducer,
    settings     : settings.reducer,
    dataCenters  : dataCenters.reducer,
    editing      : editing.reducer,
    focused      : focused.reducer,
    search       : search.reducer,
    queryString  : queryString.reducer,
    override     : override.reducer,
    copySettings : copySettings.reducer,
    urls         : (state = {}) => state // ZOMG HAAAAAAACK wtf
});

export function createStore(urls, state) {

    const store = createStoreWithMiddleware(finalReducer, {...state, urls})
    window.addEventListener('popstate', () => handlePopState(store.dispatch, store.getState));
    return store;
};

export const actions = {
    setError              : error.actions.set,

    setSettings           : settings.actions.set,
    fetchSettings         : settings.actions.fetch,
    setSearchText         : search.actions.set,
    setFocused            : focused.actions.set,
    setEditing            : editing.actions.set,

    // Overrides
    setOverrideDataCenter : override.actions.setDataCenter,
    setOverrideValue      : override.actions.setValue,
    cancelOverride        : override.actions.cancel,
    showOverrideDetails   : override.actions.showDetails,
    setNewOverride        : override.actions.setNewOverride,
    clearOverride         : override.actions.clearOverride,

    // Copy Settings
    setCopyHost           : copySettings.actions.host,
    setCopyDirection      : copySettings.actions.direction,
    clearMessage          : copySettings.actions.clearMessage,
    confirmCopy           : copySettings.actions.confirm
};


function containsText(string, search) {
    return string.toLowerCase().indexOf(search.toLowerCase()) !== -1;
}

function settingMatches(setting, search) {
    return [setting.name, setting.description].some(s => containsText(s, search));
}

export function getVisibleSettings(settings, search) {
    return settings
    .filter(setting => settingMatches(setting, search))
    .map((setting, index) => ({setting, index}))
    ;
};

function getGroupName(setting) {
    return setting.name.replace(/^([^\.]+)\..+$/, '$1');
}

export function getGroups (settings) { 
    const groups = groupBy(settings, s => getGroupName(s.setting));
    return map(groups, (settings, name) => ({ name, settings}));
};
