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
  panels : []
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

dashboard.panels.push({
        title: 'ASKAP Tree',
        type: 'stuartbuchan-tree-panel',
        fill: 1,
        linewidth: 2,
        "gridPos": {
            "h": 23,
            "w": 24,
            "x": 0,
            "y": 0
        },
        tooltip: {
          shared: true
        }
});

dashboard.panels.push({ // Simply create a panel displaying the text "Failed to lookup name"
            title: "Usage",
            type: 'text',
            fill: 1,
            "gridPos": {
                "h": 5,
                "w": 9,
                "x": 0,
                "y": 23
            },
            mode: "markdown",
            content: "* Click on nodes to drill towards a measurement point in that branch.\n* Upon reaching a field to plot at the end of a branch (signified by the text appearing to the right of the node), left clicking will launch a time series plot in a new tab. Right clicking will launch a discrete time plot in a new tab.\n* Holding down control and left clicking on a node will issue an alert containing a URL to the location of the node clicked on. Pasting this URL into your browser will navigate automatically to this location."
});


dashboard.templating = { "list": [
      {
        "allFormat": "glob",
        "allValue": null,
        "current": {
          "tags": [],
          "text": "Dots",
          "value": [
            "Dots"
          ]
        },
        "datasource": null,
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
        "refresh": 0,
        "type": "custom"
      }
]};

return dashboard;
