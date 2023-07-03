import {Stream} from "node:stream";
import {ScriptOptions} from "node:vm";
import {ParserOptions} from '@babel/parser/typings/babel-parser';
import {BabylonOptions} from 'babylon';
import {createElement, Context} from 'react';

declare function engine(path: string, params: Params, ops: Ops, cb: HtmlCallback): void;
declare function engine(path: string, params: Params, cb: HtmlCallback): void;
declare function engine(path: string, cb: HtmlCallback): void;
declare function engine(path: string, params?: Params, ops?: Ops): HtmlResult;

type HtmlCallback = (err: null|Error, html: HtmlResult) => void;

declare namespace engine {
    interface ConvertOptions {
        path?: string,
        sourceMap?: boolean,
        addOnChange?: boolean,
        parserOptions?: ParserOptions,
        template?: false | JsxCode | (({BODY}) => any),
        templatePath?: string,
        templateOptions?: BabylonOptions,
    }

    interface RunOptions {
        path?: string,
        context?: object,
        scriptOptions?: ScriptOptions,
    }

    export function setOptions(options: Options): void;

    export function require(path: string, currentWorkingDir?: string): any;

    export function convert(code: JsxCode, options?: ConvertOptions): string|{code: string, map: null|object};

    export function run(code: JsxCode, options?: RunOptions): any;

    export const Context: Context<{locales: object, settings: object}>;
}

export = engine;

interface Params {
    locals?: object,
    _locals?: object,
    settings?: object,
    [prop: string]: any,
}

type JsxCode = string | Buffer;
type HtmlResult = string | Stream;

interface Options {
    DEV?: boolean,
    doctype?: string,
    renderer?: (node: ReturnType<typeof createElement>) => HtmlResult,
    replace?: (html: HtmlResult, params: object) => HtmlResult,
    templatePath?: string,
    parserOptions?: ParserOptions,
    sourceMap?: boolean,
    addOnChange?: boolean,
}

type Ops = Pick<Options, 'renderer' | 'replace' | 'doctype'>;