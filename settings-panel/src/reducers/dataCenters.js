import {
    SET_SETTINGS
} from '../action-types';


const defaultState = [];
export default function (state = defaultState, action) {
    switch (action.type) {
      case SET_SETTINGS:
        return action.data.availableDataCenters;
      default: 
        return state;
    }
}


