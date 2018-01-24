var $ = require('jquery');
var Chart = require('chart.js');
var noUiSlider = require('nouislider');
var fs = require('fs-extra');
var Noty = require('noty');
// var fontAwesome = require('font-awesome'); NOTE: Doesn't work
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
var isStand = false;
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
var isPit = false;
var filename;
var fileExist = false;
var filenameString;
var required = [];
var isSave = false;
var standNav = [];
var settings = false;
var uuid = "66216088-cc64-4a35-969f-58336ef03732" // for bluetooth
var addr = "80:19:34:19:20:FC"
// *****************************************************************************
// Given that there is no settings dropdown button, addSettings() creates a dropdown menu.
// Otherwise, this function does nothing
function addSettings() {
	if (!settings) { //if (init && !settings)
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
  if (isSave) {
    manifest = JSON.parse(fs.readFileSync('./data/manifest.json', 'utf-8'));
    if (isStand) {
      json.team = team;
      fs.writeFileSync('./data/m' + $('.matchnum').val() + '-' + role + '-' + team + '.json', JSON.stringify(json));
      if (manifest.indexOf('m' + $('.matchnum').val() + '-' + role + '-' + team + '.json') === -1) {
        manifest.push('m' + $('.matchnum').val() + '-' + role + '-' + team + '.json');
      }
    } else if (isPit) {
      fs.writeFileSync('./data/' + json.team + '.json', JSON.stringify(json));
      if (manifest.indexOf(json.team + '.json') === -1) {
        manifest.push(json.team + '.json');
      }
    } else {
      if (!fileExist) {
        // filename = new Noty({
        //   text: 'Filename: <input class="form-control filename" type="text">',
        //   type: 'success',
        //   closeWith: ['button'],
        //   layout: 'center'
        // }).show();
        $('.filename').keyup(function () {
          if (event.which == 13) {
            filenameString = $(this).val();
            fs.writeFileSync('./data/' + filenameString + '.json', JSON.stringify(json));
            if (manifest.indexOf(filenameString + '.json') === -1) {
              manifest.push(filenameString + '.json');
            }
            fileExist = true;
            filename.close();
          }
        });
      } else {
        fs.writeFileSync('./data/' + filenameString + '.json', JSON.stringify(json));
        if (manifest.indexOf(filenameString + '.json') === -1) {
          manifest.push(filenameString + '.json');
        }
      }
    }
    fs.writeFileSync('./data/manifest.json', JSON.stringify(manifest));
  }
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
              $('.' + pages[0]).show();
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
        $('.' + pages[0]).show();
      }
    }
  });
};

//literally just a contains function
//a is a list
//obj is an object that you are checking to see if it is in the list
//returns true if object is in list
function contains(a, obj) {
	var i = a.length;
	while (i--) {
		if (a[i] === obj) {
			return true;
		}
	}
	return false;
}

//a class for a scout
function Scout(name,id) {
	this.name = name;
	this.id = id;
	this.req = 20;
	this.pit = 0;
	this.stand = 0;
	this.total = 0;
	this.exempt = false;
}

//imports scouts from scouts.json, for database app
function importScouts() {
	var file = JSON.parse(fs.readFileSync('data-collect/scouts.json'));
	var keys = Object.keys(file);
	for (x in keys) {
		scoutList.push(new Scout(file[keys[x]],keys[x]));
	}
}

//imports schedule from schedule.json, for database app
function importSchedule() {
	matchSchedule = JSON.parse(fs.readFileSync('data-collect/schedule.json'));
}

//imports the number of matches each member has to scout from exempt.json, for database app
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

