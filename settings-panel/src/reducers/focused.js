import {
    SET_FOCUSED_INDEX
} from '../action-types';

export default function (state = -1, action) {
    switch (action.type) {
      case SET_FOCUSED_INDEX:
        return action.index;
      default:
        return state;
    }
}

