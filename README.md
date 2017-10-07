# For FRC Team 1540 The Flaming Chickens (http://www.team1540.org) scouting
## Start Here:
In terminal:
`npm install scouting --save`
Then in your .js file:
```javascript
  var scout = require('scouting');
  scout.init('stand'); // 'stand' for stand scouting, 'pit' for pit scouting, 'database' for database
```
Then put this in the `<head>`:
```html
  <link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.css">
  <link rel="stylesheet" href="node_modules/noty/lib/noty.css">
```
And this at the end of the `<body>` before your .js file:
```html
  <script>
    window.jQuery = window.$ = require('jquery');
    var Popper = require('popper.js');
  </script>
  <script src="node_modules/bootstrap/dist/js/bootstrap.js"></script>
  <script src="node_modules/noty/lib/noty.js"></script>
```

## Question Types:
### Checkboxes:
```javascript
  scout.checkbox(
    '.place-to-put',
    'Title',
    [
      // Name, OPTIONAL: bootstrap color class, OPTIONAL: value
      ['Option 1', 'success', 'true'],
      ['Option 2']
    ],
    'jsonkey'
  );
```
### Counter:
```javascript
  scout.counter(
    '.place-to-put',
    'Title',
    // Increment
    1,
    'jsonkey'
  );
```
### Input:
```javascript
  scout.input(
    '.place-to-put',
    'Title',
    'Placeholder'
    'jsonkey'
  );
```
### Multiple Choice:
```javascript
  scout.multipleChoice(
    '.place-to-put',
    'Title',
    [
      // Name, bootstrap color class, OPTIONAL: value
      ['Option 1', 'success', 'true'],
      ['Option 2', 'danger']
    ],
    'jsonkey'
  );
```
### Noty:
Simplified from [Noty](https://www.npmjs.com/package/noty)
```javascript
  scout.noty(
    // Takes one argument, see Noty documentation (https://ned.im/noty/).
  );
```
#### Note:
To make [Noty](https://www.npmjs.com/package/noty) work, put this in the `<head>`:
```html
  <link rel="stylesheet" href="node_modules/noty/libs/noty.css">
```
And also put this before your `.js` file:
```html
  <script src="node_modules/noty/lib/noty.js"></script>
```
### Pie:
Simplified from [Chart.js](https://www.npmjs.com/package/chartjs)
```javascript
  scout.pie(
    '.place-to-put',
    'Title',
    // Slices
    [25, 50, 25],
    // Color
    ['red', '#000', 'purple']
  );
```
### Slider:
Simplified from [noUiSlider](https://www.npmjs.com/package/nouislider)
```javascript
  scout.slider(
    '.place-to-put',
    'Title',
    // Starting places
    [25, 50, 75],
    // Color
    ['red', '#000', 'purple', 'green'],
    'jsonkey'
  );
```
### Textarea:
```javascript
  scout.textarea(
    '.place-to-put',
    'Title',
    'Placeholder'
    'jsonkey'
  );
```

## Other Useful Functions:
### Done:
```javascript
  scout.done(
    '.place-to-put',
    false // Optional: false does not replaces next button, default true
  );
```
### Login:
```javascript
  scout.login(
    '.place-to-put'
  );
```
### New Page:
```javascript
  scout.page(
    'Title',
    // NAMING CONVENTION: .cell-title-1 <-- 1 is the leftmost cell, array.length is the rightmost cell
    [6, 6] // Uses the Bootstrap grid system. Numbers must add up to twelve.
  );
```

## Database:
### Database:
```javascript
  scout.database('2017orgg'); // argument is the TBA event key. Visit thebluealliance.com to check an event's event key.
  // Make sure there is a good internet connection the first time scout.database() is executed!
```

## Changelog
### 2.0.2 (2017-10)
* Added: Change team number.
* Fixed: Done button.

### 2.0.1 (2017-10-04)
* Added: Match number verification.
* Fixed: Readme.
* Fixed: First page not showing up.
* Fixed: Match info bar not displaying correctly.

### 2.0.0 (2017-10-02)
* Added: Database with `scout.database();`.
* Added: Database option on `scout.init('database');`
* Added: Autosave support for pit apps.
* Added: Team input for pit apps.

### 1.2.2 (2017-09-05)
* Added: Change scout id by clicking on the scout name in the infobar.
* Fixed: Autosave progress if app crash.
* Fixed: Change match number button not showing.
* Fixed: Team number did not reflect match number change when using input to change match number.

### 1.2.1 (2017-08-29)
* Added: [Noty](https://www.npmjs.com/package/noty) as a dependency for notifications.
* Added: `scout.noty();` so no need to `npm install noty`.
* Fixed: First page not showing.
* Removed: [Dialogs](https://www.npmjs.com/package/dialogs).
* Removed: `scout.dialogs();`.
* Removed: `scout.save();`. Use `scout.done();` instead.

### 1.2.0 (2017-08-27)
* Added: Short answer (input).
* Added: Dialogs (from [Dialogs](https://www.npmjs.com/package/dialogs), so no need to separately `npm install`).
* Added: Scout number in the infobar after login.
* Added: Done button to quit scouting app.
* Added: Autosave as questions are filled in.
* Deprecated: Save button.
* Fixed: Make sure that `scout.init(/* 'stand' or 'pit' */);` is instantiated first.
* Fixed: Make sure that `scout.init(/* 'stand' or 'pit' */);` is not instantiated multiple times.

### 1.1.1 (2017-08-25)
* Security: Readme links

### 1.1.0 (2017-08-25)
* Added: Pit scout functionality. Use `scout.init('stand')` for stand scouting and `scout.init('pit')` for pit scouting.
* Changed: Save button can replace next button with `false` parameter passed.
* Changed: `scout.page('Name', [12]);` uses the [Bootstrap](https://www.npmjs.com/package/bootstrap) grid system, second parameter is an array that indicates how many size of cell (one row is 12 cells).
* Fixed: Now need to login to go to next page if `scout.login('.place-to-put')` is used.
* Fixed: Removed back button from the first page and the next button from the last page.

### 1.0.1 (2017-08-10)
* Added: Readme.

### 1.0.0 (2017-08-10)
* Published Package.

## Unreleased
### 3.0.0
* Added: Analysis software.

## Created by Tristan (theamazingness)
## Maintained by the Non-Robot Software Department of [Team 1540 The Flaming Chickens](http://www.team1540.org)