// function importPitManifest() {
// 	if (fs.existsSync('data-collect/pit-scouting/manifest.json')) {
// 		manifestPit = JSON.parse(fs.readFileSync('data-collect/pit-scouting/manifest.json'));
// 	} else {
//     new Noty({
//       text: 'No manifest.json file for pit scouting',
//       type: 'error'
//     }).show();
// 	}
// }
// function importStandManifest() {
// 	if (fs.existsSync('data-collect/stand-scouting/manifest.json')) {
// 		manifestStand = JSON.parse(fs.readFileSync('data-collect/stand-scouting/manifest.json'));
// 	} else {
//     new Noty({
//       text: 'No manifest.json file for stand scouting',
//       type: 'error'
//     }).show();
// 	}
// }
// function importPit() {
// 	if (fs.existsSync('/Volumes/1540/companal/pit-scouting/manifest.json')) {
// 		var manifest = JSON.parse(fs.readFileSync('/Volumes/1540/companal/pit-scouting/manifest.json'));
// 		for (var team in manifest) {
// 			if (!fs.existsSync('data-collect/pit-scouting/' + manifest[team]) && fs.existsSync('/Volumes/1540/companal/pit-scouting/' + manifest[team])) {
// 				var dataJSON = fs.readFileSync('/Volumes/1540/companal/pit-scouting/' + manifest[team]);
// 				var data = JSON.parse(dataJSON);
// 				scoutOne = findScout(data.scoutIds[0]);
// 				addToTotal(scoutOne.id, 'pit');
// 				scoutTwo = findScout(data.scoutIds[1]);
// 				if (scoutTwo!=null) {
// 					addToTotal(scoutTwo.id, 'pit');
// 				}
// 				manifestPit.push(manifest[team]);
// 				fs.writeFileSync('data-collect/pit-scouting/manifest.json',JSON.stringify(manifestPit));
// 				fs.writeFileSync('data-collect/pit-scouting/' + manifest[team],dataJSON);
// 			}
// 		}
// 		new Noty({
// 			text: 'Done importing data!',
// 			type: 'success'
// 		}).show();
// 	} else {
// 		new Noty({
// 			text: 'There is no flashdrive at /Volumes/1540/.',
// 			type: 'error'
// 		}).show();
// 	}
// }
// function importStand() {
//  	if (fs.existsSync('/Volumes/1540/companal/stand-scouting/manifest.json')) {
//  		var manifest = JSON.parse(fs.readFileSync('/Volumes/1540/companal/stand-scouting/manifest.json'));
// 		for (var team in manifest) {
// 			if (!fs.existsSync('data-collect/stand-scouting/' + manifest[team]) && fs.existsSync('/Volumes/1540/companal/stand-scouting/' + manifest[team])) {
// 				var dataJSON = fs.readFileSync('/Volumes/1540/companal/stand-scouting/' + manifest[team]);
// 				var data = JSON.parse(dataJSON);
// 				$('#m' + data.matchNumber + data.role).css('background-color', 'blue');
// 				$('#m' + data.matchNumber + data.role).css('color', 'white');
// 				$('#m' + data.matchNumber + data.role).text(findScout(data.scoutId).name);
// 				addToTotal(data.scoutId,' stand');
// 				manifestStand.push(manifest[team]);
// 				fs.writeFileSync('data-collect/stand-scouting/manifest.json', JSON.stringify(manifestStand));
// 				fs.writeFileSync('data-collect/stand-scouting/' + manifest[team],dataJSON);
// 			}
// 		}
// 		new Noty({
// 			text: 'Done importing data!',
// 			type: 'success'
// 		}).show();
//  	} else {
// 		new Noty({
// 			text: 'There is no flashdrive at /Volumes/1540/.',
// 			type: 'error'
// 		}).show();
//  	}
// }

//This function checks the data-collect folder, and resets the tables to account for data that has already been collected
function reload() {
	createTables()
	//importing stand data
	if (fs.existsSync("data-collect/stand-scouting/manifest.json")) {
		manifest = fs.readFileSync("data-collect/stand-scouting/manifest.json");
		for (var team in manifest) {
			var t = manifest[team]
			if (fs.existsSync("data-collect/stand-scouting/"+t)) {
				var data = JSON.parse(fs.readFileSync('data-collect/stand-scouting/'+t));
				$('#m' + data.matchNumber + data.role).css('background-color', 'blue');
				$('#m' + data.matchNumber + data.role).css('color', 'white');
				addToTotal(data.scoutId,'stand');
			}
		}
	}
	//importing pit data
	if (fs.existsSync("data-collect/pit-scouting/manifest.json")) {
		manifest = fs.readFileSync("data-collect/pit-scouting/manifest.json");
		for (var team in manifest) {
			var t = manifest[team]
			if (fs.existsSync("data-collect/pit-scouting/"+t)) {
				var data = JSON.parse(fs.readFileSync('data-collect/pit-scouting/'+t));
				addToTotal(data.scoutIds[0], 'pit');
				scoutTwo = findScout(data.scoutIds[1]);
				if (scoutTwo!=null) {
					addToTotal(scoutTwo.id, 'pit');
				}
			}
		}
	}
}

