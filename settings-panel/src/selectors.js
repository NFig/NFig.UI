import { createSelector } from 'reselect';
import { getGroupName, contains } from './utils';

/**
 * determines if a setting matches
 * the given search text
 */
function matchesSearch (setting, search) {
    return contains(setting.get('name'), search) ||
        contains(setting.get('description'), search);
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
export const filteredSettingsSelector = createSelector(
    sortedSettingsSelector,
    searchSelector,
    (settings, search) => settings.filter(s => matchesSearch(s, search)).entrySeq()
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

