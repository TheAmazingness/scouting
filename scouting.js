var $ = require('jquery');
var chartjs = require('chartjs');
var noUiSlider = require('nouislider');
var fs = require('fs-extra');
var Noty = require('noty');
var exec = require('child_process').execSync;
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
var loginCount = 0;
var isStand;
var pitTeam;
var pitConfirm;
var manifest;
var manifestPit = []
var manifestStand = []
var matchSchedule = {}
var exemptionReq = 20;
var pitValue = 0.5;
var scoutList = [];
var teams;
var initRole;
var settings = false;
// *****************************************************************************
function addSettings() {
	if (init && !settings) {
		settings=true;
		$("body").append(
			`<div style="position:absolute;top:2vw;left:2vw;" class="dropdown">
				<button type="button" id="dropdownMenuButton" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
    			Settings
  				</button>
  				<div class="dropdown-menu settings-menu" aria-labelledby="dropdownMenuButton">
  				</div>
			</div>`
		);
	}
}

function save() {
  manifest = JSON.parse(fs.readFileSync('./data/manifest.json', 'utf-8'));
  if (isStand) {
    fs.writeFileSync('./data/m' + $('.matchnum').val() + '-' + role + '-' + team + '.json', JSON.stringify(json));
    if (manifest.indexOf('m' + $('.matchnum').val() + '-' + role + '-' + team + '.json') === -1) {
      manifest.push('m' + $('.matchnum').val() + '-' + role + '-' + team + '.json');
    }
  } else {
    fs.writeFileSync('./data/' + json.team + '.json', JSON.stringify(json));
    if (manifest.indexOf(json.team + '.json') === -1) {
      manifest.push(json.team + '.json');
    }
  }
  fs.writeFileSync('./data/manifest.json', JSON.stringify(manifest));
};
function pitTeamEL() {
  $('.pit-team-number').keyup(function () {
    json.team = $(this).val();
    if (event.which == 13) {
      if (fs.existsSync('data/' + json.team + '.json')) {
        pitTeam.close();
        pitConfirm = new Noty({
          text: 'Team ' + json.team + ' has already been pit scouted. Continuing will overwrite the file. Continue?',
          layout: 'center',
          type: 'warning',
          buttons: [
            Noty.button('Continue', 'btn btn-outline-danger', function () {
              pitConfirm.close();
              save();
              $('.page-pane').show();
            }, {id: 'pit-btn-cont'}),
            Noty.button('Go Back', 'btn btn-outline-success', function () {
              pitConfirm.close();
              pitTeam.show();
              pitTeamEL();
            }, {id: 'pit-btn-back'})
          ]
        }).show();
        $('#pit-btn-cont').css('margin-right', '5%');
      } else {
        pitTeam.close();
        save();
        $('.page-pane').show();
      }
    }
  });
};
function contains(a, obj) {
	var i = a.length;
	while (i--) {
		if (a[i] === obj) {
			return true;
		}
	}
	return false;
}
function Scout(name,id) {
	this.name = name;
	this.id = id;
	this.req = 20;
	this.pit = 0;
	this.stand = 0;
	this.total = 0;
	this.exempt = false;
}
function importScouts() {
	var file = JSON.parse(fs.readFileSync('data-collect/scouts.json'));
	var keys = Object.keys(file);
	for (x in keys) {
		scoutList.push(new Scout(file[keys[x]],keys[x]));
	}
}
function importSchedule() {
	matchSchedule = JSON.parse(fs.readFileSync('data-collect/schedule.json'));
}
function setExemptions() {
	var file = JSON.parse(fs.readFileSync('data-collect/exempt.json'));
	for (x in scoutList) {
		if (contains(Object.keys(file),scoutList[x].id)) {
			scoutList[x].req = file[scoutList[x].id];
		} else {
			scoutList[x].req = exemptionReq;
		}
		if (scoutList[x].req == 0) {
			scoutList[x].exempt = true;
		}
	}
}
function importPitManifest() {
	if (fs.existsSync('data-collect/pit-scouting/manifest.json')) {
		manifestPit = JSON.parse(fs.readFileSync('data-collect/pit-scouting/manifest.json'));
	} else {
    new Noty({
      text: 'No manifest.json file for pit scouting',
      type: 'error'
    }).show();
	}
}
function importStandManifest() {
	if (fs.existsSync('data-collect/stand-scouting/manifest.json')) {
		manifestStand = JSON.parse(fs.readFileSync('data-collect/stand-scouting/manifest.json'));
	} else {
    new Noty({
      text: 'No manifest.json file for stand scouting',
      type: 'error'
    }).show();
	}
}
function importPit() {
	if (fs.existsSync('/Volumes/1540/companal/pit-scouting/manifest.json')) {
		var manifest = JSON.parse(fs.readFileSync('/Volumes/1540/companal/pit-scouting/manifest.json'));
		for (var team in manifest) {
			if (!fs.existsSync('data-collect/pit-scouting/' + manifest[team]) && fs.existsSync('/Volumes/1540/companal/pit-scouting/' + manifest[team])) {
				var dataJSON = fs.readFileSync('/Volumes/1540/companal/pit-scouting/' + manifest[team]);
				var data = JSON.parse(dataJSON);
				scoutOne = findScout(data.scoutIds[0]);
				addToTotal(scoutOne.id, 'pit');
				scoutTwo = findScout(data.scoutIds[1]);
				if (scoutTwo!=null) {
					addToTotal(scoutTwo.id, 'pit');
				}
				manifestPit.push(manifest[team]);
				fs.writeFileSync('data-collect/pit-scouting/manifest.json',JSON.stringify(manifestPit));
				fs.writeFileSync('data-collect/pit-scouting/' + manifest[team],dataJSON);
			}
		}
		new Noty({
			text: 'Done importing data!',
			type: 'success'
		}).show();
	} else {
		new Noty({
			text: 'There is no flashdrive at /Volumes/1540/.',
			type: 'error'
		}).show();
	}
}
function importStand() {
 	if (fs.existsSync('/Volumes/1540/companal/stand-scouting/manifest.json')) {
 		var manifest = JSON.parse(fs.readFileSync('/Volumes/1540/companal/stand-scouting/manifest.json'));
		for (var team in manifest) {
			if (!fs.existsSync('data-collect/stand-scouting/' + manifest[team]) && fs.existsSync('/Volumes/1540/companal/stand-scouting/' + manifest[team])) {
				var dataJSON = fs.readFileSync('/Volumes/1540/companal/stand-scouting/' + manifest[team]);
				var data = JSON.parse(dataJSON);
				$('#m' + data.matchNumber + data.role).css('background-color', 'blue');
				$('#m' + data.matchNumber + data.role).css('color', 'white');
				$('#m' + data.matchNumber + data.role).text(findScout(data.scoutId).name);
				addToTotal(data.scoutId,' stand');
				manifestStand.push(manifest[team]);
				fs.writeFileSync('data-collect/stand-scouting/manifest.json', JSON.stringify(manifestStand));
				fs.writeFileSync('data-collect/stand-scouting/' + manifest[team],dataJSON);
			}
		}
		new Noty({
			text: 'Done importing data!',
			type: 'success'
		}).show();
 	} else {
		new Noty({
			text: 'There is no flashdrive at /Volumes/1540/.',
			type: 'error'
		}).show();
 	}
}
function exportData() {
	if (fs.existsSync('/Volumes/1540/companal/output')) {
		fs.copySync('data-collect/stand-scouting/', '/Volumes/1540/companal/output/stand-scouting/');
		fs.copySync('data-collect/pit-scouting/', '/Volumes/1540/companal/output/pit-scouting/');
	} else {
		new Noty({
			text: 'Cannot find flashdrive at /Volumes/1540/.',
			type: 'error'
		}).show();
	}
}
function findScout(id) {
	for (x in scoutList) {
		if (scoutList[x].id == id) {
			return scoutList[x];
		}
	}
	return null;
}
function resetTables() {
	$('#members').hide();
	$('#matches').hide();
	$('#teams').hide();
	$('#schedule').hide();
	$('.members').removeClass('act');
	$('.teams').removeClass('act');
	$('.matches').removeClass('act');
	$('.schedule').removeClass('act');
}
function createTables(a) {
	// Members Table
	for (x in scoutList) {
		var id = scoutList[x].id;
		var rs = '#' + id + 'row';
		var scout = scoutList[x];
		$('#tbody').append('<tr id="' + id + 'row"></tr>');
		if (scout.total < scout.req) {
			$(rs).append('<td id="' + id + 'req">' + (scout.req - scout.total) + ' more matches</td>');
		} else {
			$(rs).append('<td id="' + id + 'req"> style="background-color:#F5FFBF">Completed</td>');
		}
		$(rs).append('<td id="' + id + 'id">' + id + '</td>');
		$(rs).append('<td id="' + id + 'name">' + scout.name + '</td>');
		$(rs).append('<td id="' + id + 'num">' + scout.pit + '</td>');
		$(rs).append('<td id="' + id + 'num2">' + scout.stand + '</td>');
		$(rs).append('<td id="' + id + 'num3">' + scout.total + '</td>');
	}
	// Teams Table
  teams = JSON.parse(exec('curl -X GET "https://www.thebluealliance.com/api/v3/event/' + a + '/teams/simple" -H "accept: application/json" -H "X-TBA-Auth-Key: p2nxGJxqkJo5a8clThWbi1ZNQhy8CaKlJd4YM5TOFgbR4d7y4KLFU1RWhLANpM8N"', {encoding: 'utf-8'}));
	for (x in teams) {
		var tr = document.createElement('tr');
		tr.setAttribute('id','r' + team + 'row');
		$('#robotBody').append(tr);
		var name = document.createElement('td');
		name.setAttribute('id','r' + team + 'bot');
		$('#r' + teams[x].team_number + '-row').append(name);
		$('#r' + teams[x].team_number + 'bot').text(team);
		var aname = document.createElement('td');
		aname.setAttribute('id','r' + team + 'nm');
		$('#r' + teams[x].team_number + 'row').append(aname);
		$('#r' + teams[x].team_number + 'nm').text(teams[x].nickname);
		var pit = document.createElement('td');
		pit.setAttribute('id','r' + team + 'pit');
		$('#r' + teams[x].team_number + 'row').append(pit);
		$('#r' + teams[x].team_number + 'pit').text('False');
		$('#r' + teams[x].team_number + 'pit').css('background-color','#ffdad1');
		var stand = document.createElement('td');
		stand.setAttribute('id','r' + team + 'stand');
		$('#r' + teams[x].team_number + 'row').append(stand);
		$('#r' + teams[x].team_number + 'stand').text('0');
	}
	// Match Table
	for (match = 1; match <= Object.keys(matchSchedule).length; match++) {
		var rs = '#m' + match + 'row';
		$('#matchBody').append('<tr id="m' + match + 'row"></tr>');
		$(rs).append('<td id="m' + match + 'num">' + match + '</td>');
		$(rs).append('<td style="width: 15%; background-color: #F5FFBF" id="m' + match + 'r1">False</td>');
		$(rs).append('<td style="width: 15%; background-color: #F5FFBF" id="m' + match + 'r2">False</td>');
		$(rs).append('<td style="width: 15%; background-color: #F5FFBF" id="m' + match + 'r3">False</td>');
		$(rs).append('<td style="width: 15%; background-color: #F5FFBF" id="m' + match + 'b1">False</td>');
		$(rs).append('<td style="width: 15%; background-color: #F5FFBF" id="m' + match + 'b2">False</td>');
		$(rs).append('<td style="width: 15%; background-color: #F5FFBF" id="m' + match + 'b3">False</td>');
	}
	// Schedule Table
	for (match = 1; match < Object.keys(matchSchedule).length + 1; match++) {
		var rs = '#s' + match + 'row';
		$('#scheduleBody').append('<tr id="s' + match + 'row"></tr>');
 		$(rs).append('<td id="s' + match + 'title">' + match + '</td>');
		for (x = 0; x < 6; x++) {
			$(rs).append('<td style="width:15%" id="s' + match + x + 'spot">' + matchSchedule[match][x] + '</td>');
			if (parseInt(matchSchedule[match][x]) == 1540) {
				$('#s' + match + x + 'spot').css('background-color','#B6FF9E');
			}
		}
	}
}
function addToTotal(id, type) {
	scout = findScout(id);
	if (type == 'pit') {
		scout.pit += 1;
		scout.total += pitValue;
		$('#' + id + 'num').text(scout.pit);
	} else {
		scout.stand += 1;
		scout.total += 1;
		$('#' + id + 'num1').text(scout.stand);
	}
	$('#' + id + 'num2').text(scout.total);
	if (!scout.exempt && scout.total >= scout.req) {
		scout.exempt=true;
		$('#' + scout.id + 'req').text('Completed');
		$('#' + scout.id + 'req').css('background-color','#F5FFBF');
	} else if (!scout.exempt) {
		$('#' + scout.id + 'req').text(scout.req - scout.total + ' more matches');
	}
}
function pitWeight(pw) {
	pitValue = pw;
}
function requirement(req) {
	exemptionReq = req;
}
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
  return new Noty(a);
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
      save();
    });
  } else {
    throw new Error('scout.init() not instantiated');
  }
};
exports.text = function (a, b, c) {
	if (init) {
		count++;
		$(a).append(
			`<h3 style="text-align:center;font-size:`+c+`;" class="text-` + count + `">` + b + `</h3>`
		);
	}
}
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
  } else {
    throw new Error('scout.init() not instantiated');
  }
};
exports.init = function (a) {
  initRole = a;
  initCount++;
  if (initCount == 1) {
    if (a == 'stand' || 'pit') {
      var scoutDir = './scouting';
      var dataDir = './data';
      if (!fs.existsSync(scoutDir)){
        fs.mkdirSync(scoutDir);
      }
      if (!fs.existsSync(dataDir)){
        fs.mkdirSync(dataDir);
      }
      if (!fs.existsSync('./data/manifest.json')) {
        fs.writeFileSync('./data/manifest.json', '[]');
      }
    }
    if (a == 'stand') {
      isStand = true;
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
          type: 'warning'
        }).show();
      }
      if (fs.existsSync('./scouting/scouts.json')) {
        scouts = JSON.parse(fs.readFileSync('./scouting/scouts.json', 'utf-8'));
      } else {
        new Noty({
          text: 'No scouts',
          type: 'warning'
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
      team = schedule[match][rolePos];
      $('body').append(
        `<nav class="navbar fixed-bottom matchinfo">
          <div class="row">
            <div class="col-sm-4 d-table info-panel">
              <h3 style="display: table-cell; vertical-align: middle;">
                Role: <span class="role-name" style="color: ` + roleColor + `;">` + roleName + `</span>
                <br>
                <br>
                Team: <span class="role-team" style="color: ` + roleColor + `;">` + team + `</span>
                <br>
                <br>
                <span class="scout-num"></span>
                <button class="btn btn-outline-warning edit-scout" style="display: none; margin-left: 5vw;">Edit Scout Number</button>
              </h3>
            </div>
            <div class="col-sm-4 info-panel matchnum-wrap">
              <h3>Match Number:</h3>
              <br>
              <input class="form-control matchnum" type="number" value="` + parseInt(match) + `" style="text-align: center; font-size: 24pt;">
              <br>
              <button class="btn btn-outline-warning edit-matchnum" style="display: none; margin-left: 17.5vw;">Edit Match Number</button>
            </div>
            <div class="col-sm-4 info-panel infobar-settings" style="display: table;"></div>
          </div>
        </nav>`
      );
      $('.info-panel').css('height', $('.matchinfo').height());
      init = true;
    } else if (a == 'pit') {
      isStand = false;
      if (fs.existsSync('./scouting/scouts.json')) {
        scouts = JSON.parse(fs.readFileSync('./scouting/scouts.json', 'utf-8'));
      } else {
        new Noty({
          text: 'No scouts',
          type: 'warning'
        }).show();
      }
      init = true;
      pitTeam = new Noty({
        text: 'Enter team number: <input class="form-control pit-team-number" type="number">',
        type: 'success',
        closeWith: ['button'],
        layout: 'center'
      }).show();
    } else if (a == 'database') {
      if (!fs.existsSync('./data-collect')) {
        fs.mkdirSync('./data-collect');
      }
      if (!fs.existsSync('./data-collect/pit-scouting')) {
        fs.mkdirSync('./data-collect/pit-scouting');
      }
      if (!fs.existsSync('./data-collect/stand-scouting')) {
        fs.mkdirSync('./data-collect/stand-scouting');
      }
      if (!fs.existsSync('./data-collect/scouts.json')) {
        fs.writeFileSync('./data-collect/scouts.json', '{}');
      }
      if (!fs.existsSync('./data-collect/scouts.json')) {
        new Noty({
          text: 'No scouts',
          type: 'error'
        }).show();
      }
      if (!fs.existsSync('./data-collect/schedule.json')) {
        new Noty({
          text: 'No schedule',
          type: 'error'
        }).show();
      }
      if (!fs.existsSync('./data-collect/exempt.json')) {
        fs.writeFileSync('./data-collect/exempt.json', '{}');
      }
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
        loginCount++;
        if (loginCount == 1) {
          $('.l-greeting')
            .append(scouts[act] + '!')
            .fadeIn();
          json.scout = act;
          save();
          $('.btn-next, .btn-back').show();
          $('.scout-num').append(
            `Scout: <input class="num-change" style="border: none;" value="` + scouts[act] + `">
            <br>
            <br>`
          );
        }
      } else if (act == 1540) {
        $('.role').fadeIn();
      } else {
        new Noty({
          text: 'No scout at this number',
          type: 'error'
        }).show();
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
exports.flashdrive = function() {
	if (init) {
		addSettings();
 		$(".settings-menu").append(
			`<a class="dropdown-item save-to-flash" href="#">Save to Flashdrive</a>`
		);
	}
}
exports.update = function() {
	if (init) {
		addSettings();
		$(".settings-menu").append(
			`<a class="dropdown-item update" href="#">Update</a>`
		);
	}
}
// *****************************************************************************
// exports.concat = function (a, b) {
//   if (a == 'stand' || a == 'pit') {
//     fs.writeFileSync(a + '.json', '[');
//     var files = fs.readdirSync(b);
//     for (i = 0; i < files.length; i++) {
//       if (files[i].indexOf('.json') >= 0) {
//         fs.appendFileSync(a + '.json', JSON.stringify(JSON.parse(fs.readFileSync(b + files[i], 'utf-8'))));
//       }
//     }
//     fs.appendFileSync(a + '.json', ']');
//   } else {
//     throw new Error('Must be stand or pit');
//   }
// };
// exports.rank = function (a, b) {
//   if (a == 'stand' || a == 'pit') {
//     var rank = JSON.parse(fs.readFileSync(a + '.json', 'utf-8'));
//     console.log(rank);
//   } else {
//     throw new Error('Must be stand or pit');
//   }
// };
// *****************************************************************************
exports.database = function (a) {
	importScouts();
	importSchedule();
	setExemptions(exemptionReq);
	importPitManifest();
	importStandManifest();
	$(function () {
		$('head').append(`
			<style>
				* {
					font-family: Trebuchet MS !important;
				}
				.center{
					text-align: center;
				}
				div {
					position: relative;
					top: -20px;
				}
				nav {
					position: fixed;
					top: -20px;
				}
				.act, .sect:hover, .sect:active:focus, .sect:focus {
					background-color: darkblue;
				}
				th {
					background-color: #e2e2e2;
				}
				.table3 {
					background-color: #f2f2f2;
				}
				.table td, .table th{
					border: black solid 1px !important;
				}
				.table1 {
					background-color: #f7f7f7;
				}
				.table2 {
					background-color: #d1d1d1;
				}
			</style>`
		);
		$('body').append(`
			<nav class='center' style='background-color:#ededed;z-index:1;width:100%' data-spy='affix'>
        <br>
				<h2 style='position:relative;top:14px;'>Database App</h2>
				<br>
				<button class='btn-warning btn pit' type='button' class='btn-primary btn.lg'>Import Pit Data</button>
				<button class='btn-warning btn stand' type='button' class='btn-primary btn.lg'>Import Stand Data</button>
				<button class='btn-success btn export' type='button' class='btn-primary btn.lg'>Export Data</button>
				<br>
				<br>
				<button class='sect act btn-primary btn members' type='button' style='margin-bottom: 10px;'>Members</button>
				<button class='sect btn-primary btn teams' type='button' style='margin-bottom: 10px;'>Teams</button>
				<button class='sect btn-primary btn matches' type='button' style='margin-bottom: 10px;'>Matches</button>
				<button class='sect btn-primary btn schedule' type='button' style='margin-bottom:10px'>Match Schedule</button>
				<br>
			</nav>
			<br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
      <br>
			<div id='members' class='center'>
				<h3>Members</h3>
				<table style='width: 80%;border: 3px black solid; margin-left: auto; margin-right: auto;' id='scoutingTable' border='1' class='center-block table table-hover table-bordered'>
					<thead>
						<tr>
							<th>Requirement</th>
							<th>ID</th>
							<th>Scout</th>
    						<th>Pit Scouted</th>
    						<th>Stand Scouted</th>
    						<th>Total Scouted</th>
						</tr>
					</thead>
					<tbody id='tbody'>
					</tbody>
				</table>
			</div>
			<div hidden id='teams' class='center'>
				<h3>Teams</h3>
				<table style='width: 80%;border: 3px black solid; margin-left: auto; margin-right;' id='robotTable' border='1' class='center-block table table-hover table-bordered'>
					<thead>
						<tr>
							<th>#</th>
							<th>Robot</th>
							<th>Pit Scouted</th>
    						<th>Scouted Matches</th>
							</tr>
					</thead>
					<tbody id='robotBody'>
					</tbody>
				</table>
			</div>
			<div hidden id='matches' class='center'>
				<h3>Scouted Matches</h3>
				<table style='width: 80%;border: 3px black solid; margin-left: auto; margin-right: auto;' id='matchTable' border='1' class='center-block table table-hover table-bordered'>
					<thead>
						<tr>
							<th>Match</th>
							<th style='background-color:#ff9a8e;'>Red 1</th>
    						<th style='background-color:#ffb8af;'>Red 2</th>
    						<th style='background-color:#ff9a8e;'>Red 3</th>
    						<th style='background-color:#afc4ff;'>Blue 1</th>
    						<th style='background-color:#8eacff;'>Blue 2</th>
    						<th style='background-color:#afc4ff;'>Blue 3</th>
						</tr>
					</thead>
					<tbody id='matchBody'>
					</tbody>
				</table>
			</div>
			<div hidden id='schedule' class='center'>
				<h3>Match Schedule</h3>
				<table style='width: 80%;border: 3px black solid; margin-left: auto; margin-right: auto;' id='scheduleTable' border='1' class='center-block table table-hover table-bordered'>
					<thead>
						<tr>
							<th class='first'>Match</th>
							<th style='background-color:#ff9a8e;'>Red 1</th>
    						<th style='background-color:#ffb8af;'>Red 2</th>
    						<th style='background-color:#ff9a8e;'>Red 3</th>
    						<th style='background-color:#afc4ff;'>Blue 1</th>
    						<th style='background-color:#8eacff;'>Blue 2</th>
    						<th style='background-color:#afc4ff;'>Blue 3</th>
						</tr>
					</thead>
					<tbody id='scheduleBody'>
					</tbody>
				</table>
			</div>
		`);
		$('.pit').click(function(){
			importPit();
		});
		$('.stand').click(function(){
			importStand();
		});
		$('.export').click(function(){
			exportData();
		});
		$('.members').click(function(){
			resetTables();
			$('#members').show();
			$('.members').addClass('act');
		});
		$('.teams').click(function(){
			resetTables();
			$('#teams').show();
			$('.teams').addClass('act');
		});
		$('.matches').click(function(){
			resetTables();
			$('#matches').show();
			$('.matches').addClass('act');
		});
		$('.schedule').click(function(){
			resetTables();
			$('#schedule').show();
			$('.schedule').addClass('act');
		});
		createTables(a);
		// Load Stand
		for (x in manifestStand) {
			if (fs.existsSync('data-collect/stand-scouting/' + manifestStand[x])) {
				var data = JSON.parse(fs.readFileSync('data-collect/stand-scouting/' + manifestStand[x]));
				addToTotal(data.scoutId,'stand');
				$('#m' + data.matchNumber + data.role).css('background-color','blue');
				$('#m' + data.matchNumber + data.role).css('color','white');
				$('#m' + data.matchNumber + data.role).text(findScout(data.scoutId).name);
			}
		}
		// Load Pit
		for (x in manifestPit) {
			if (fs.existsSync('data-collect/pit-scouting/' + manifestPit[x])) {
				var data = JSON.parse(fs.readFileSync('data-collect/pit-scouting/' + manifestPit[x]));
				var scoutOne = findScout(data.scoutIds[0]);
				var scoutTwo = findScout(data.scoutIds[1]);
				addToTotal(scoutOne.id,'pit');
          		if (scoutTwo != null) {
					addToTotal(scoutTwo.id,'pit');
				}
			}
		}
	});
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
    save();
  });
  $('.scout-co').click(function () {
    var name = $(this).attr('data-key');
    var value = $('.' + $(this).attr('data-key') + '-co').val();
    eval('json.' + name + ' = ' + value);
    save();
  });
  $('.scout-i').keyup(function () {
    var name = $(this).attr('data-key');
    var value = $(this).val();
    eval('json.' + name + ' = "' + value + '"');
    save();
  });
  $('.scout-mc').click(function () {
    var name = $(this).attr('data-key');
    var value = $(this).children().attr('value') == undefined ? $(this).text() : $(this).children().val();
    typeof value == 'string' && value != 'true' && value != 'false' ?
      eval('json.' + name + ' = "' + value + '"') :
      eval('json.' + name + ' = ' + value);
    save();
  });
  $('.scout-t').keyup(function () {
    var name = $(this).attr('data-key');
    var value = $(this).val();
    eval('json.' + name + ' = "' + value + '"');
    save();
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
  $('.done-' + count).click(function () {
    save();
    fs.writeFileSync('./scouting/match.txt', match);
    window.location.reload();
  });
// *****************************************************************************
  $('.edit-matchnum').click(function () {
    if (schedule.hasOwnProperty($('.matchnum').val())) {
      fs.writeFileSync('./scouting/match.txt', $('.matchnum').val());
      $('.matchnum').val(fs.readFileSync('./scouting/match.txt', 'utf-8'));
      $(this).fadeOut(function () {
        $('.matchnum-wrap').css('margin-top', 'auto');
      });
      match = $('.matchnum').val();
      $('.role-team').text(schedule[match][rolePos]);
    } else {
      new Noty({
        text: 'This match number does not exist.',
        type: 'error'
      });
    }
  });
  $('.matchnum').focus(function () {
    $('.edit-matchnum').fadeIn(1000);
    $('.matchnum-wrap').css('margin-top', '-5vh');
  });
// *****************************************************************************
  $('.role-submit').click(function () {
    role = $('.btn-role:checked').val();
    fs.writeFileSync('./scouting/role.txt', role);
    window.location.reload();
  });
// *****************************************************************************
  $('.save-to-flash').click(function () {
  	var PSpath = "";
  	var dirpath = "";
  	if (isStand) {
  		PSpath = "stand-scouting";
  	} else {
  		PSpath = "pit-scouting";
  	}
	var manifest;
	if (fs.existsSync('data/manifest.json')) {
		manifest = JSON.parse(fs.readFileSync("data/manifest.json"));
	} else {
		manifest = []
	}
	if (navigator.platform=="MacIntel") {
		dirpath = "/Volumes/1540";
	} else if (navigator.platform=="Win32") {
		if (fs.existsSync("K:/companal")) {
			dirpath = "K:";
		} else if (fs.existsSync("D:/companal")) {
			dirpath = "D:";
		}
	}
	if (fs.existsSync(dirpath)) {
		var array = JSON.parse(fs.readFileSync(data+"/companal/"+PSpath+"/manifest.json"));
		for (x in manifest) {
			if (!fs.existsSync(data+"/companal/"+PSpath+"/"+manifest[x])) {
				array.push(manifest[x]);
				fs.copySync('data/'+manifest[x], data+'/companal/'+PSpath+'/'+manifest[x]);
			}
		}
		fs.writeFileSync(dirpath+"/companal/"+PSpath+"/"+JSON.stringify(array));
		console.log("Files saved!");	
	} else {
		console.log("The flashdrive 1540 is not inputed into the tablet.");
	}
  });
  $('.update').click(function () {
	var exec = require('child_process').exec;
	if (navigator.onLine) {
		exec("git reset --hard");
		exec("git pull");
		exec("npm uninstall scouting");
		exec("npm install scouting --save");
		setTimeout(window.location.reload(),2000);
	} else {
		console.log("You don't have internet connection!");
	}
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
// *****************************************************************************
  if (initRole == 'pit') {
    pitTeamEL();
    $('.noty_close_button').remove();
    $('.page-pane').hide();
  }
// ****************************************************************************
  $('.matchinfo > .row').css('width', '100vw');
// *****************************************************************************
  $('.role-team').click(function () {
    $(this).attr('contenteditable', 'true');
  });
  $('.role-team').keyup(function (event) {
    if (event.which == 13) {
      $(this).attr('contenteditable', 'false');
      $(this).text($(this).text().replace(/[\n\r]/g, ''));
      team = $(this).text();
      save();
    }
  });
// *****************************************************************************
  $('.scout-num').click(function () {
    $('.num-change').val(json.scout);
    $('.edit-scout').show();
  });
  $('.edit-scout').click(function () {
    if (scouts[$('.num-change').val()] != undefined) {
      json.scout = $('.num-change').val();
      $('.num-change').val(scouts[$('.num-change').val()]);
      $(this).hide();
    } else {
      new Noty({
        text: 'No scout at this number',
        type: 'error'
      }).show();
    }
  });
});
