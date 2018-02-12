# rn-launch

react-native 的redux框架

## 使用方法

* 定义reducer和action
```js
import {fromJS} from 'immutable'
import {handleActions} from "rn-launch"

export function actions(store) {
    return {
        getData(name) {
            return {
                type: "UPDATE_NAME",
                name,
            }
        }
    }
}

export function reducer() {
    let initialData = fromJS({
        name: "李四",
        age: 26,
    });


    return handleActions({
        UPDATE_NAME(state, {name}) {
            return state.set("name", name);
        }
    }, initialData);
}
```

```js
import React,{Component} from 'react';
import {Router, Scene, Stack,} from 'react-native-router-flux';
import {reducer as appReducer,actions as appActions} from './reducer';
import Launch,{Connect} from "rn-launch"

import {
    View,
    Text,
    TouchableHighlight,
} from 'react-native';

@Connect((state)=>{
    return state.app.toJS();
})
class Home extends Component{
    render(){
        let {name,age,actions}=this.props;
        return <TouchableHighlight onPress={()=>{
               actions.getData("新名字")
           }}>
           <Text>{name}  {age}</Text>
       </TouchableHighlight>
    }
}

//启动ReactNative
AppRegistry.registerComponent('MyReactNativeApp', () => Launch({
    app: appReducer
}, {
    app: appActions
}, <Router>
   <Stack key="root">
       <Scene  key="home" component={Home} title="Home"/>
   </Stack>
</Router>));
```