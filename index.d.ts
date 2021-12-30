declare function engine(path: string, params: object, cb: HtmlCallback): void;
declare function engine(path: string, cb: HtmlCallback): void;
declare function engine(path: string, params?: object): string;

type HtmlCallback = (err: null|Error, html: string) => void;

declare namespace engine {
    interface Options {
        DEV?: boolean,
        doctype?: string,
        replace?: (html: string) => string,
        templatePath?: string,
        parserOptions?: import('@babel/parser/typings/babel-parser').ParserOptions,
        sourceMap?: boolean,
        addOnChange?: boolean,
    }

    interface ConvertOptions {
        path?: string,
        sourceMap?: boolean,
        addOnChange?: boolean,
        parserOptions?: import('@babel/parser/typings/babel-parser').ParserOptions,
        template?: false | string | Buffer | (({BODY}) => any),
        templatePath?: string,
        templateOptions?: import('babylon').BabylonOptions,
    }

    interface RunOptions {
        path?: string,
        context?: object,
        scriptOptions?: import('vm').ScriptOptions,
    }

    export function setOptions(options: Options): void;

    export function require(path: string, currentWorkingDir?: string): any;

    export function convert(code: string|Buffer, options?: ConvertOptions): string|{code: string, map: null|object};

    export function run(code: string|Buffer, options?: RunOptions): any;

    export const Context: import('react').Context<{ locales: object, settings: object }>;
}

export = engine;