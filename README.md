express-engine-jsx
------------------
Full-featured template engine for express

[![Build Status](https://travis-ci.com/redexp/express-engine-jsx.svg?branch=master)](https://travis-ci.com/redexp/express-engine-jsx)

Example of `users.jsx` template file
```jsx harmony
const Layout = require('./layout');

<Layout>
  <ul class="users">
    {users.map(user => (
      <li key={user}>{user.name}</li>
    ))}
  </ul>
</Layout>
```

Example of `layout.jsx` template file
```jsx harmony
<html lang={lang}>
<head>
  <meta charset="UTF-8"/>
</head>
<body>{children}</body>
</html>
```

Example of router
```javascript
app.get('/users', function (req, res) {
  res.locals.lang = 'en';
  res.render('users', {
    users: [
      {name: 'Max'},
      {name: 'Bob'}
    ]
  });
});
```

Output html
```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body><ul class="users"><li>Max</li><li>Bob</li></ul></body>
</html>
```

## How it works

When you render some template, this engine takes `jsx` file like this
```jsx harmony
const Layout = require('./layout');

<Layout>
  <ul class="users">
    {users.map((user, i) => (
      <li key={i}>{user.name}</li>
    ))}
  </ul>
</Layout>
```

and compiles it to `js` file like this
```javascript
const React = require('react');
const requireJSX = require('express-engine-jsx/require');
const Context = require('express-engine-jsx/Context');

module.exports = function (props) {
  const __components = [];
  const context = React.useContext(EngineContext);
  const locals = context.locals || {};
 
  with (locals) {
    with (props) {
      const Layout = requireJSX('./layout');

      __components.push(
        React.createElement(
          Layout, 
          null,
          React.createElement(
            'ul',
            {className: 'users'},
            users.map((user, i) => (
              React.createElement(
                'li',
                {key: i},
                user.name
              )
            ))
          )
        )
      );
    }
  }
  
  return __components;
};
```

and now this component can be rendered to html with `ReactDOM.renderToStaticMarkup()`.

As you can see, each jsx template file returns array of components and standard html attributes are converted to react attributes
```html
<div class="first" tabindex="1"></div>
<div class="second" tabindex="2"></div>
```

```javascript
//...
__components.push(React.createElement('div', {className: 'first', tabIndex: '1'}));
__components.push(React.createElement('div', {className: 'second', tabIndex: '2'}));
//...

return __components;
```

## Usage

```
npm i express-engine-jsx react react-dom
```

`react` and `react-dom` are peer dependencies in this package

```javascript
const express = require('express');
const app = express();
const engine = require('express-engine-jsx');

server.set('views', '/path/to/views');
server.set('view engine', 'jsx');
server.engine('jsx', engine);

// optionaly
engine.setOptions({
  // See options section
});
```

## API

### engine

```javascript
const engine = require('express-engine-jsx');
```

It's a function which takes three arguments:

 * `path` - path to jsx file
 * `locals` - object with properties which will be local variables in jsx file
 * `callback` - optional Node style callback which will receive html string as second argument

If you pass to `engine` only path and locals then it will return html.
```js
engine('/path/to/view', {prop: 'value'}, (err, html) => console.log(html));

const html = engine('/path/to/view', {prop: 'value'});
```

Also, it has method `engine.setOptions(options)` which can modify [options](#options)

### options

```javascript
const options = require('express-engine-jsx/options');
```

Object with optional properties:

 * `DEV` - boolean, default `process.env.NODE_ENV !== 'production'`
 * `sourceMap` - boolean, default `process.env.NODE_ENV !== 'production'`
 * `doctype` - string which will be prepended to output html, default value is `"<!DOCTYPE html>\n"`
 * `replace` - function which will take output html (without doctype), and it should return new html
 * `addOnChange` - boolean, default `true`. Will add `onChnage={() => false}` to every `<input>` with `value` or `checked` attribute. Used to omit ReactDOM warning about `value` prop without `onChange` handler.
 * `templatePath` - path to wrapper of compiled jsx, default value is `express-engine-jsx/template.jsx`. Undefined variable `BODY` will be replaced with your compiled jsx code.
 * `parserOptions` - options for [babel.parser](https://babeljs.io/docs/en/babel-parser#options)
 * `templateOptions` - options for [babel.template](https://babeljs.io/docs/en/babel-template#options)

### require

```javascript
const requireJSX = engine.require || require('express-engine-jsx/require');
```

This is a function which you can use as regular `require` but this one can run jsx files. It checks if path is jsx file and if it is then `requireJSX` will [convert](#convert) this file to js code and then run it.

It also can take optional second parameter - `currentWorkingDir` which should be an absolute path to file directory which calls `require` in case when you call `require` from some unusual place like debugger console.

Every compiled jsx file will be cached to `requireJSX.cache` object where key will be path to jsx file without extension and value will be object `{moduleExports: ReactComponent|any, map: object|null}`. 
You can delete any key in this cache, `requireJSX` will recompile jsx file on next call.

### convert

```javascript
const convert = engine.convert || require('express-engine-jsx/convert');
```

It is a function which can convert jsx template code to js code.

Arguments:

 * `code` - string of jsx code
 * `options`
   * `path` - string, path to jsx file. Needed only for source map.
   * `sourceMap` - boolean, default [options.sourceMap](#options). Generate source map
   * `addOnChange` - boolean, default [options.addOnChange](#options)
   * `parserOptions` - object, default [options.parserOptions](#options)
   * `template` - string of jsx code wrapper. You can pass `false` if you don't want to wrap your code with `template`
   * `templatePath` - string, default [options.templatePath](#options)
   * `templateOptions` - object, default [options.templateOptions](#options)
    
If you pass `sourceMap: true` or your `process.env.NODE_ENV !== 'production'` then `convert` will return object `{code: string, map: object}` instead of js code string.

It also has `convert.cache` object for compiled templates where keys are `templatePath` and values are functions created by [babel.template](https://babeljs.io/docs/en/babel-template)

## run

```javascript
const run = engine.run || require('express-engine-jsx/run');
```

Function which can execute js code with independent context and returns result of `module.exports` inside js code.

Arguments:

 * `code` - string of js code
 * `options`
   * `path` - string, path to file, usually path to jsx file
   * `context` - object which properties will be global variables inside js code
   * `scriptOptions` - object options for [vm.Script](https://nodejs.org/api/vm.html#vm_class_vm_script)
    
## Context

```javascript
const Context = engine.Context || require('express-engine-jsx/Context');
```

React context which used to bypass locals to components

## attr-map

```javascript
const attrMap = require('express-engine-jsx/attr-map');
```

This is an object where keys are names of html attributes in lower case like `class` and values are valid React html attributes like `className`. 
You can modify this object if I forget about some attributes.
 
## How to integrate to other engine

For example how to integrate to [ejs](https://www.npmjs.com/package/ejs)

```javascript
const express = require('express');
const app = express();
const engine = require('express-engine-jsx');
const {dirname, resolve} = require('path');

app.locals.component = function (path, props = {}) {
  props = Object.assign({}, this, props);

  return engine(resolve(dirname(this.filename), path), props);
};
```

Now we can use `component()` in ejs files like this

```ejs
<div><%- component('path/to/jsx-view', {prop: 'value'}) %></div>
```

## Problem with more than one component in template root

In javascript you can omit `;` and write like this

```javascript
"first"
"second"
```

It does nothing, but it's valid code. In JSX you can't do same thing with elements

```html
<div>first</div>
<div>second</div>
```

It will throw compilation error. It's waiting for `;` after first element. You have three options to solve this problem.

First - use `;`

```jsx harmony
<div>first</div>;
<div>second</div>;
```

Second - use `<Fragment>`

```jsx harmony
<Fragment>
    <div>first</div>
    <div>second</div>
</Fragment>
```

Third - use short Fragment notation `<>...</>`

```jsx harmony
<>
    <div>first</div>
    <div>second</div>
</>
```

## License

MIT, see `LICENSE` file
