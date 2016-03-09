import { defineEnum } from './utils';
import { createAction as createFSA } from 'redux-actions';

export const types = defineEnum(
    'SETTINGS_RECEIVED',
    'SETTING_UPDATED',
    'FOCUSED_INDEX',
    'FOCUS_SEARCH',
    'SEARCH',
    'EDITING',
    'SHOW_COPY_SETTINGS',
    'COPYING_SETTINGS',
);


/**
 * ex:
 *
 * const creator = createAction('SOME_TYPE', 'arg1', 'arg2');
 *
 * creator('foo', 'bar');
 *
 * > {
 * >     type: "SOME_TYPE",
 * >     payload: {
 * >         arg1: "foo",
 * >         arg2: "bar"
 * >     }
 * > }
 *
 */
function createAction(type, ...keys) {
    function payloadCreator(...args) {

        const payload = {};

        for (let i = 0; i < keys.length; ++i) {
            payload[keys[i]] = args[i];
        }

        return payload;
    }

    if (keys.length === 0)
        return createFSA(type);

    return createFSA(type, payloadCreator);
}

export const settingsReceived = createAction(types.SETTINGS_RECEIVED);
export const settingUpdated   = createAction(types.SETTING_UPDATED, 'setting');
export const search           = createAction(types.SEARCH, 'searchText');
export const focusSearch      = createAction(types.FOCUS_SEARCH, 'focus');
export const focusedIndex     = createAction(types.FOCUSED_INDEX, 'index');
export const editing          = createAction(types.EDITING, 'editing');
export const showCopySettings = createAction(types.SHOW_COPY_SETTINGS, 'show');
export const copyingSettings  = createAction(types.COPYING_SETTINGS, 'copying');
