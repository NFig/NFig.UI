import { createSelector } from 'reselect';
import { getGroupName, contains } from './utils';

/**
 * determines if a setting matches
 * the given search text
 */
function matchesSearch (setting, search, _hasOverride) {

    // has:override is special
    let matched = false;

    // Check if text matches
    matched = contains(setting.get('name'), search)
        || contains(setting.get('description'), search);

    if (_hasOverride)
        matched = matched && hasOverride(setting);

    return matched;
}

export function hasOverride(setting) {
    const activeOverride = setting.get('activeOverride');
    const allOverrides = setting.get('allOverrides');
    return activeOverride || allOverrides.size > 0;
}

/**
 * Raw selectors
 */
export const focusedIndexSelector = state => state.focusedIndex;
export const focusSearchSelector  = state => state.focusSearch;
export const settingsSelector     = state => state.settings;
export const searchSelector       = state => state.search;
export const editingSelector      = state => state.editing;
export const dataCentersSelector  = state => state.dataCenters;
export const copySettingsSelector = state => state.copySettings;


/**
 * Calculated selectors
 */

/**
 * We need to make sure settings are sorted,
 * so they can be grouped properly
 */
export const sortedSettingsSelector = createSelector(
    settingsSelector,
    settings => settings.sortBy(
        s => s.get('name'),
        (n1, n2) => n1.toLowerCase().localeCompare(n2.toLowerCase())
    )
);

/**
 * Apply the search text to the sorted settings
 */

const overrideKeyword = /\bhas:override\b/i;

export const filteredSettingsSelector = createSelector(
    sortedSettingsSelector,
    searchSelector,
    (settings, search) => {
        let overrides;

        if (overrideKeyword.test(search)) {
            overrides = true;
            search = search.replace(overrideKeyword, '').trim();
        }

        return settings.filter(s => matchesSearch(s, search, overrides)).entrySeq();
    }
);

/**
 * Group all settings by the part that appears before the dot
 */
export const groupedSettingsSelector = createSelector(
    filteredSettingsSelector,
    settings => settings.groupBy(s => getGroupName(s[1].get('name')))
);

/**
 * Which setting is currently focused
 */
export const focusedSettingSelector = createSelector(
    focusedIndexSelector,
    filteredSettingsSelector,
    (index, filtered) => {
        const entry = filtered.get(index);
        return entry ? entry[1] : null; /* filtered returns entries */
    }
);

