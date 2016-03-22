import { handleActions } from 'redux-actions';
import Immutable from 'immutable';
import { types } from './actions';
import { combineReducers } from 'redux';


/**
 * These don't change after the initial load
 */
export const settings = handleActions({

    [types.SETTINGS_RECEIVED] : (state, {payload}) => Immutable.fromJS(payload.settings),

    [types.SETTING_UPDATED]: (state, {payload}) => {
        const { setting } = payload;
        if (!setting)
            return state;

        const index = state.findIndex(s => s.get('name') === setting.name);
        if (index === -1)
            return state;

        return state.set(index, Immutable.fromJS(setting));
    }

}, Immutable.List());


export const dataCenters = handleActions({
    [types.SETTINGS_RECEIVED] : (state, {payload}) => Immutable.fromJS(payload.availableDataCenters)
}, Immutable.List());


export const currentTier = handleActions({
    [types.SETTINGS_RECEIVED] : (state, {payload}) => payload.currentTier
}, null);


/**
 * Things that can be done with search
 */
export const search = handleActions({

    [types.SEARCH] : (state, {payload}) => payload.searchText || ''

}, '');


/**
 * Which setting has the focus
 */
export const focusedIndex = handleActions({

    [types.FOCUSED_INDEX] : (state, {payload}) => payload.index,

    [types.FOCUS_SEARCH]  : (state, {payload}) => {
        if (payload.focus)
            return -1;
        return state;
    }

}, -1);


/**
 * Are we editing the focused setting
 */
export const editing = handleActions({

    [types.EDITING]: (state, {payload}) => payload.editing

}, false);


/**
 * Just model search focus in state, too
 * nasty doing it any other way
 */
export const focusSearch = handleActions({

    [types.FOCUS_SEARCH]: (state, {payload}) => payload.focus,

    [types.FOCUSED_INDEX]: (state, {payload}) => {
        if (payload.index !== -1)
            return false;
        return true;
    }

}, true);

/**
 * a flag for whether to show the copy settings dialog
 * or not
 */
export const copySettings = combineReducers({
    show: handleActions({
        [types.SHOW_COPY_SETTINGS]: (state, {payload}) => payload.show
    }, false),

    copying: handleActions({
        [types.SHOW_COPY_SETTINGS]: () => false, // reset this if the dialog is hidden or shown
        [types.COPYING_SETTINGS]: (state, {payload}) => payload.copying
    }, false),

    currentRedisConnection: (state = null) => state
});


/**
 * Set by init, never change afterwards
 */
export const urls = (state = {}) => state;


