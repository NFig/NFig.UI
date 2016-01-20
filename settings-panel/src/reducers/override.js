import {
    SET_EDITING,
    CANCEL_NEW_OVERRIDE,
    SET_NEW_OVERRIDE_DATACENTER,
    SET_NEW_OVERRIDE_VALUE,
    SHOW_OVERRIDE_DETAILS
} from '../action-types';

import omit from 'lodash/omit';

export default function (state = {}, action) {
    switch (action.type) {

      case SET_EDITING:
        return (action.setting === null) ? {} : state;

      case CANCEL_NEW_OVERRIDE:
        return omit(state, 'dataCenter', 'overrideValue');

      case SET_NEW_OVERRIDE_DATACENTER:
        return {...state, dataCenter: action.dataCenter};

      case SET_NEW_OVERRIDE_VALUE:
        return {...state, overrideValue: action.value};

      case SHOW_OVERRIDE_DETAILS:
        return {...state, showDetails: action.show};

      default:
        return state;
    }
}

