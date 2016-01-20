import debounce from 'lodash/debounce';
import request from 'superagent';
import qs from 'qs';


import {
    CANCEL_NEW_OVERRIDE,
    CLEAR_COPY_MESSAGE,
    SET_COPY_DIRECTION,
    SET_COPY_ERROR,
    SET_COPY_HOST,
    SET_COPY_MESSAGE,
    SET_CURRENT_REDIS_CONNECTION,
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
} from '../action-types';



import act from './makeAction';

// =================================================================
// Location changes
// =================================================================
function getQueryString () { 
    return location.hash.length > 1 ? qs.parse(location.hash.substr(1)) : {};
}

function setQueryString(query) {
    let queryString = qs.stringify(query);

    if (queryString.length > 0)
        queryString = '#' + queryString;

    history.pushState(null, null, `${location.pathname}${queryString}`);
};

const setQueryStringDebounced = debounce(setQueryString, 300);
export function handlePopState(dispatch, getState) {
    const query = getQueryString();

    if (query.search) {
        dispatch(setSearchText(query.search));
    }

    if (query.editing) {
        const { settings } = getState();
        const index = settings.findIndex(s => s.name === query.editing);
        if (index !== -1) {
            dispatch(setEditing(settings[index]));
            dispatch(setFocusedIndex(index));
        }
    }
};
// =================================================================


// =================================================================
// Error
// =================================================================

const setError = act(SET_ERROR, 'message');

// =================================================================

// =================================================================
// Settings
// =================================================================

export const setSettings = act(SET_SETTINGS, 'data');

export function fetchSettings() {
    return (dispatch, getState) => {
        request
        .get(getState().urls.settingsUrl)
        .end((err, res) => {
            if (err || !res.ok) {
                dispatch(setError(err.message || err.toString() || res.body));
                return;
            }

            dispatch(setSettings(res.body));
            dispatch(handlePopState);
        });
    };
}

const setEditingAction = act(SET_EDITING, 'setting');

export function setEditing(setting) {
    return (dispatch) => {
        dispatch(setEditingAction(setting));
        dispatch(updateQueryString('editing', setting ? setting.name : null));
        if (!setting)
            dispatch(setError(null));
    };
}

export const updateSetting = act(UPDATE_SETTING, 'setting');

// =================================================================

// =================================================================
// Focused setting
// =================================================================

export const setFocusedIndex = act(SET_FOCUSED_INDEX, 'index');

// =================================================================

// =================================================================
// Querystring
// =================================================================
const updateQueryStringAction = act(UPDATE_QUERYSTRING, 'key', 'value');

function updateQueryString(key, value, debounced) {
    return (dispatch, getState) => {
        dispatch(updateQueryStringAction(key, value));
        const setFn = debounced ? setQueryStringDebounced : setQueryString;
        setFn(getState().queryString);
    };
}
// =================================================================

// =================================================================
// SearchText
// =================================================================
const setSearchTextAction = act(SET_SEARCH_TEXT, 'searchText');

export function setSearchText(searchText) {
    return (dispatch) => {
        dispatch(setSearchTextAction(searchText));
        dispatch(updateQueryString('search', searchText, true));
    };
}
// =================================================================


// =================================================================
// New / Edit Override
// =================================================================

export const setOverrideDataCenter = act(SET_NEW_OVERRIDE_DATACENTER, 'dataCenter');
export const setOverrideValue      = act(SET_NEW_OVERRIDE_VALUE, 'value');
export const cancelOverride        = act(CANCEL_NEW_OVERRIDE);
export const showOverrideDetails   = act(SHOW_OVERRIDE_DETAILS, 'show');

export function setNewOverride() {
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
                    dispatch(setError(err.message || err.toString() || res.body));
                } else {
                    dispatch(updateSetting(res.body));
                    dispatch(setEditing(res.body));
                    dispatch(cancelOverride());
                    if (currentError)
                        dispatch(setError(null));
                }
            });
    };
}

export function clearOverride(dataCenter) {
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
                    dispatch(setError(err.message || err.toString() || res.body));
                } else {
                    dispatch(updateSetting(res.body));
                    dispatch(setEditing(res.body));
                    dispatch(cancelOverride());
                    if (currentError)
                        dispatch(setError(null));
                }
            });
    };
}
// =================================================================


// =================================================================
// Copy Settings
// =================================================================

export const showCopyModal             = act(SHOW_COPY_MODAL, 'show');
export const setCopyDirection          = act(SET_COPY_DIRECTION, 'copyFrom');
export const setCopyError              = act(SET_COPY_MESSAGE, 'error');
export const setCopyHost               = act(SET_COPY_HOST, 'host');
export const setCopyMessage            = act(SET_COPY_MESSAGE, 'message');
export const clearCopyMessage          = act(CLEAR_COPY_MESSAGE);
export const setCurrentRedisConnection = act(SET_CURRENT_REDIS_CONNECTION, 'currentRedisConnection');

export function confirmCopy() {
    return (dispatch, getState) => {
        const state = getState();
        const { host: redisHost, copyFrom = false } = state.copySettings;
        const { copySettingsUrl } = state.urls;

        request
            .post(copySettingsUrl)
            .type('form')
            .send({redisHost, copyFrom})
            .end((err, res) => {
                if (err || !res.ok) {
                    dispatch(setCopyError(res.body.error));
                } else {
                    dispatch(setCopyMessage('Settings copied successfully.'));
                    dispatch(setSettings(res.body));
                }
            });
    };

}
// =================================================================
