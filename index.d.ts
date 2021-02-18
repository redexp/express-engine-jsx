declare function engine(path: string, params: object, cb: (err: null|Error, html: string) => void): void;
declare function engine(path: string, params: object): string;

declare namespace engine {
    interface Options {
        doctype?: string,
        replace?: (html: string) => string,
        templatePath?: string,
        parserOptions?: import('@babel/parser/typings/babel-parser').ParserOptions,
        addOnChange?: boolean,
    }

    interface ConvertOptions {
        addOnChange?: boolean,
        parserOptions?: import('@babel/parser/typings/babel-parser').ParserOptions,
        template?: false | string | Buffer | (({BODY}) => any),
        templatePath?: string,
        templateOptions?: import('babylon').BabylonOptions,
    }

    interface RunOptions {
        path?: string,
        context?: object,
        scriptOptions?: import('node:vm').ScriptOptions,
    }

    export function setOptions(options: Options): void;

    export function require(path: string, currentWorkingDir?: string): any;

    export function convert(code: string|Buffer, options?: ConvertOptions): any;

    export function run(code: string|Buffer, options?: RunOptions): any;

    export const Context: import('react').Context<{ locales: object, settings: object }>;
}

export = engine;