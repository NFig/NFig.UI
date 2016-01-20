import { 
    SET_EDITING
} from '../action-types';

export default function (state = null, action) {
    switch (action.type) {
      case SET_EDITING:
        return action.setting;
      default:
        return state;
    }
}

