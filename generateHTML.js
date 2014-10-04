var fs = require('fs'),
  parser = require('xml2json'),
  _ = require('underscore'),
  argv = require('minimist')(process.argv.slice(2));

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

  /* 
  * Balsamiq Mockups places all controls in an absolute position.
  * Any difference between measuredHeight/Width is whitespace at the top left of the view.
  */

  var viewLeftPos = jsobject.mockup.measuredW - jsobject.mockup.mockupW - 1;
  var viewTopPos = jsobject.mockup.measuredH - jsobject.mockup.mockupH - 1;

  /* Now we iterate through the full list of controls */
  _.each(jsobject.mockup.controls.control, function(value, key, list) {
    
    var symbol = "";
    var topPos;
    var leftPos;

    if (value.controlProperties) {
      if (value.controlProperties.src) {
       symbol = value.controlProperties.src;
      };
    };

    topPos = value.y - viewTopPos;
    leftPos = value.x - viewLeftPos;


      if (value.controlTypeID ===  'com.balsamiq.mockups::Button') {
        html = html + '<button style="' +
            'position: absolute; ' +
            'top: ' + topPos + '; ' +
            'left: ' + leftPos + '; ' +
            '">' +
            value.controlProperties.text +
            '</button>';

      } else if (value.controlTypeID === 'com.balsamiq.mockups::Title') {
          html = html + '<h2 style="' +
              'position: absolute; ' +
              'top: ' + topPos + '; ' +
              'left: ' + leftPos + '; ' +
              'color: red;' +
              '">' +
              value.controlProperties.text +
              '</h2>';

      } else if (value.controlTypeID === 'com.balsamiq.mockups::Icon') {
          html = html + '<div style ="' +
            'border: 1px solid black; ' +
            'position: absolute; ' +
            'overflow: hidden; ' +
            'top: ' + topPos + '; ' +
            'left: ' + leftPos + '; ' +
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
            'top: ' + topPos + '; ' +
            'left: ' + leftPos + '; ' +
            'height: ' + value.h + '; ' +
            'width: ' + value.w + '; ' +
            '">' +
            value.controlTypeID +
            '</div>';
      };

      groupTest(value);
  });
  
  // Write json as output if required:
  // var prettyjson = JSON.stringify(jsobject, null, 2);
  // fs.writeFile('output/json/' + argv.file + '.json', prettyjson);

  fs.writeFile('output/html/' + argv.file + '.html', html);
});
