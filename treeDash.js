/* global _ */

/*
 * Complex scripted dashboard
 * This script generates a dashboard object that Grafana can load. It also takes a number of user
 * supplied URL parameters (in the ARGS variable)
 *
 * Return a dashboard object, or a function
 *
 * For async scripts, return a function, this function must take a single callback function as argument,
 * call this callback function with the dashboard object (look at scripted_async.js for an example)
 */

'use strict';

// accessible variables in this scope
var window, document, ARGS, $, jQuery, moment, kbn;

// Setup some variables
var dashboard;

// Initialize a skeleton with nothing but a rows array and service object
dashboard = {
  rows : [],
};

// Set a title
dashboard.title = 'ASKAP Tree';

// Set default time
// time can be overridden in the url using from/to parameters, but this is
// handled automatically in grafana core during dashboard initialization
dashboard.time = {
  from: "now-6h",
  to: "now"
};

var rows = 1;
var seriesName = 'argName';

dashboard.rows.push({
    title: 'ASKAP Tree',
    //height: '300px',
    panels: [
      {
        title: 'ASKAP Tree',
        type: 'stuartbuchan-tree-panel',
        span: 12,
        fill: 1,
        linewidth: 2,
        tooltip: {
          shared: true
        }
      }
    ]
});

dashboard.templating = { "list": [{
      "allValue": null,
      "current": {
		"tags": [],
		"text": "Dots",
		"value": [ "Dots" ]
      },
      "hide": 0,
      "includeAll": false,
      "label": "Display Options",
      "multi": true,
      "name": "displayOptions",
      "options": [
		{
		    "selected": true,
		    "text": "Dots",
		    "value": "Dots"
		},
		{
		    "selected": false,
		    "text": "Lines",
		    "value": "Lines"
		}
      ],
      "query": "Dots, Lines",
      "type": "custom"
}]};

return dashboard;