//exports data to a flashdrive
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

//given an ID, returns a Scout with that ID
//if the ID does not exist, returns null
function findScout(id) {
	for (x in scoutList) {
		if (scoutList[x].id == id) {
			return scoutList[x];
		}
	}
	return null;
}

//makes it so all tables are hidden
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

//creates the tables
function createTables() {
	$("#membersBody").html("<tbody id='membersBody'></tbody>")
	$("#matchBody").html("<tbody id='matchBody'></tbody>")
	$("#scheduleBody").html("<tbody id='scheduleBody'></tbody>")
	// Members Table
	for (x in scoutList) {
		var id = scoutList[x].id;
		var rs = '#' + id + 'row';
		var scout = scoutList[x];
		$('#membersBody').append('<tr id="' + id + 'row"></tr>');
		if (scout.total < scout.req) {
			$(rs).append('<td id="' + id + 'req">' + (scout.req - scout.total) + ' more matches</td>');
		} else {
			$(rs).append('<td id="' + id + 'req" style="background-color:#F5FFBF">Completed</td>');
		}
		$(rs).append('<td id="' + id + 'id">' + id + '</td>');
		$(rs).append('<td id="' + id + 'name">' + scout.name + '</td>');
		$(rs).append('<td id="' + id + 'num">' + scout.pit + '</td>');
		$(rs).append('<td id="' + id + 'num2">' + scout.stand + '</td>');
		$(rs).append('<td id="' + id + 'num3">' + scout.total + '</td>');
	}
	// // Teams Table
  // if (fs.existsSync('scouting/database.json')) {
  //   teams = fs.readFileSync('scouting/database.json');
  // } else {
  //   teams = JSON.parse(exec('curl -X GET "https://www.thebluealliance.com/api/v3/event/' + a + '/teams/simple" -H "accept: application/json" -H "X-TBA-Auth-Key: p2nxGJxqkJo5a8clThWbi1ZNQhy8CaKlJd4YM5TOFgbR4d7y4KLFU1RWhLANpM8N"', {encoding: 'utf-8'}));
  // }
	// for (x in teams) {
	// 	var tr = document.createElement('tr');
	// 	tr.setAttribute('id','r' + team + 'row');
	// 	$('#robotBody').append(tr);
	// 	var name = document.createElement('td');
	// 	name.setAttribute('id','r' + team + 'bot');
	// 	$('#r' + teams[x].team_number + '-row').append(name);
	// 	$('#r' + teams[x].team_number + 'bot').text(team);
	// 	var aname = document.createElement('td');
	// 	aname.setAttribute('id','r' + team + 'nm');
	// 	$('#r' + teams[x].team_number + 'row').append(aname);
	// 	$('#r' + teams[x].team_number + 'nm').text(teams[x].nickname);
	// 	var pit = document.createElement('td');
	// 	pit.setAttribute('id','r' + team + 'pit');
	// 	$('#r' + teams[x].team_number + 'row').append(pit);
	// 	$('#r' + teams[x].team_number + 'pit').text('False');
	// 	$('#r' + teams[x].team_number + 'pit').css('background-color','#ffdad1');
	// 	var stand = document.createElement('td');
	// 	stand.setAttribute('id','r' + team + 'stand');
	// 	$('#r' + teams[x].team_number + 'row').append(stand);
	// 	$('#r' + teams[x].team_number + 'stand').text('0');
	// }
	// Match Table
	for (match = 1; match <= Object.keys(matchSchedule).length; match++) {
		var rs = '#m' + match + 'row';
		$('#matchBody').append('<tr id="m' + match + 'row"></tr>');
		$(rs).append('<td id="m' + match + 'num">' + match + '</td>');
		all = "r" //alliance
    for (i = 1; i < 4; i++) {
      $(rs).append('<td style="width: 15%; background-color: #F5FFBF" id="m' + match + all + i + '">False</td>');
      if (all=="r" && i==3) {
				i=0
				all="b"
			}
    }
		// $(rs).append('<td style="width: 15%; background-color: #F5FFBF" id="m' + match + 'r1">False</td>');
		// $(rs).append('<td style="width: 15%; background-color: #F5FFBF" id="m' + match + 'r2">False</td>');
		// $(rs).append('<td style="width: 15%; background-color: #F5FFBF" id="m' + match + 'r3">False</td>');
		// $(rs).append('<td style="width: 15%; background-color: #F5FFBF" id="m' + match + 'b1">False</td>');
		// $(rs).append('<td style="width: 15%; background-color: #F5FFBF" id="m' + match + 'b2">False</td>');
		// $(rs).append('<td style="width: 15%; background-color: #F5FFBF" id="m' + match + 'b3">False</td>');
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

//Adds to a scout's total number of matches scouted
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

//sets the weight of pit scouting to the total matches scouted
function pitWeight(pw) {
	pitValue = pw;
}
//sets the required number of scouted matches
function requirement(req) {
	exemptionReq = req;
}
// *****************************************************************************
// Question Types:
exports.checkbox = function (a, b, c, d, e, f) {
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
      let color = c[i]['color'];
      var val = c[i]['value'] != undefined ? 'value="' + c[i]['value'] + '"' : '';
      var style = ((color != undefined) && (color.indexOf('#') < 0)) ? color : 'info';
      if (c[i]['text'] == undefined) {
        throw new Error('text cannot be undefined');
      }
      $('.bg-' + count).append('<span class="btn btn-' + count + '-' + (i + 1) +  ' scout-c scout-c-' + count + ' btn-outline-' + style + '" data-key="' + d + '"><input type="checkbox" ' + val + ' autocomplete="off" style="display: none;">' + c[i]['text'] + '</span>');
      if (color != undefined && color.indexOf('#') >= 0) {
        $('.btn-' + count + '-' + (i + 1))
          .css({color: color, borderColor: color})
          .mouseenter(function () {
            $(this).css({backgroundColor: color, color: 'white'});
          })
          .mouseleave(function () {
            if (!$(this).hasClass('active')) {
              $(this).css({background: '', color: color});
            }
          })
          .mousedown(function () {
            if (!$(this).hasClass('active')) {
              $(this)
                .css({backgroundColor: '', color: color, borderColor: color})
                .mouseenter();
            } else {
              $(this)
                .css({backgroundColor: '', color: color, borderColor: color})
                .mouseenter();
            }
          });
      }
    }
    if (e) {
      required.push(d)
    }
    if (f != undefined) {
      $('.scout-c-' + count).addClass(f);
    }
  } else {
    throw new Error('scout.init() not instantiated');
  }
};
exports.counter = function (a, b, c, d, e, f) {
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
    if (e) {
      required.push(d)
    }
    if (f != undefined) {
      $('.co-' + count).addClass(f);
    }
  } else {
    throw new Error('scout.init() not instantiated');
  }
};
exports.cycle = function (a, b, c, d, e, f) {
  if (init) {
    $(a).append(`
      <div class="cycle cy-` + count + `" style="text-align: center;">
        <h3>` + b + `</h3>
        <div class="btn-group cycle-group-` + count + `" data-toggle="buttons"></div>
        <br>
        <br>
        <button type="button" class="btn btn-outline-success cycle-submit cycle-submit-` + count + `" data-key="` + d + `" data-count="` + count + `">Submit This Cycle</button>
      </div>
    `);
    for (i = 0; i < c.length; i++) {
      let color = c[i]['color'];
      var val = c[i]['value'] != undefined ? 'value="' + c[i]['value'] + '"' : '';
      var style = color.indexOf('#') < 0 ? color : 'info';
      if (c[i]['text'] == undefined) {
        throw new Error('text cannot be undefined');
      }
      if (c[i]['color'] == undefined) {
        throw new Error('color cannot be undefined');
      }
      $('.cycle-group-' + count).append('<span class="btn btn-' + count + '-' + (i + 1) + ' scout-cy scout-cy-' + count + ' btn-outline-' + style + '" data-key="' + d + '"><input type="radio" ' + val + ' autocomplete="off" style="display: none;">' + c[i]['text'] + '</span>');
      if (color.indexOf('#') >= 0) {
        $('.btn-' + count + '-' + (i + 1))
          .css({color: color, borderColor: color})
          .mouseenter(function () {
            $(this).css({backgroundColor: color, color: 'white'});
          })
          .mouseleave(function () {
            $(this).css({backgroundColor: '', color: color});
          });
      }
    }
    if (e) {
      required.push(d);
    }
    if (f != undefined) {
      $('.scout-cy-' + count).addClass(f);
    }
  } else {
    throw new Error('scout.init() not instantiated');
  }
};
// exports.grid = function (a, b, c, d) {
//   if (init) {
//     count++;
//     $(a).append(
//       `<div class="grid g-` + count + `" style="text-align: center;">
//         <h3>` + b + `</h3>
//         <table class="table table-bordered">
//           <thead>
//             <tr class="tr-` + count + `" style="text-align: center;"></tr>
//           </thead>
//           <tbody class="tbody-` + count + `" style="text-align: center;"></tbody>
//         </table>
//         <br>
//         <br>
//       </div>`
//     );
//     for (i = 0; i < c.length; i++) {
//       $('.tr-' + count).append('<th scope="col">' + c[i] + '</th>');
//     }
//     for (i = 0; i < d.length; i++) {
//       $('.tbody-' + count).append(`<tr class="grid-row-` + i + `-` + count + `"></tr>`);
//       for (j = 0; j < c.length; j++) {
//         $('.grid-row-' + i + '-' + count).append(`<td><div class="btn-group grid-` + count + `-` + i + `" data-toggle="buttons"><span class="btn btn-outline-info scout-g" style="border-radius: 0.25rem !important;"><input type="radio">` + d[i] + `</span><div></td>`);
//         $('.grid-row-' + i + '-' + count).attr('data-group', c[j].toLowerCase().replace(/[\n\r]/g, ''));
//         console.log($('.grid-row-' + i + '-' + count).attr('data-group'));
//       }
//     }
//   } else {
//     throw new Error('scout.init() not instantiated');
//   }
// };
exports.input = function (a, b, c, d, e, f) {
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
    if (e) {
      required.push(d)
    }
    if (f != undefined) {
      $('.in-' + count).addClass(f);
    }
  } else {
    throw new Error('scout.init() not instantiated');
  }
};
exports.radio = function (a, b, c, d, e, f) {
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
      let color = c[i]['color'];
      var val = c[i]['value'] != undefined ? 'value="' + c[i]['value'] + '"' : '';
      var style = color.indexOf('#') < 0 ? color : 'info';
      if (c[i]['text'] == undefined) {
        throw new Error('text cannot be undefined');
      }
      if (c[i]['color'] == undefined) {
        throw new Error('color cannot be undefined');
      }
      $('.bg-' + count).append('<span class="btn btn-' + count + '-' + (i + 1) + ' scout-mc scout-mc-' + count + ' btn-outline-' + style + '" data-key="' + d + '"><input type="radio" ' + val + ' autocomplete="off" style="display: none;">' + c[i]['text'] + '</span>');
      if (color.indexOf('#') >= 0) {
        $('.btn-' + count + '-' + (i + 1))
          .css({color: color, borderColor: color})
          .mouseenter(function () {
            $(this).css({backgroundColor: color, color: 'white'});
          })
          .mouseleave(function () {
            $(this).css({backgroundColor: '', color: color});
          });
      }
    }
    if (e) {
      required.push(d)
    }
    if (f != undefined) {
      $('.scout-mc-' + count).addClass(f);
    }
  } else {
    throw new Error('scout.init() not instantiated');
  }
};
exports.noty = function (a) {
  return new Noty(a);
};
exports.slider = function (a, b, c, d, e, f) {
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
    if (f) {
      required.push(d)
    }
  } else {
    throw new Error('scout.init() not instantiated');
  }
};
exports.textarea = function (a, b, c, d, e, f) {
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
    if (e) {
      required.push(d)
    }
    if (f != undefined) {
      $('.txt-' + count).addClass(f);
    }
  } else {
    throw new Error('scout.init() not instantiated');
  }
};
// *****************************************************************************
// Other functions:
exports.chart = function (a, b) {
  return new Chart(a, b);
};
exports.done = function (a, b, c) {
  if (init) {
    count++;
    match++;
    if (arguments.length == 1 && b == undefined) {
      b = true;
    }
    if (b) {
      $('.btn-' + a.substring(6, a.length - 2) + '-next')
        .replaceWith(`<button class="btn btn-outline-success btn-done done-` + count + `">Done!</button>`)
        .removeClass('btn-' + a.substring(6, a.length - 2) + '-next')
        .show();
    } else {
      $(a).append(
        `<button class="btn btn-outline-success btn-done">Done!</button>`
      );
    }
    if (c != undefined) {
      $('.done-' + count).addClass(c);
    }
  } else {
    throw new Error('scout.init() not instantiated');
  }
};
exports.pie = function (a, b, c, d, e) {
  if (init) {
    count++;
    if (arguments.length == 4 && e == undefined) {
      e = [];
    }
    $(a).append(
      `<div class="pie p-` + count + `">
        <h3 style="text-align: center;">` + b + `</h3>
        <br>
        <canvas id='p-` + b.toLowerCase().replace(/\s+/g, '-') + `'></canvas>
        <br>
        <br>
      </div>`
    );
    var ctx = document.getElementById('p-' + b.toLowerCase().replace(/\s+/g, '-')).getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: e,
        datasets: [{
          backgroundColor: d,
          data: c
        }]
      }
    });
  } else {
    throw new Error('scout.init() not instantiated');
  }
};
exports.init = function (a, b) {
  initRole = a;
  initCount++;
  isSave = b ? true : false;
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
                Scout: <span class="num-change">Not Logged In</span>
              </h3>
            </div>
            <div class="col-sm-4 info-panel matchnum-wrap">
              <h3>Match Number:</h3>
              <br>
              <input class="form-control matchnum" type="number" value="` + parseInt(match) + `" style="text-align: center; font-size: 24pt;">
              <br>
              <button class="btn btn-outline-warning edit-matchnum" style="display: none; margin-left: 17.5vw;">Edit Match Number</button>
            </div>
            <div class="col-sm-4 info-panel next-back"></div>
          </div>
        </nav>`
      );
      $('.info-panel').css('height', $('.matchinfo').height());
      init = true;
    } else if (a == 'pit') {
      isPit = true;
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
			init = true
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
    } else if (a == 'blank') {
      init = true;
    } else {
      throw new Error('Use \'scout\', \'pit\', \'database\', \'analysis\', \'blank\'.');
      init = false;
    }
    return init;
  } else {
    throw new Error('scout.init() instantiated ' + initCount + ' times');
  }
};
exports.login = function (a, b, c) {
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
          if (isStand) {
            $('.btn-next, .btn-back').show();
          } else {
            $('.btn-next').show();
          }
          $('.num-change').text(scouts[act]);
        }
      } else if (act == b) {
        $('.role').fadeIn();
      } else {
        new Noty({
          text: 'No scout at this number',
          type: 'error'
        }).show();
      }
    });
    if (c != undefined) {
      $('.l-' + num).addClass(c);
    }
  } else {
    throw new Error('scout.init() not instantiated');
  }
};
exports.page = function (a, b, c) {
  if (init) {
    var sum = 0;
    if (!isStand) {
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
    } else {
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
          <br>
          <br>
        </div>`
      );
      $('.next-back').replaceWith(`
        <div class="nav-btns row">
          <div class="col-sm-6">
            <button class="btn btn-outline-danger btn-back btn-` + a.toLowerCase().replace(/\s+/g, '-') + `-back" data-page="body-div-` + a.toLowerCase().replace(/\s+/g, '-') + `" style="margin-left: 5%;"><i class="fa fa-chevron-left"></i> Back</button>
          </div>
          <div class="col-sm-6">
            <button class="btn btn-outline-success btn-next btn-` + a.toLowerCase().replace(/\s+/g, '-') + `-next" data-page="body-div-` + a.toLowerCase().replace(/\s+/g, '-') + `">Next <i class="fa fa-chevron-right"></i></button>
          </div>
        </div>
      `);
      standNav.push('body-div-' + a.toLowerCase().replace(/\s+/g, '-'));
    }
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
    if (c != undefined) {
      $('body-div' + a.toLowerCase().replace(/\s+/g, '-')).addClass(c);
    }
  } else {
    throw new Error('scout.init() not instantiated');
  }
};
exports.text = function (a, b, c, d) {
	if (init) {
		count++;
		$(a).append(
			`<p class="text-` + count + `" style="text-align: center; font-size: ` + c + `pt;">` + b + `</p>`
		);
    if (d != undefined) {
      $('text-' + count).addClass(d);
    }
	} else {
    throw new Error('scout.init() is not instantiated');
  }
};
exports.flashdrive = function() {
	// if (init) {
		addSettings();
 		$(".settings-menu").append(
			`<a class="dropdown-item save-to-flash" href="#">Save to Flashdrive</a>`
		);
	// }
}
exports.update = function() {
	// if (init) {
		addSettings();
		$(".settings-menu").append(
			`<a class="dropdown-item update" href="#">Update</a>`
		);
	// }
};
exports.bluetooth = function() {
  // if (init) {
    addSettings();
    $(".settings-menu").append(
      `<a class="dropdown-item bluetooth" href="#">Bluetooth Sync</a>`
    );
  // }
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
exports.database = function () {
	exec("C:/Python27/python.exe Windows_Bluetooth_Server.py") //runs the server bluetooth code
	importScouts();
	importSchedule();
	setExemptions(exemptionReq);
	//adds all of the code to the html
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
			<br><br><br><br><br><br><br><br><br>
			<nav class='center' style='background-color:#ededed;z-index:1;width:100%' data-spy='affix'>
        <br>
				<h2 style='position:relative;top:14px;'>Database App</h2>
				<br>
				<!--<button class='btn-warning btn pit' type='button'>Import Pit Data</button>
				<button class='btn-warning btn stand' type='button'>Import Stand Data</button>-->
				<button class='btn-danger btn reload' type='button'>Reload</button>
				<button class='btn-success btn export' type='button'>Export Data</button>
				<br>
				<br>
				<button class='sect act btn-primary btn members' type='button' style='margin-bottom: 10px;'>Members</button>
			 	<!--<button class='sect btn-primary btn teams' type='button' style='margin-bottom: 10px;'>Teams</button>-->
				<button class='sect btn-primary btn matches' type='button' style='margin-bottom: 10px;'>Matches</button>
				<button class='sect btn-primary btn schedule' type='button' style='margin-bottom:10px'>Match Schedule</button>
				<br>
			</nav>
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
					<tbody id='membersBody'>
					</tbody>
				</table>
			</div>
			<!--<div id='teams' class='center'>
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
			</div>-->
			<div id='matches' class='center'>
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
			<div id='schedule' class='center'>
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
		// $('.teams').click(function(){
		// 	resetTables();
		// 	$('#teams').show();
		// 	$('.teams').addClass('act');
		// });
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
		createTables();
		resetTables();
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
  if (!fileExist) {
    save();
  }
// *****************************************************************************
  $('.scout-c').click(function () {
    var name = $(this).attr('data-key');
    var value = $(this).children().attr('value') == undefined ? $(this).text() : $(this).children().val();
    var index = cArr.indexOf('"' + value + '"');
    if (!$(this).hasClass('active')) {
      typeof value == 'string' && value != 'true' && value != 'false' ?
        cArr.push('"' + value + '"') :
        cArr.push(value);
    } else {
      cArr.splice(index, 1);
    }
    json[name] = cArr;
    // eval('json.' + name + ' = [' + cArr + ']');
    save();
  });
  $('.scout-co').click(function () {
    var name = $(this).attr('data-key');
    var value = $('.' + $(this).attr('data-key') + '-co').val();
    json[name] = value;
    // eval('json.' + name + ' = ' + value);
    save();
  });
  $('.cycle-submit').click(function () {
    var name = $(this).attr('data-key');
    var countNum = $(this).attr('data-count');
    $('.scout-cy-' + countNum).each(function () {
      if ($(this).hasClass('active')) {
        var value = $(this).attr('value') == undefined ? $(this).text() : $(this).attr('value');
        if (json[name] == undefined) {
          json[name] = [];
        }
        typeof value == 'string' && value != 'true' && value != 'false' ?
          json[name].push('"' + value + '"') :
          json[name].push(value);
        save();
      } else {
        new Noty({
          text: 'Please select a value',
          type: 'error'
        }).show();
      }
    });
  });
  // $('.scout-g').click(function () {
  //   var key = $(this).parent().attr('data-group');
  //   eval('json.' + key + ' = "' + $(this).text().toLowerCase().replace(/[\n\r]/g, '') + '"');
  //   save();
  // });
  $('.scout-i').keyup(function () {
    var name = $(this).attr('data-key');
    var value = $(this).val();
    json[name] = value;
    // eval('json.' + name + ' = "' + value + '"');
    save();
  });
  $('.scout-mc').click(function () {
    var name = $(this).attr('data-key');
    var value = $(this).children().attr('value') == undefined ? $(this).text() : $(this).children().val();
    typeof value == 'string' && value != 'true' && value != 'false' ?
      /* eval('json.' + name + ' = "' + value + '"') */ json[name] = '"' + value + '"' :
      json[name] = value;
      // eval('json.' + name + ' = ' + value);
    save();
  });
  $('.scout-t').keyup(function () {
    var name = $(this).attr('data-key');
    var value = $(this).val();
    json[name] = value;
    // eval('json.' + name + ' = "' + value + '"');
    save();
  });
// *****************************************************************************
  $('.btn-back').click(function () {
    var page = $(this).attr('data-page');
    var index = pages.indexOf(page);
    if (!isStand) {
      if (pages[index - 1] != undefined) {
        $('.' + page).fadeOut(function () {
          $('.' + pages[index - 1]).fadeIn();
        });
      }
    } else {
      if (pages[index - 1] == undefined) {
        $(this).attr('data-page', pages[1]);
      }
      if (pages[index - 1] != undefined) {
        $('.' + page).fadeOut(function () {
          $('.' + pages[index - 1]).fadeIn();
        });
        $(this).attr('data-page', pages[index - 1]);
        $('.btn-next').attr('data-page', pages[index - 1]);
      }
    }
  });
  $('.btn-done').click(function () {
    var reqTrue = [];
    for (i = 0; i < required.length; i++) {
      if (!json.hasOwnProperty(required[i])) {
        new Noty({
          text: 'Please complete all required fields.',
          type: 'error'
        }).show();
        break;
      }
      reqTrue.push(true);
      if (reqTrue[(required.length - 1)]) {
        save();
        fs.writeFileSync('./scouting/match.txt', match);
        window.location.reload();
      }
    }
  });
  $('.btn-next').click(function () {
    var page = $(this).attr('data-page');
    var index = pages.indexOf(page);
    if (pages[index + 1] != undefined) {
      $('.' + page).fadeOut(function () {
        $('.' + pages[index + 1]).fadeIn();
      });
      if (isStand) {
        $(this).attr('data-page', pages[index + 1]);
        $('.btn-back').attr('data-page', pages[index + 1]);
      }
    }
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
  // *****************************************************************************
  $('.update').click(function () {
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
  $('.bluetooth').click(function () {
		if (fs.existsSync("data/manifest.json")) {
			m = JSON.parse(fs.readFileSync("data/manifest.json"));
			for (stuff in m) {
				if (fs.existsSync("data/"+m[stuff])) {
					data = JSON.stringify(JSON.parse(fs.readFileSync("data/"+m[stuff])))
					try {
						exec('C:/Python27/python.exe Windows_Bluetooth_Client.py '+uuid+" "+addr+" "+encodeURIComponent(data));
					} catch(_) {
						try {
							exec('C:/Python27/python.exe Windows_Bluetooth_Client.py '+uuid+" "+addr+" "+encodeURIComponent(data));
						} catch(_) {
							console.log("lol you failed")
						}
					}
				}
			}
		}
  });
// *****************************************************************************
  $('.' + pages[0]).show();
  $('.page-pane').each(function () {
    if ($(this).attr('class').substr(10) == pages[0]) {
      if (!isStand) {
        $('.btn-' + $(this).attr('class').substr(19) + '-back').remove();
        $('.btn-' + $(this).attr('class').substr(19) + '-next').css('margin-left', '5%');
      } else {
        $('.btn-' + $(this).attr('class').substr(19) + '-back').hide();
        $('.btn-' + $(this).attr('class').substr(19) + '-next').css('margin-left', '5%');
      }
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
  $('.num-change').click(function () {
    $(this).attr('contenteditable', 'true');
    $(this).text(json.scout);
  });
  $('.num-change').keyup(function (event) {
    if (event.which == 13) {
      if (scouts[$('.num-change').val()] != undefined) {
        json.scout = $('.num-change').val();
        $('.num-change').val(scouts[$('.num-change').val()]);
        $(this).attr('contenteditable', 'false');
      } else {
        new Noty({
          text: 'No scout at this number',
          type: 'error'
        }).show();
      }
    }
  });
});
