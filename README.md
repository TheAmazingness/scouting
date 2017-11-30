# For FRC Team 1540 The Flaming Chickens (http://www.team1540.org) scouting
## Start Here:
The first thing is to get [Electron](https://electron.atom.io/) set up and an html document.

In terminal: `npm install scouting --save`

Then in your .js file:
```javascript
  var scout = require('scouting');
  scout.init();
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
      ['Option 1', 'success', true],
      ['Option 2']
    ],
    'jsonkey'
  );
```
Checkboxes that default to `btn-outline-info` but color can be changed to the different Bootstrap color classes. Optional value at index 1 and 2. Index 1 is the Bootstrap color class, and index 2 is the optional value. If no value is provided, the value will default to the option name.
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
A counter that has buttons to increment up and down. The up and down values can be customized and floats are not supported.
### Input:
```javascript
  scout.input(
    '.place-to-put',
    'Title',
    'Placeholder'
    'jsonkey'
  );
```
An HTML `<input>` that saves automatically.
### Multiple Choice:
```javascript
  scout.multipleChoice(
    '.place-to-put',
    'Title',
    [
      ['Option 1', 'success', true],
      ['Option 2', 'danger']
    ],
    'jsonkey'
  );
```
A multiple choice question that is customizable with as many choices as possible. Choice name and Bootstrap color classes are required, but value is optional. If no value is provided, then the value will be the choice name.
### Noty:
Taken from [Noty](https://www.npmjs.com/package/noty)
```javascript
  scout.noty();
```
Returns a Noty object. `.show()` will display the Noty, as shown in the Noty docs. See Noty documentation (https://ned.im/noty/).
##### Note:
To make [Noty](https://www.npmjs.com/package/noty) work, put this in the `<head>`:
```html
  <link rel="stylesheet" href="node_modules/noty/libs/noty.css">
```
And also put this before your `.js` file:
```html
  <script src="node_modules/noty/lib/noty.js"></script>
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
A slider simplified from noUiSlider.
### Textarea:
```javascript
  scout.textarea(
    '.place-to-put',
    'Title',
    'Placeholder'
    'jsonkey'
  );
```
An HTML `<textarea>` that saves automatically as you type.

## Other Useful Functions:
### Chart.js:
Taken from [Chart.js](https://npmjs.com/package/chart.js)
```javascript
  scout.chart(
    ctx,
    {...}
  );
```
Returns a chart.js object. `ctx` is the `<canvas>` element where the chart will go. See the chart.js docs for more information on making charts (http://www.chartjs.org/docs/latest/).
### Done:
```javascript
  scout.done(
    '.place-to-put',
    false
  );
```
A done button that saves the file and refreshes the app. The second argument is optional and defaults to `true`. If true, then the done button will replace the next button, and if false, then the done button will float.
### Login:
```javascript
  scout.login(
    '.place-to-put',
    1540 // Code to access the change role page. Only numbers.
  );
```
A login prompt that removes the back/next buttons and shows them when logged in. Make sure there is a `scouts.json` file present in the scouting directory (`../scouting/`) that contains key value pairs for members to login. The key should be an integer, and the value should be the name to display once logged in. `scout.login()` still needs to go inside a `scout.page()`; it does not automatically generate a page.
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
A pie chart simplified from Chart.js.
### New Page:
```javascript
  scout.page(
    'Title',
    [6, 6]
  );
```
Creates a new page with back/next buttons. Does not have a back button if it is the first page, and likewise does not have a next button if it is the next page. Also does not have a next button if a done button replaces it.
NAMING CONVENTION: .cell-title-1 <-- 1 is the leftmost cell, array.length is the rightmost cell
Uses the Bootstrap grid system. Numbers must add up to twelve.
### Text:
```javascript
  scout.text(
  	'.place-to-put',
  	'Text',
  	'Font size'
  );
```

## Database:
### Database:
```javascript
  scout.database('2017orgg');
```
Argument is the TBA event key. Visit thebluealliance.com to check an event's event key.
Make sure there is a good internet connection the first time `scout.database()` is executed!

## Changelog

### 2.0.4 (2017-11-29)
* Fixed: Readme.

### 2.0.3 (2017-11-29)
* Added: Pie chart added optional labels.
* Added: `scout.chart();` to create custom [Chart.js](https://www.npmjs.com/package/chart.js) charts.
* Added: Text with `scout.text();`.
* Fixed: Change role with custom code.
* Fixed: Match info bar takes up less space.
* Fixed: Charts.
* Fixed: Checkbox saving wrong values to json file.

### 2.0.2 (2017-10-07)
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
### 2.1.0
* Added: Button that pulls from github and reinstalls package using `scout.update()`;
* Added: Save to flashdrive with `scout.flashdrive()`;
* Added: `scout.grid();` for a grid question.
### Save to Flashdrive
```javascript
  scout.flashdrive();
```
### Update
```javascript
  scout.update();
```
### Grid:
```javascript
  scout.grid(
    '.place-to-put',
    'Title',
    ['column 1', 'column 2', 'etc'],
    ['option 1', 'option 2', 'etc']
  );
```
A simple grid input system for questions with the same options. The buttons will display the options. Make sure that the column titles are not the same as each other or any other json keys because the title of each column is the json key for that column.
### 3.0.0
* Added: Analysis software.

## Created by Tristan (theamazingness)
## Maintained by the Non-Robot Software Department of [Team 1540 The Flaming Chickens](http://www.team1540.org)
