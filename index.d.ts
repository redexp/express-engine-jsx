declare function engine(path: string, params: object, cb: (err: null|Error, html: string) => void): void;
declare function engine(path: string, params: object): string;

declare namespace engine {
    interface Options {
        doctype?: string;
        replace?: (html: string) => string;
        templatePath?: string;
        parserOptions?: object;
    }

    export function setOptions(params: Options);
}

export = engine;