import {
    SET_SETTINGS,
    SET_FOCUSED_INDEX,
    UPDATE_SETTING
} from '../action-types';

const emptyArray = [];

export default function (state = emptyArray, action) {
    switch (action.type) {
      case SET_SETTINGS:
        return action.data.settings;

      case UPDATE_SETTING:
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

