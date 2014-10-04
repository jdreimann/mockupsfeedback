var fs = require('fs'),
  parser = require('xml2json'),
  _ = require('underscore'),
  argv = require('minimist')(process.argv.slice(2)),
  createElement = require('create-element');

fs.readFile(argv.file + '.bmml', 'utf8', function (err,data) {

  if (err) {
    return console.log(err);
  }

  var json = parser.toJson(data); //returns a string containing the JSON structure by default
  var jsobject = JSON.parse(json);

  var html = "";

  html += '<!DOCTYPE html><html><head>' +
            '<title>' + argv.file + '</title>' +
            '<link rel="stylesheet" type="text/css" href="style.css">' +
            '</head><body>';

  var groupTest = function (value, groupTopPos, groupLeftPos) {
    if (value.controlTypeID !== "__group__") {
      return;
    };

    _.each(value.groupChildrenDescriptors.control, function (value, key, list) {
      console.log("    " + value.controlTypeID);

      if (value.controlTypeID === 'com.balsamiq.mockups::Title') {
          
        html += createElement(
                  'h1', {
                    style: [
                      'top: ' + (groupTopPos + value.y) + 'px;',
                      'left: ' + (groupLeftPos + value.x) + 'px;',
                      'z-index: ' + value.zOrder + ';'
                    ],
                    class: 'title'  
                  },
                  decodeURI(value.controlProperties.text)
                );
      } else {
        console.warn(
        'WARN Group Item: ' +
        'ID: ' + value.controlID + ', ' +
        'Type: ' + value.controlTypeID + ', '
        );
      };

      groupTest(value, groupTopPos, groupLeftPos);
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

      html += createElement(
          'button', {
            style: [
              'top: ' + topPos + 'px;',
              'left: ' + leftPos + 'px;',
              'z-index: ' + value.zOrder + ';'
            ],
            class: 'button'
          },
          decodeURI(value.controlProperties.text)
        );

    } else if (value.controlTypeID === 'com.balsamiq.mockups::Title') {

      html += createElement(
          'h1', {
            style: [
              'top: ' + topPos + 'px;',
              'left: ' + leftPos + 'px;',
              'z-index: ' + value.zOrder + ';'
            ],
            class: 'title'  
          },
          decodeURI(value.controlProperties.text)
        );

    } else if (value.controlTypeID === 'com.balsamiq.mockups::Icon') {

      html += createElement(
        'div', {
          style: [
            'top: ' + topPos + 'px;',
            'left: ' + leftPos + 'px;',
            'z-index: ' + value.zOrder + ';',
            'height: ' + value.measuredH + 'px;',
            'width: ' + value.measuredW + 'px;'
          ],
          class: 'icon'  
        },
        decodeURI(value.controlProperties.icon)
      );

    } else {
      // Unknown element type
      console.warn(
        'WARN: ' +
        'ID: ' + value.controlID + ', ' +
        'Type: ' + value.controlTypeID + ', ' +
        'Symbol: ' + symbol
      );

      html += createElement(
          'div', {
            style: [
              'top: ' + topPos + 'px;',
              'left: ' + leftPos + 'px;',
              'height: ' + value.h + 'px; ',
              'width: ' + value.w + 'px; ',
              'z-index: ' + value.zOrder + ';'
            ],
            class: 'unknown'  
          },
          value.controlTypeID
        );
    };

    groupTest(value, topPos, leftPos);
  });
  
  html += '</body></html>';

  // Write json as output if required:
  // var prettyjson = JSON.stringify(jsobject, null, 2);
  // fs.writeFile('output/json/' + argv.file + '.json', prettyjson);

  fs.writeFile('output/html/' + argv.file + '.html', html);
});
