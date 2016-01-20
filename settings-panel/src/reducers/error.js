import { SET_ERROR } from '../action-types';


export default function (state = null, action) {
    switch (action.type) {
      case SET_ERROR:
        return action.message;
      default:
        return state;
    }
}

