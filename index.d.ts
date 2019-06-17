declare function engine(path: string, params: object, cb: (err: null|Error, res: string) => void): void;

declare namespace engine {
    interface ExpressApp {
        engine: (ext: string, fn: Function) => this;
        set: (key: string, value: any) => this;
    }

    interface Options {
        cache: string;
        view: string;
        doctype?: string;
        replace?: (html: string) => string;
    }

    export function attachTo(app: ExpressApp, params: Options);
    export function setOptions(params: Options);
}

export = engine;