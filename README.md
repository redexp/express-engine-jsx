# express-engine-jsx

[![Build Status](https://travis-ci.org/redexp/express-engine-jsx.svg?branch=master)](https://travis-ci.org/redexp/express-engine-jsx)

Example of `users.jsx` view file
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

Example of `layout.jsx` view file
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

When you render some view, this engine takes `jsx` file like this
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
            users.map(user => (
              React.createElement(
                'li',
                {key: user},
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

As you can see, each jsx view file returns array of components and standard html attributes are converted to react attributes
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

```javascript
const express = require('express');
const app = express();
const engine = require('express-engine-jsx');

server.set('views', '/path/to/views');
server.set('view engine', 'jsx');
server.engine('jsx', engine);

// optionaly
engine.setOptions({
  doctype: "<!DOCTYPE html>\n", // prepended string to every output html
  templatePath: '/path/to/template.jsx', // path to base tamplete of component for all jsx templates. Default is "express-engine-jsx/template.jsx",
  replace: (html) => {return html}, // Modify final html with this callback 
  parserOptions: {}, // See https://babeljs.io/docs/en/babel-parser#options
});
```

That's it, you no need to do `app.set('views', 'views')` and so on, `attachTo` will do that for you

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

Also it has method `setOptions` which can modify [options](#options)

### options

```javascript
const options = require('express-engine-jsx/options');
```

Object with optional properties:

 * `doctype` - string which will be prepended to output html, default value is `"<!DOCTYPE html>\n"`
 * `replace` - function which will take output html (without doctype) and it should return new html
 * `templatePath` - path to wrapper of compiled jsx, default value is `express-engine-jsx/template.jsx`. Undefined variable `BODY` will be replaced with your compiled jsx code.
 * `parserOptions` - options for [babel.parser](https://babeljs.io/docs/en/babel-parser#options)

### require

```javascript
const requireJSX = require('express-engine-jsx/require');
```

This is a function which you can use as regular `require` but this one can run jsx files. It checks if path is jsx file and if it is then `requireJSX` will [convert](#convert) this file to js code and then run it.

Every compiled jsx file will be cached to `requireJSX.cache` object where key will be path to jsx file and value will be [vm.Script](https://nodejs.org/api/vm.html#vm_class_vm_script). 
You can delete any key in this cache, requireJSX will recompile jsx file on next call.

### convert

```javascript
const convert = require('express-engine-jsx/convert');
```

It is a function which can convert jsx view files to [vm.Script](https://nodejs.org/api/vm.html#vm_class_vm_script).
```js
const script = convert('/path/to/view.jsx');

const context = {
   module: {
      exports: {}
   },
   __dirname: script.dirname,
   require: requireJSX,
};

script.runInNewContext(context);

const ViewComponent = context.module.exports;
```

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

It do nothing but it's valid code. In JSX you can't do same thing with elements

```html
<div>first</div>
<div>second</div>
```

It will throw compilation error. It waiting for `;` after first element. You have three options to solve this problem.

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
