import {applyMiddleware} from 'redux'
import Rx, {Subject} from "rxjs"

/**
 * Logs all actions and states after they are dispatched.
 */
const logger = store => next => action => {
    console.group(action.type)
    console.info('dispatching', action)
    let result = next(action)
    console.groupEnd(action.type)
    return result
}

/**
 * Sends crash reports as state is updated and listeners are notified.
 */
const crashReporter = store => next => action => {
    try {
        return next(action)
    } catch (err) {
        console.error('Caught an exception!', err)
        Raven.captureException(err, {
            extra: {
                action,
                state: store.getState()
            }
        })
        throw err
    }
}

/**
 * Lets you dispatch special actions with a { promise } field.
 *
 * This middleware will turn them into a single action at the beginning,
 * and a single success (or failure) action when the `promise` resolves.
 *
 * For convenience, `dispatch` will return the promise so the caller can wait.
 */
const readyStatePromise = store => next => action => {
    if (!action.promise) {
        return next(action)
    }

    function makeAction(ready, data) {
        let newAction = Object.assign({}, action, {ready}, data)
        delete newAction.promise
        return newAction
    }

    next(makeAction(false))
    return action.promise.then(
        result => next(makeAction(true, {result})),
        error => next(makeAction(true, {error}))
    )
}


// function mkEpic($action, store) {
//     return $action.filter(action => {
//         return action.type === "PING";
//     }).delay(2000).map(action => {
//         return {
//             type: "PONG",
//             playload: action
//         }
//     });
// }
//
// let $s = new Subject();
// const createRxMiddle = store => next => action => {
//     $s = mkEpic($s, store).observeOn(Rx.Scheduler.async);
//     $s.subscribe(action => store.dispatch(action));
//     $s.next(action);
//     return next(action);
// }

export default applyMiddleware(readyStatePromise, crashReporter)