var fs = require('fs'),
  parser = require('xml2json'),
  _ = require('underscore'),
  argv = require('minimist')(process.argv.slice(2)),
  mkdirp = require('mkdirp');

var xml = fs.readFile(argv.file + '.bmml', 'utf8', function (err,data) {

  if (err) {
    return console.log(err);
  }

  var json = parser.toJson(data); //returns a string containing the JSON structure by default
  var jsobject = JSON.parse(json);

  var html = "";

  var groupTest = function (value) {
    if (value.controlTypeID !== "__group__") {
      return;
    };

    var minx = value.x;
    var miny = value.y;

    _.each(value.groupChildrenDescriptors.control, function (value, key, list) {
      console.log("    " + value.controlTypeID);

      if (value.controlTypeID === 'com.balsamiq.mockups::Title') {
          html = html + '<h2 style="' +
              'position: absolute; ' +
              'top: ' + (miny + value.y) + '; ' +
              'left: ' + (minx + value.x) + '; ' +
              'color: red;' +
              '">' +
              value.controlProperties.text +
              '</h2>';
      };
    });
  };

  _.each(jsobject.mockup.controls.control, function(value, key, list) {
    
    var symbol = "";

    if (value.controlProperties) {
      if (value.controlProperties.src) {
       symbol = value.controlProperties.src;
      };
    };

      if (value.controlTypeID ===  'com.balsamiq.mockups::Button') {
        html = html + '<button style="' +
            'position: absolute; ' +
            'top: ' + value.y + '; ' +
            'left: ' + value.x + '; ' +
            '">' +
            value.controlProperties.text +
            '</button>';

      } else if (value.controlTypeID === 'com.balsamiq.mockups::Title') {
          html = html + '<h2 style="' +
              'position: absolute; ' +
              'top: ' + value.y + '; ' +
              'left: ' + value.x + '; ' +
              'color: red;' +
              '">' +
              value.controlProperties.text +
              '</h2>';

      } else if (value.controlTypeID === 'com.balsamiq.mockups::Icon') {
          html = html + '<div style ="' +
            'border: 1px solid black; ' +
            'position: absolute; ' +
            'overflow: hidden; ' +
            'top: ' + value.y + '; ' +
            'left: ' + value.x + '; ' +
            'height: ' + value.measuredH + '; ' +
            'width: ' + value.measuredW + '; ' +
            'background-color: green' +
            '">' +
            value.controlProperties.icon +
            '</div>';

      } else {
        // unhandled case
        console.warn(
          'WARN: ' +
          'ID: ' + value.controlID + ', ' +
          'Type: ' + value.controlTypeID + ', ' +
          'Symbol: ' + symbol
        );

        html = html + '<div style="' +
            'border: 1px solid black; ' +
            'position: absolute; ' +
            'top: ' + value.y + '; ' +
            'left: ' + value.x + '; ' +
            'height: ' + value.h + '; ' +
            'width: ' + value.w + '; ' +
            '">' +
            value.controlTypeID +
            '</div>';
      };

      groupTest(value);
  });
    //console.log(jsobject.mockup.controls);
  var prettyjson = JSON.stringify(jsobject, null, 2);
  
  // Write json as output if required
  // fs.writeFile('output/json/' + argv.file + '.json', prettyjson);
  
  mkdirp('/output/html', function (err) {
    if (err) console.error(err)
    else console.log('pow!')
  });
  
  fs.writeFile('output/html/' + argv.file + '.html', html);
});
