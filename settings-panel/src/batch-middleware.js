export const BATCH = '@@BATCH';

export function batchingMiddleware(store) {
    return next => function batchMiddlewareDispatch(action) {
        if (Array.isArray(action)) {
            next({type: BATCH, payload: action});
        } else {
            next(action);
        }
    };
}

export function batchReduce(reducer) {
    return function batcher(state, action) {
        return action.type === BATCH
            ? action.payload.reduce(batcher, state)
            : reducer(state, action);
    }
}
