import { combineReducers } from 'redux';
import {
    CLEAR_COPY_MESSAGE,
    SET_COPY_DIRECTION,
    SET_COPY_ERROR,
    SET_COPY_HOST,
    SET_COPY_MESSAGE,
    SET_CURRENT_REDIS_CONNECTION,
    SHOW_COPY_MODAL,
} from '../action-types';


function show(state = false, action) {
    switch (action.type) {
      case SHOW_COPY_MODAL:
        return action.show;
      default: 
        return state;
    }
}

function host(state = '', action) {
    switch (action.type) {
      case SHOW_COPY_MODAL:
        return '';
      case SET_COPY_HOST:
        return action.host;
      default:
        return state;
    }
}

function copyFrom(state = null, action) {
    switch (action.type) {
      case SHOW_COPY_MODAL:
        return null;
      case SET_COPY_DIRECTION:
        return !!action.copyFrom;
      default:
        return state;
    }
}

function message(state = null, action) {
    switch (action.type) {
      case SHOW_COPY_MODAL:
        return '';
      case SET_COPY_MESSAGE:
        return action.message;
      case CLEAR_COPY_MESSAGE:
        return null;
      default:
        return state;
    }
}

function error(state = null, action) {
    switch (action.type) {
      case SHOW_COPY_MODAL:
        return '';
      case SET_COPY_ERROR:
        return action.error;
      case CLEAR_COPY_MESSAGE:
        return null;
      default:
        return state;
    }
}

function currentRedisConnection(state = null, action) {
    switch (action.type) {
      case SET_CURRENT_REDIS_CONNECTION:
        return action.currentRedisConnection;
      default:
        return state;
    }
}

export default combineReducers({
    show,
    host,
    copyFrom,
    message,
    error,
    currentRedisConnection
});


