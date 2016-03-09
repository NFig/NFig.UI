import * as actions from './actions';
import request from './request-promise';
import { createSelector } from 'reselect';
import debounce from 'lodash/debounce';

import {
    parseQueryString,
    updateQueryString
} from './utils';

import * as selectors from './selectors';

const {
    focusedIndexSelector,
    filteredSettingsSelector
} = selectors;

export function loadQueryString (dispatch, getState) {
    const query = parseQueryString();
    const state = getState();

    if (state.search !== (query.search || ''))
        dispatch(search(query.search));

    dispatch(editSetting(query.editing));
}


export function fetchSettings (dispatch, getState) {

    const { urls } = getState();

    request.get(urls.settings)
        .end()
        .then(res => {
            dispatch(actions.settingsReceived(res.body));
            dispatch(loadQueryString);
        });
}

const debouncedQueryStringUpdate = debounce((key, value, replace = false) => {
    updateQueryString(key, value, replace);
}, 350);


export function search(text, replace = false) {
    return (dispatch, getState) => {
        dispatch(actions.search(text));
        debouncedQueryStringUpdate('search', text, replace);
    };
}



/**
 * Updates the querystring and sets the current dialog
 * to the override editor
 */
export function editSetting(name) {
    return (dispatch, getState) => {

        const state = getState();
        const settings = state.settings;
        const filtered = filteredSettingsSelector(state);

        const setting = settings.find(s => s.get('name') === name);

        /**
         * A couple interesting states.
         * In the case where the name is valid,
         * and it's visible in the filtered list,
         * then let's go ahead and show it, and update
         * the querystring
         */
        if (!(name && setting)) {
            /**
             * This is an invalid setting, clear the querystring, focus search and
             * set editing flag
             */
            dispatch([
                actions.focusSearch(true),
                actions.editing(false)
            ]);
            updateQueryString('editing', '');

        } else {

            const entry = filtered.find(([index, setting]) => setting.get('name') === name);

            if (entry) {

                const [index, setting] = entry;

                dispatch([
                    actions.focusedIndex(index),
                    actions.editing(true)
                ]);

                updateQueryString('editing', name);

            } else {

                /**
                 * Here's the case where it's a valid name,
                 * but it's _not_ in the filtered list
                 * In this case, we want to nuke the search filter
                 * but *not* push a new history entry
                 */
                dispatch(search('', true));

                // and re-run the edit
                dispatch(editSetting(name));
            }

        }
    };
}



/**
 * Selector to retrieve the current list of filtered settings
 * and the focusedIndex
 */
const filteredAndFocusedSelector = createSelector(
    filteredSettingsSelector,
    focusedIndexSelector,
    (filtered, focusedIndex) => ({filtered, focusedIndex})
);


export function nextSetting(dispatch, getState) {
    const {
        filtered,
        focusedIndex
    } = filteredAndFocusedSelector(getState());

    if (focusedIndex < filtered.size - 1)
        dispatch(actions.focusedIndex(focusedIndex + 1));
}

export function prevSetting(dispatch, getState) {
    const {
        filtered,
        focusedIndex
    } = filteredAndFocusedSelector(getState());

    if (focusedIndex >= 0)
        dispatch(actions.focusedIndex(focusedIndex - 1));
}

export function escape(dispatch, getState) {
    const { focusSearch, search:searchText } = getState();

    if (!focusSearch) {
        dispatch(actions.focusSearch(true));
        return;
    }

    if (searchText) {
        dispatch(search(''));
        return;
    }


}

export function enter(dispatch, getState) {
    const { focusedIndex } = getState();
    if (focusedIndex !== -1) {
        dispatch(actions.editing(true));
    }
}

export function closeDialog(dispatch, getState) {
    dispatch([
        actions.editing(false),
        actions.showCopySettings(false)
    ]);

    updateQueryString('editing', '');
}



/**
 *
 */
export function setOverride(settingName, dataCenter, value, callback) {
    return (dispatch, getState) => {

        const { urls } = getState();

        request.post(urls.set)
            .send({settingName, dataCenter, value})
            .type('form')
            .end()
            .then((res) => {
                if (res.ok) {
                    dispatch(actions.settingUpdated(res.body));
                    if (typeof callback === 'function') {
                        callback();
                    }
                }
                else {
                    callback(res.body);
                }
            })
            .catch(e => {
                callback(e);
            });
    };
}

/**
 *
 */
export function clearOverride(settingName, dataCenter, callback) {
    return (dispatch, getState) => {
        const { urls } = getState();

        request.post(urls.clear)
            .send({settingName, dataCenter})
            .type('form')
            .end()
            .then((res) => {
                if (res.ok) {
                    dispatch(actions.settingUpdated(res.body));
                    if (typeof callback === 'function') {
                        callback();
                    }
                }
                else {
                    callback(res.body);
                }
            })
            .catch(e => {
                callback(e);
            });
    };
}


/**
 *
 */
export function copySettings(redisHost, copyFrom, callback) {
    return (dispatch, getState) => {
        dispatch(actions.copyingSettings(true));

        const { urls } = getState();
        const { copy: copySettingsUrl } = urls;


        request.post(copySettingsUrl)
            .send({redisHost, copyFrom})
            .type('form')
            .end()
            .then(res => {
                if (typeof callback === 'function') {
                    if (!res.ok) {
                        callback(res.body.error);
                    } else {
                        dispatch(actions.settingsReceived(res.body));
                        callback(null, 'Settings copied successfully.');
                    }
                }
            })
            .catch(err => {
                let msg =
                    (err.response && err.response.body && err.response.body.error)
                    || err.message
                    || err.toString();

                if (typeof callback === 'function')
                    callback(msg);
            })
            .finally(() => {
                dispatch(actions.copyingSettings(false));
            });
    };
}
