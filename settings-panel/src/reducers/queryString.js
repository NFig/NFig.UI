import { 
    UPDATE_QUERYSTRING
} from '../action-types';

import omit from 'lodash/omit';

const defaultState = {};

export default function (state = defaultState, action) {
    switch (action.type) {
      case UPDATE_QUERYSTRING:
        if (action.value) {
            return {...state, [action.key]: action.value };
        } else {
            return omit(state, action.key);
        }
      default:
        return state;
    }
}

