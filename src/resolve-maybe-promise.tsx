import * as React from "react"
import { AsyncOptions, Options } from './form';
import { FormFieldSchema } from '../index';

type PossibleOptions = FormFieldSchema['options']

export class ResolveMaybePromise extends React.PureComponent<{maybePromise:PossibleOptions,children:(maybepromise:Options)=>React.ReactElement<any>}>{
    state={
        maybePromise:null as Options
    };
    loadOptions(rawOptions:PossibleOptions){
        if(typeof rawOptions=== 'function'){
            if(!rawOptions.length)
                (rawOptions as AsyncOptions)().then(maybePromise=>!this.unmounted && this.setState({
                    maybePromise
                }))

        }else if (rawOptions instanceof Array)
            this.setState({
                maybePromise:rawOptions
            })
    }
    componentDidUpdate(this:ResolveMaybePromise,prevProps:typeof this['props']){
        if(prevProps.maybePromise!==this.props.maybePromise)
            this.loadOptions(this.props.maybePromise);
    }
    unmounted=false;
    componentWillUnmount(){
        this.unmounted=true
    }
    componentDidMount(){
        this.loadOptions(this.props.maybePromise);
    }
    render(){
        return this.props.children(this.state.maybePromise)
    }
}