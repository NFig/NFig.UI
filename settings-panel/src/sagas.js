import {
    takeLatest,
    takeEvery,
    SagaCancellationException
} from 'redux-saga';
import { select, put, take } from 'redux-saga/effects';
import request from './request-promise';
import keys from './keys';
import {
    getQueryString,
    updateQueryString
} from './utils';

import * as actions from './actions';
import { filteredSettingsSelector } from './selectors';

const {
    FETCH_SETTINGS,
    SETTINGS_RECEIVED,
    SEARCH,
    KEY,
    DIALOG
} = actions.types;


function* loadSettings() {
    const action = yield take(FETCH_SETTINGS);
    const urls = yield select(s => s.urls);
    const response = yield request.get(urls.settings).end();
    yield put(actions.settingsReceived(response.body.settings));
}

function* queryStringSaga({type, payload}) {
    switch (type) {
      case SEARCH:
        updateQueryString('search', payload);
        break;
      case DIALOG:
        // Are we editing a setting?
        const setting = payload && payload.component && payload.props && payload.props.setting;
        if (setting) {
            updateQueryString('edit', setting.get('name'));
        } else {
            updateQueryString('edit', null);
        }
        break;
    }
}

function* queryString() {
    const query = getQueryString();

    if (typeof query.search === 'string')
        yield put(actions.search(query.search));

    if (typeof query.edit === 'search') {
        const settings = yield select(s => s.settings);
        const setting = settings.find(s => s.get('name') === query.edit);
        if (setting !== null) {
            // yield put(actions.dialog(
        }
    }


    start monitor
    yield* takeLatest([SEARCH, DIALOG], queryStringSaga);
}


function* handleEscape() {
    // If there's a dialog, close it
    const {
        dialog,
        focusSearch,
        search
    } = yield select(s => ({
        dialog: s.dialog,
        focusSearch: s.focusSearch,
        search: s.search
    }));

    if (dialog.component) {
        yield put(actions.dialog(null));
        return;
    }

    if (!focusSearch) {
        yield put(actions.focusSearch(true));
        return;
    }

    if (search) {
        yield put(actions.search(''));
        return;
    }
}

function* navigateFocus(offset) {
    const { current, filteredCount } = yield select(s => {
        const filtered = filteredSettingsSelector(s);
        return { current: s.focusedIndex, filteredCount: filtered.size };
    });

    const next = Math.min(Math.max(-1, current + offset), filteredCount);
    if (next !== current) {
        if (current === -1 && next !== -1) {
            yield put(actions.focusSearch(false));
        } else if (current !== -1 && next === -1) {
            yield put(actions.focusSearch(true));
        }
        yield put(actions.focusedIndex(next));
    }
}

function* keySaga({payload}) {
    switch (payload) {
      case keys.ESCAPE:
        yield* handleEscape();
        break;
      case keys.UP:
        yield* navigateFocus(-1);
        break;
      case keys.DOWN:
        yield* navigateFocus(1);
        break;
    }
}

function* keyMonitor() {
    yield* takeEvery(KEY, keySaga);
}

export default [
    loadSettings,
    queryString,
    keyMonitor
];
