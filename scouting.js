var $ = require('jquery');
var chartjs = require('chartjs');
var noUiSlider = require('nouislider');
var fs = require('fs-extra');
var Noty = require('noty');
// *****************************************************************************
var count = 0;
var json = {};
var cArr = [];
var scouts;
var pages = [];
var match;
var role;
var roleName;
var roleColor;
var rolePos;
var team;
var schedule;
var init = false;
var initCount = 0;
// *****************************************************************************
// Question Types:
exports.checkbox = function (a, b, c, d) {
  if (init) {
    count++;
    $(a).append(
      `<div class="checkbox c-` + count + `" style="text-align: center;">
        <h3>` + b + `</h3>
        <div class="btn-group bg-` + count + `" data-toggle="buttons"></div>
        <br>
        <br>
      </div>`
    );
    for (i = 0; i < c.length; i++) {
      var val = c[i][2] != undefined ? 'value="' + c[i][2] + '"' : '';
      var style = c[i][1] != undefined ? c[i][1] : 'info';
      $('.bg-' + count).append('<span class="btn btn-' + count + '-' + (i + 1) +  ' scout-c btn-outline-' + style + '" data-key="' + d + '"><input type="checkbox" ' + val + ' autocomplete="off">' + c[i][0] + '</span>');
    }
  } else {
    throw new Error('scout.init() not instantiated');
  }
};
exports.counter = function (a, b, c, d) {
  if (init) {
    count++;
    $(a).append(
      `<div class="counter co-` + count + `" style="text-align: center;">
        <h3>` + b + `</h3>
        <input class="counter-input ` + d + `-co" value="0" style="border: none; text-align: center; font-weight: bold; font-size: 24pt;" readonly="readonly">
        <br>
        <br>
        <div>
        <button type="button" class="btn btn-outline-success btn-lg btn-increment btn-` + d + `-up scout-co" style="margin-right: 5px;" data-key="` + d + `">+` + c + `</button>
        <button type="button" class="btn btn-outline-danger btn-lg btn-increment btn-` + d + `-down scout-co" style="margin-right: 5px;" data-key="` + d + `">-` + c + `</button>
        <br>
        <br>
      </div>`
    );
    $('.btn-' + d + '-up').click(function () {
      var val = parseInt($('.' + d + '-co').val());
      $('.' + d + '-co').val(val + parseInt(c));
    });
    $('.btn-' + d + '-down').click(function () {
      var val = parseInt($('.' + d + '-co').val());
      $('.' + d + '-co').val(val - parseInt(c));
    });
  } else {
    throw new Error('scout.init() not instantiated');
  }
};
exports.input = function (a, b, c, d) {
  if (init) {
    count++;
    $(a).append(
      `<div class="input in-` + count + `" style="text-align: center;">
        <h3>` + b + `</h3>
        <input class="form-control scout-i" data-key="` + d + `" placeholder="` + c + `">
        <br>
        <br>
      </div>`
    );
  } else {
    throw new Error('scout.init() not instantiated');
  }
};
exports.multipleChoice = function (a, b, c, d) {
  if (init) {
    count++;
    $(a).append(
      `<div class="multiple-choice mc-` + count + `" style="text-align: center;">
        <h3>` + b + `</h3>
        <div class="btn-group bg-` + count + `" data-toggle="buttons"></div>
        <br>
        <br>
      </div>`
    );
    for (i = 0; i < c.length; i++) {
      var val = c[i][2] != undefined ? 'value="' + c[i][2] + '"' : '';
      $('.bg-' + count).append('<span class="btn btn-' + count + '-' + (i + 1) + ' scout-mc btn-outline-' + c[i][1] + '" data-key="' + d + '"><input type="radio" ' + val + ' autocomplete="off">' + c[i][0] + '</span>');
    }
  } else {
    throw new Error('scout.init() not instantiated');
  }
};
exports.noty = function (a) {
  return new Noty(a).show();
};
exports.pie = function (a, b, c, d) {
  if (init) {
    count++;
    $(a).append(
      `<div class="pie p-` + count + `">
        <canvas id='p-` + d + `'></canvas>
        <br>
        <br>
      </div>`
    );
    var ctx = document.getElementById('p-' + d).getContext('2d');
    var myChart = new Chart(ctx, {
      type: 'pie',
      data: {
        datasets: [{
          backgroundColor: c,
          data: b
        }]
      }
    });
  } else {
    throw new Error('scout.init() not instantiated');
  }
};
exports.slider = function (a, b, c, d, e) {
  if (init) {
    count++;
    $('head').append('<link rel="stylesheet" href="node_modules/nouislider/distribute/nouislider.css">');
    $(a).append(
      `<div class="slider s-` + count + `">
        <h3 style="text-align: center;">` + b + `</h3>
        <br>
        <br>
        <div id="` + a + `-slide"></div>
        <br>
        <br>
      </div>`
    );
    var slider = document.getElementById(a + '-slide');
    var tooltip = [];
    var connect = [];
    var classes = [];
    for (i = 0; i < c.length; i++) {
      tooltip.push(true);
      connect.push(true);
      classes.push('s-' + e + '-' + i);
    };
    connect.push(true);
    classes.push('s-' + e + '-' + c.length);
    noUiSlider.create(slider, {
      start: c,
      tooltips: tooltip,
      behavior: 'tap',
      connect: connect,
      range: {
        'min': [0],
        'max': [100]
      }
    });
    var connect = slider.querySelectorAll('.noUi-connect');
    for (i = 0; i < connect.length; i++) {
      connect[i].classList.add(classes[i]);
      $('.s-' + e + '-' + i).css('background', d[i]);
    };
    slider.noUiSlider.on('end', function () {
      var value = slider.noUiSlider.get();
      eval('json.' + e + ' = [' + value + ']');
      fs.writeFileSync('./data/m' + $('.matchnum').val() + '-' + role + '-' + team + '.json', JSON.stringify(json));
    });
  } else {
    throw new Error('scout.init() not instantiated');
  }
};
exports.textarea = function (a, b, c, d) {
  if (init) {
    count++;
    $(a).append(
      `<div class="textarea txt-` + count + `" style="text-align: center;">
        <h3>` + b + `</h3>
        <textarea class="form-control scout-t" data-key="` + d + `" placeholder="` + c + `"></textarea>
        <br>
        <br>
      </div>`
    );
  } else {
    throw new Error('scout.init() not instantiated');
  }
};
// *****************************************************************************
// Other functions:
exports.done = function (a, b) {
  if (init) {
    count++;
    match++;
    if (arguments.length == 1 && b == undefined) {
      b = true;
    }
    if (b) {
      $('.btn-' + $('.body-div-' + a.substr(1)).attr('class').substr(19) + '-next')
        .replaceWith(`<button class="btn btn-outline-success done-` + count + `">Done!</button>`)
        .removeClass('.btn-' + $('.body-div-' + a.substr(1)).attr('class').substr(19) + '-next')
        .show();
    } else {
      $(a).append(
        `<button class="btn btn-outline-success done-` + count + `">Done!</button>`
      );
    }
    $('.save-' + count).click(function () {
      fs.writeFileSync('./data/m' + $('.matchnum').val() + '-' + role + '-' + team + '.json', JSON.stringify(json));
      fs.writeFileSync('./scouting/match.txt', match);
      window.location.reload();
    });
  } else {
    throw new Error('scout.init() not instantiated');
  }
};
exports.init = function (a) {
  initCount++;
  if (initCount == 1) {
    var scoutDir = './scouting';
    var dataDir = './data';
    if (!fs.existsSync(scoutDir)){
      fs.mkdirSync(scoutDir);
    }
    if (!fs.existsSync(dataDir)){
      fs.mkdirSync(dataDir);
    }
    if (a == 'stand') {
      if (fs.existsSync('./scouting/match.txt')) {
        match = fs.readFileSync('./scouting/match.txt', 'utf-8');
      } else {
        match = 1;
        fs.writeFileSync('./scouting/match.txt', match);
      }
      if (fs.existsSync('./scouting/schedule.json')) {
        schedule = JSON.parse(fs.readFileSync('./scouting/schedule.json', 'utf-8'));
      } else {
        new Noty({
          text: 'No schedule',
          type: 'warning',
          layout: 'center'
        }).show();
      }
      if (fs.existsSync('./scouting/scouts.json')) {
        scouts = JSON.parse(fs.readFileSync('./scouting/scouts.json', 'utf-8'));
      } else {
        new Noty({
          text: 'No scouts',
          type: 'warning',
          layout: 'center'
        }).show();
      }
      if (fs.existsSync('./scouting/role.txt')) {
        role = fs.readFileSync('./scouting/role.txt', 'utf-8');
      } else {
        role = 'r1';
        fs.writeFileSync('./scouting/role.txt', role);
      }
      switch (role) {
        case 'r1':
          roleName = 'Red 1';
          roleColor = 'red';
          rolePos = 0;
          break;
        case 'r2':
          roleName = 'Red 2';
          roleColor = 'red';
          rolePos = 1;
          break;
        case 'r3':
          roleName = 'Red 3';
          roleColor = 'red';
          rolePos = 2;
          break;
        case 'b1':
          roleName = 'Blue 1';
          roleColor = 'blue';
          rolePos = 3;
          break;
        case 'b2':
          roleName = 'Blue 2';
          roleColor = 'blue';
          rolePos = 4;
          break;
        case 'b3':
          roleName = 'Blue 3';
          roleColor = 'blue';
          rolePos = 5;
          break;
      }
      team = schedule[match][rolePos] != undefined ? schedule[match][rolePos] : 'No team.';
      $('body').append(
        `<nav class="navbar fixed-bottom matchinfo">
          <div class="row">
            <div class="col-sm-4 d-table info-panel">
              <h3 style="display: table-cell; vertical-align: middle;">
                Role: <span style="color: ` + roleColor + `;">` + roleName + `</span>
                <br>
                <br>
                Team: <span style="color: ` + roleColor + `;">` + team + `</span>
                <br>
                <br>
                <span class="scout-num"></span>
              </h3>
            </div>
            <div class="col-sm-4 info-panel">
              <h3>Match Number:</h3>
              <br>
              <input class="form-control matchnum" type="number" value="` + parseInt(match) + `" style="text-align: center; font-size: 24pt;">
              <br>
              <button class="btn btn-outline-warning edit-matchnum" style="display: none; margin-left: 17.5vw;">Edit Match Number</button>
            </div>
            <div class="col-sm-4 info-panel"></div>
          </div>
        </nav>`
      );
      $('.info-panel').css('height', $('.matchinfo').height());
      init = true;
    } else if (a == 'pit') {
      if (fs.existsSync('./scouting/scouts.json')) {
        scouts = JSON.parse(fs.readFileSync('./scouting/scouts.json', 'utf-8'));
      } else {
        new Noty({
          text: 'No scouts',
          type: 'warning',
          layout: 'center'
        }).show();
      }
      init = true;
    } else {
      throw new Error('Use \'scout\' or \'pit\'.');
      init = false;
    }
    return init;
  } else {
    throw new Error('scout.init() instantiated ' + initCount + ' times');
  }
};
exports.login = function (a) {
  if (init) {
    count++;
    var num = count;
    $(a).append(
      `<div class="input-group" style="text-align: center;">
        <input class="form-control l-` + num + `" type="number">
        <button type="button" class="btn btn-outline-success ls-` + count + `">Login</button>
      </div>
      <br>
      <div style="text-align: center;">
        <h1 class="l-greeting" style="display: none;">Welcome, </h1>
      </div>
      <div class="role" style="display: none; text-align: center;">
        <div class="btn-group" data-toggle="buttons">
          <span class="btn btn-outline-danger">
            <input type="radio" class="btn-role" autocomplete="off" value="r1">Red 1
          </span>
          <span class="btn btn-outline-danger">
            <input type="radio" class="btn-role" autocomplete="off" value="r2">Red 2
          </span>
          <span class="btn btn-outline-danger">
            <input type="radio" class="btn-role" autocomplete="off" value="r3">Red 3
          </span>
          <span class="btn btn-outline-info">
            <input type="radio" class="btn-role" autocomplete="off" value="b1">Blue 1
          </span>
          <span class="btn btn-outline-info">
            <input type="radio" class="btn-role" autocomplete="off" value="b2">Blue 2
          </span>
          <span class="btn btn-outline-info">
            <input type="radio" class="btn-role" autocomplete="off" value="b3">Blue 3
          </span>
        </div>
        <br>
        <br>
        <button type="button" class="btn btn-outline-success role-submit">Submit</button>
      </div>`
    );
    $('.btn-next, .btn-back').hide();
    $('.ls-' + count).click(function () {
      var act = $('.l-' + num).val()
      if (scouts.hasOwnProperty(act)) {
        $('.l-greeting')
          .append(scouts[act] + '!')
          .fadeIn();
        json.scout = scouts[act];
        fs.writeFileSync('./data/m' + $('.matchnum').val() + '-' + role + '-' + team + '.json', JSON.stringify(json));
        $('.btn-next, .btn-back').show();
        $('.scout-num').append('Scout: ' + scouts[act]);
      } else if (act == 1540) {
        $('.role').fadeIn();
      }
    });
  } else {
    throw new Error('scout.init() not instantiated');
  }
};
exports.page = function (a, b) {
  if (init) {
    var sum = 0;
    $('body').append(
      `<div class="page-pane body-div-` + a.toLowerCase().replace(/\s+/g, '-') + `" style="height: 100vh; width: 100vw; display: none;">
        <br>
        <h1 style="text-align: center;">` + a + `</h1>
        <br>
        <hr>
        <br>
        <br>
        <div class="` + a.toLowerCase().replace(/\s+/g, '-') + ` container">
          <div class="row row-` + a.toLowerCase().replace(/\s+/g, '-') + `"></div>
        </div>
        <div class="nav-btns">
        <button class="btn btn-outline-danger btn-back btn-` + a.toLowerCase().replace(/\s+/g, '-') + `-back" data-page="body-div-` + a.toLowerCase().replace(/\s+/g, '-') + `" style="margin-left: 5%;"><i class="fa fa-chevron-left"></i> Back</button>
        <button class="btn btn-outline-success btn-next btn-` + a.toLowerCase().replace(/\s+/g, '-') + `-next" data-page="body-div-` + a.toLowerCase().replace(/\s+/g, '-') + `">Next <i class="fa fa-chevron-right"></i></button>
        </div>
        <br>
        <br>
      </div>`
    );
    for (i = 0; i < b.length; i++) {
      sum += b[i];
    }
    if (sum == 12) {
      for (i = 0; i < b.length; i++) {
        $('.row-' + a.toLowerCase().replace(/\s+/g, '-')).append('<div class="col-sm-' + b[i] + ' cell-' + a.toLowerCase().replace(/\s+/g, '-') + '-' + (i + 1) + '"></div>');
      }
    } else {
      throw new Error('Numbers do not add up to 12: ' + a);
    }
    pages.push('body-div-' + a.toLowerCase().replace(/\s+/g, '-'));
  } else {
    throw new Error('scout.init() not instantiated');
  }
};
// *****************************************************************************
$(document).ready(function () {
// *****************************************************************************
  $('.scout-c').click(function () {
    var name = $(this).attr('data-key');
    var value = $(this).children().attr('value') == undefined ? $(this).text() : $(this).children().val();
    var index = cArr.indexOf(value);
    if (!$(this).hasClass('active')) {
      typeof value == 'string' && value != 'true' && value != 'false' ?
        cArr.push('"' + value + '"') :
        cArr.push(value);
    } else {
      cArr.splice(index, 1);
    }
    eval('json.' + name + ' = [' + cArr + ']');
    fs.writeFileSync('./data/m' + $('.matchnum').val() + '-' + role + '-' + team + '.json', JSON.stringify(json));
  });
  $('.scout-co').click(function () {
    var name = $(this).attr('data-key');
    var value = $('.' + $(this).attr('data-key') + '-co').val();
    eval('json.' + name + ' = ' + value);
    fs.writeFileSync('./data/m' + $('.matchnum').val() + '-' + role + '-' + team + '.json', JSON.stringify(json));
  });
  $('.scout-i').keyup(function () {
    var name = $(this).attr('data-key');
    var value = $(this).val();
    eval('json.' + name + ' = "' + value + '"');
    fs.writeFileSync('./data/m' + $('.matchnum').val() + '-' + role + '-' + team + '.json', JSON.stringify(json));
  });
  $('.scout-mc').click(function () {
    var name = $(this).attr('data-key');
    var value = $(this).children().attr('value') == undefined ? $(this).text() : $(this).children().val();
    typeof value == 'string' && value != 'true' && value != 'false' ?
      eval('json.' + name + ' = "' + value + '"') :
      eval('json.' + name + ' = ' + value);
    fs.writeFileSync('./data/m' + $('.matchnum').val() + '-' + role + '-' + team + '.json', JSON.stringify(json));
  });
  $('.scout-t').keyup(function () {
    var name = $(this).attr('data-key');
    var value = $(this).val();
    eval('json.' + name + ' = "' + value + '"');
    fs.writeFileSync('./data/m' + $('.matchnum').val() + '-' + role + '-' + team + '.json', JSON.stringify(json));
  });
// *****************************************************************************
  $('.btn-back').click(function () {
    var page = $(this).attr('data-page');
    var index = pages.indexOf(page);
    if (pages[index - 1] != undefined) {
      $('.' + page).fadeOut(function () {
        $('.' + pages[index - 1]).fadeIn();
      });
    }
  });
  $('.btn-next').click(function () {
    var page = $(this).attr('data-page');
    var index = pages.indexOf(page);
    if (pages[index + 1] != undefined) {
      $('.' + page).fadeOut(function () {
        $('.' + pages[index + 1]).fadeIn();
      });
    }
  });
// *****************************************************************************
  $('.edit-matchnum').click(function () {
    fs.writeFileSync('./scouting/match.txt', $('.matchnum').val());
    $('.matchnum').val(fs.readFileSync('./scouting/match.txt', 'utf-8'));
    $(this).fadeOut();
  });
  $('.matchnum').keyup(function () {
    $('.edit-matchnum').fadeIn(1000);
  });
// *****************************************************************************
  $('.role-submit').click(function () {
    role = $('.btn-role:checked').val();
    fs.writeFileSync('./scouting/role.txt', role);
    window.location.reload();
  });
// *****************************************************************************
  $('.' + pages[0]).show();
  $('.page-pane').each(function () {
    if ($(this).attr('class').substr(10) == pages[0]) {
      $('.btn-' + $(this).attr('class').substr(19) + '-back').remove();
      $('.btn-' + $(this).attr('class').substr(19) + '-next').css('margin-left', '5%');
    }
    if ($(this).attr('class').substr(10) == pages[pages.length - 1]) {
      $('.btn-' + $(this).attr('class').substr(19) + '-next').remove();
    }
  });
});
