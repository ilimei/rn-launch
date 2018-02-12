import {combineReducers, createStore, applyMiddleware} from 'redux'
import {connect, Provider} from 'react-redux'
import middleware from "./middleware"
import React from "react";

let actionsProp = {
    actions: {}
};

function makeReducer(reducers, actions) {
    let _reducers = {};
    Object.keys(reducers).forEach(key => {
        _reducers[key] = reducers[key]();
    });
    let reducer = combineReducers(_reducers);
    return reducer;
}

/**
 * 将actions暴露给全局对象
 * @param store
 * @param actions
 */
function makeActions(store, actions) {
    actionsProp.actions = {};
    Object.keys(actions).forEach(key => {
        const _action = actions[key](store);
        Object.keys(_action).forEach(method => {
            if (actionsProp.actions[method]) {
                throw new Error(`has duplicate ${method} in ${key} action method!`);
            }
            actionsProp.actions[method] = (...args) => store.dispatch(_action[method].apply(undefined, args));
        });
    });
    global.actions = actionsProp.actions;
}

/***
 * 更新store
 * @param reducers
 * @param actions
 */
export function updateRedux(reducers, actions) {
    let reducer = makeReducer(reducers);
    makeActions(global.store, actions);
    global.store.replaceReducer(reducer);
    global.store.dispatch({type: 'INITIAL_STATE_ACTION'});
}

/**
 * redux初始化 并返回组件
 * @param reducers
 * @param actions
 * @param Router 路由组件
 * @returns {function(): *}
 */
export default function launch(reducers, actions, Router, reduxPlugin = middleware) {
    let reducer = makeReducer(reducers);
    global.store = createStore(reducer, reduxPlugin);
    makeActions(global.store, actions);
    return () => <Provider store={store}><Router/></Provider>;
}

function defaultMapActionsToProps() {
    return actionsProp;
}

/**
 * Connect注解 用于绑定组件
 * @param mapStateToProps
 * @returns {Function}
 * @constructor
 */
export function Connect(mapStateToProps = () => ({})) {
    return function (target) {
        return connect(mapStateToProps, defaultMapActionsToProps)(target);
    }
}

export function handleActions(reducer, initialData) {
    return (state, action) => {
        if (!state) {
            state = initialData;
        }
        if (action.type == 'INITIAL_STATE_ACTION') {
            return initialData;
        }
        let func = reducer[action.type];
        if (func) {
            return func(state, action);
        }
        return state;
    }
}