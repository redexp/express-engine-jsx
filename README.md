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

module.exports = function (props, context) {
  var locals = context && context.locals || {};
  var __components = [];
  
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

module.exports.contextType = Context;
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
const {join} = require('path');
const app = express();

require('express-engine-jsx').attachTo(app, {
  cache: join(__dirname, 'cache'), // required and should be absolute path to cache dir for compiled js files
  views: join(__dirname, 'views'), // required and should be absolute path to views dir with jsx files
  doctype: "<!DOCTYPE html>\n"   // optional and this is default value
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
 * `callback` - Node style callback which will receive html string as second argument

Also it has method `attachTo` which takes two arguments:

 * `server` - Express instance
 * `options` - object which will be merged to [options](#options)

### options

```javascript
const options = require('express-engine-jsx/options');
```

Object which has three properties:

 * `cache` - absolute path to cache directory
 * `views` - absolute path to views directory
 * `doctype` - string which will be prepended to output html, default value is `"<!DOCTYPE html>\n"`
 * `replace` - optional function which will take output html (without doctype) and it should return new html
 * `template` - string wrapper of compiled jsx, default value is
   
   ```javascript
   const React = require('react');
   const requireJSX = require('express-engine-jsx/require');
   const Context = require('express-engine-jsx/Context');
    
   module.exports = function (props, context) {
      var locals = context && context.locals || {};
      var __components = [];
    
      with (locals) {
        with (props) {
          BODY
        }
      }
    
      return __components;
   };
    
   module.exports.contextType = Context;
   ```
   Where `BODY` will be replaced with your compiled jsx code

This options used by [require](#require)

### require

```javascript
const requireJSX = require('express-engine-jsx/require');
```

This is a function which you can use as regular `require` but this one can run jsx files. It checks if path is jsx file and if it is then `requireJSX` will [convert](#convert) this file to js file and put in [cache](#options) dir and then run it.

### convert

```javascript
const convert = require('express-engine-jsx/convert');
```

It is a function which can convert jsx view files to js files. It takes only two arguments:

 * `jsxPath` - path to jsx file
 * `jsPath` - path where js file should be saved
 
## How to update cache

Best way is to watch jsx files with you favorite tool like gulp or grunt and use [convert](#convert) to update cached files.

## How to integrate to other engine

For example how to integrate to [ejs](https://www.npmjs.com/package/ejs)

```javascript
const express = require('express');
const app = express();
const options = require('express-engine-jsx/options');
const requireJSX = require('express-engine-jsx/require');
const pt = require('path');

options.cache = __dirname + '/cache';
options.views = __dirname + '/views';

app.locals.component = function (path, props) {
  var currentEjsFile = this.filename;
  var currentDirectory = pt.dirname(currentEjsFile);
  var Component = requireJSX(currentDirectory + '/' + path);

  props = Object.assign({}, this, props || {});

  return ReactDOM.renderToStaticMarkup(Component(props));
};
```

Now we can use `component()` in ejs files like this

```ejs
<div><%- component('button', {title: 'Submit'}) %></div>
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
<div>second</div>
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
