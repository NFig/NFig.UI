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
import groupBy from 'lodash/groupBy';
import map from 'lodash/map';


import * as reducers from './store-reducers';
import * as actions from './store-actions';


const middlewares = [];
middlewares.push(thunkMiddleware);
if (process.env.NODE_ENV === 'development')
    middlewares.push(createLogger());

const createStoreWithMiddleware = applyMiddleware.apply(
    undefined,
    middlewares
)(createReduxStore);

const finalReducer = combineReducers(reducers);

export function createStore(urls, state) {
    const store = createStoreWithMiddleware(finalReducer, {...state, urls})
    window.addEventListener('popstate', () => handlePopState(store.dispatch, store.getState));
    return store;
};


function containsText(string, search) {
    return string.toLowerCase().indexOf(search.toLowerCase()) !== -1;
}

function settingMatches(setting, search) {
    return [setting.name, setting.description].some(s => containsText(s, search));
}

function getGroupName(setting) {
    return setting.name.replace(/^([^\.]+)\..+$/, '$1');
}

export function getVisibleSettings(settings, search) {
    return settings
    .filter(setting => settingMatches(setting, search))
    .map((setting, index) => ({setting, index}))
    ;
};

export function getGroups (settings) { 
    const groups = groupBy(settings, s => getGroupName(s.setting));
    return map(groups, (settings, name) => ({ name, settings}));
};

