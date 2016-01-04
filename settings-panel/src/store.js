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
import _ from 'underscore';
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

const setQueryStringDebounced = _.debounce(setQueryString, 300);
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

        fetch(url) {
            return dispatch => {
                request
                .get(url)
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
                return _.omit(state, action.key);
          default:
            return state;
        }
    }
};
// =================================================================


// =================================================================
// Modal
// =================================================================
const modal = {
    actions: {
        dataCenter(dc) {
            return {
                type: 'SET_NEW_OVERRIDE_DATACENTER',
                dataCenter: dc
            };
        },

        overrideValue(value) {
            return { 
                type: 'SET_NEW_OVERRIDE_VALUE',
                value
            };
        },

        cancelNewOverride() {
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
                    modal: {
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
                            dispatch(modal.actions.cancelNewOverride());
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
            return _.omit(state, 'dataCenter', 'overrideValue');
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


const middlewares = [];
middlewares.push(thunkMiddleware);
// middlewares.push(createLogger());

const createStoreWithMiddleware = applyMiddleware.apply(
    undefined,
    middlewares
)(createReduxStore);

const finalReducer = combineReducers({
    error       : error.reducer,
    settings    : settings.reducer,
    dataCenters : dataCenters.reducer,
    editing     : editing.reducer,
    focused     : focused.reducer,
    search      : search.reducer,
    queryString : queryString.reducer,
    modal       : modal.reducer,
    urls        : (state = {}) => state // ZOMG HAAAAAAACK wtf
});

export function createStore(urls, state) {

    const store = createStoreWithMiddleware(finalReducer, {...state, urls})
    window.addEventListener('popstate', () => handlePopState(store.dispatch, store.getState));
    return store;
};

export const actions = {
    setError: error.actions.set,

    fetchSettings: settings.actions.fetch,
    setSearchText: search.actions.set,
    setFocused: focused.actions.set,
    setEditing: editing.actions.set,

    setModalDataCenter: modal.actions.dataCenter,
    setModalOverrideValue: modal.actions.overrideValue,
    cancelNewOverride: modal.actions.cancelNewOverride,
    showModalDetails: modal.actions.showDetails,

    setNewOverride: modal.actions.setNewOverride,
    clearOverride: modal.actions.clearOverride
};


const containsText = (string, search) => string.toLowerCase().indexOf(search.toLowerCase()) !== -1;
const settingMatches = (setting, search) => [setting.name, setting.description].some(s => containsText(s, search));
export const getVisibleSettings = (settings, search) => settings.filter(setting => settingMatches(setting, search));
const getGroupName = (setting) => setting.name.replace(/^([^\.]+)\..+$/, '$1');
export const getGroups = (settings) => _.chain(settings)
    .groupBy(s => getGroupName(s))
    .map((settings, name) => ({ name, settings}))
    .value();
