import { 
    SET_SEARCH_TEXT
} from '../action-types';

const defaultState = '';
export default function (state = defaultState, action) {
    switch (action.type) {
      case SET_SEARCH_TEXT:
        return action.searchText;
      default:
        return state;
    }
}

