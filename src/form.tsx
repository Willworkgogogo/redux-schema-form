/**
 * Created by YS on 2016/10/31.
 */
import * as React from 'react'
import {reduxForm, ConfigProps, InjectedFormProps} from 'redux-form'
import {SchemaNode} from "./schema-node";
import {WidgetProps} from "./field";

export type SupportedFieldType = "text"|"password"|"file"|"select"|"date"|'datetime'|"checkbox"|"textarea"|"group"|"color"|"number"|"array"|string;

export type Options = {name:string,value:string|number}[]
export type AsyncOptions = ()=>Promise<Options>
export type RuntimeAsyncOptions = (value:any, props?:WidgetProps)=>(Promise<Options>|Options)

export interface BaseSchema extends Partial<ConfigProps<any,any>>{
    key:string,
    type: SupportedFieldType,
    label:string,
    hide?:boolean,
    placeholder?:string,
    required?:boolean,
    disabled?:boolean,
    multiple?:boolean,
    children?:BaseSchema[]
    options?:Options | AsyncOptions | RuntimeAsyncOptions,
    normalize?:(value,previousValue?, allValues?)=>any,
    /**
     * 返回url
     * @param file 要上传的文件
     */
    onFileChange?:(file:File)=>Promise<string>,
    data?:any,

    /**
     * @deprecated
     * 使用onValueChange代替.
     */
    getChildren?:(any:any)=>FormFieldSchema[]
    [rest:string]:any
}

export type ChangeOfSchema = (Partial<ParsedFormFieldSchema>&{key:string})[];

export interface FormFieldSchema extends BaseSchema{
    /**
     * 当字段值发生改变时如何影响整个表单
     * @param newValue
     * @param previousValue
     * @param valuesPath 当这个字段属于嵌套字段时，除了第三个参数是整个表单的值之外，还会有第四个、第五个等等参数，形成的路径指向字段所在位置，例如：key='nest.1.a'，表单的值是{nest:[{a:1},{a:2}]}，则onValueChange的第四个参数为[{a:1},{a:2}]，第五个参数为{a:1}
     */
    onValueChange?: (newValue:any,previousValue?:any,...valuesPath:any[])=>ChangeOfSchema|Promise<ChangeOfSchema>
    options?:Options | AsyncOptions | RuntimeAsyncOptions,
    children?:FormFieldSchema[],
    getChildren?:((childValue:any)=>FormFieldSchema[])
}

export interface ParsedFormFieldSchema extends BaseSchema{
    options?:Options | RuntimeAsyncOptions,
}

let DefaultButton = (props)=>{
    return <button type={props.type} className={"btn btn-primary"+(props.disabled?" disabled":"")} disabled={props.disabled} onClick={props.onClick}>
        {props.children}
    </button>
};

export function setButton(button: React.StatelessComponent<ButtonProps>){
    DefaultButton = button;
}

export type ButtonProps = {
    disabled:boolean,
    type:"submit"|"button",
    onClick?:any,
    children:any
}

@(reduxForm({
    form:"default"
}) as any)
export class ReduxSchemaForm extends React.PureComponent<Partial<ConfigProps&InjectedFormProps<any,any>>&{
    schema:FormFieldSchema[],
    dispatch?:(...args:any[])=>any,
    noButton?:boolean,
    disableResubmit?:boolean
},{}>{
    submitable(){
        return this.props.valid && !this.props.pristine && !this.props.submitting && !(this.props.disableResubmit && this.props.submitSucceeded);
    }
    render(){
        return <form className="redux-schema-form form-horizontal" onSubmit={this.props.handleSubmit}>
            <SchemaNode schema={this.props.schema} form={this.props.form} initialValues={this.props.initialValues}/>
            {this.props.children?<div className="children">
                {this.props.children}
            </div>:null}
            {
                (!this.props.noButton)? <div className="button">
                    <div className="btn-group">
                        <DefaultButton type="submit" disabled={!this.submitable.apply(this)}>提交</DefaultButton>
                        <DefaultButton type="button" disabled={!this.submitable.apply(this)} onClick={this.props.reset}>重置</DefaultButton>
                    </div>
                </div> : <div />
            }
        </form>
    }
}