/* global _ */
 
/*
 * Complex scripted dashboard
 * This script generates a dashboard object that Grafana can load. It also takes a number of user
 * supplied URL parameters (in the ARGS variable)
 *
 * Global accessable variables
 * window, document, $, jQuery, ARGS, moment
 *
 * Return a dashboard object, or a function
 *
 * For async scripts, return a function, this function must take a single callback function,
 * call this function with the dashboard object
 */
 
'use strict';

// accessible variables in this scope
var window, document, ARGS, $, jQuery, moment, kbn;

return function(callback) {
 
//  var unitsToFormat = {"C" : "celcius"};
 
  // Setup some variables
  var dashboard;
 
  // Intialize a skeleton with nothing but a rows array and service object
  dashboard = {
    rows : [],
    services : {}
  };
 
  // Set default time
  // time can be overriden in the url using from/to parameters, but this is
  // handled automatically in grafana core during dashboard initialization
  dashboard.time = {
      from: "now-7d",
      to: "now"
  };
  dashboard.timezone = "browser";
 
  var meas = "";
  var field = "";
  var tags = [];
  var groupBy = [];
  var sourceType = "auto";
  var dataSource = "auto";
  var format = "short";
  var pointMode = "null";
  var pointRadius = 1;
  var tagKeys = "";
  var dropDown;
  var aliasString = ""; // Used to store the aliases for the tag keys pushed to the dashboard
 
  if(!_.isUndefined(ARGS.meas)) {
    meas = ARGS.meas;
  }
 
  if(!_.isUndefined(ARGS.field)) {
    field = ARGS.field;
  }

/* 
      if (antenna.length == 0) {
          // single antenna by default
          antenna = pvName.substring(0,4)
      }
      var antTitle = "";
      var antTemplateText = antenna;
      var antTemplateValue = antenna;
      var tags = result.tags.slice();
      var groupBy = [];
      var alias;
*/ 
      groupBy.push({"params": [ "$ti" ], "type": "time" });

$.ajax( {
		method: 'GET',
		url: "http://akingest01.atnf.csiro.au:5000/influx?",
		type: 'POST',
		data: { measurement: meas, field: field},
		datatype: 'json'
	}).done(function(result) {

/*      // setup templates
$.ajax( {
		method: 'GET',
		url: "http://akingest01.atnf.csiro.au:8086/query?pretty=true",
		type: 'POST',
		data: { db: 'askap', q:'show tag keys from "'+meas+'"'},
		datatype: 'json'
	}).done(function(result) {*/

// TODO: Indent this, needs a cleanup
//console.log(result);
//tagKeys = result["results"][0]["series"][0]["values"];
tagKeys = result["tags"];
dashboard.templating = { "list": [
      {
	"auto": true,
	"auto_count": 500,
	"auto_min": "10s",
	"current": {
	  "text": "auto",
	  "value": "$__auto_interval"
	},
	"datasource": null,
	"hide": 0,
	"includeAll": false,
	"label": "Time Interval",
	"multi": false,
	"name": "ti",
	"options": [
	  {
	    "selected": true,
	    "text": "auto",
	    "value": "$__auto_interval"
	  },
	  {
	    "selected": false,
	    "text": "1m",
	    "value": "1m"
	  },
	  {
	    "selected": false,
	    "text": "10m",
	    "value": "10m"
	  },
	  {
	    "selected": false,
	    "text": "30m",
	    "value": "30m"
	  },
	  {
	    "selected": false,
	    "text": "1h",
	    "value": "1h"
	  },
	  {
	    "selected": false,
	    "text": "6h",
	    "value": "6h"
	  },
	  {
	    "selected": false,
	    "text": "12h",
	    "value": "12h"
	  },
	  {
	    "selected": false,
	    "text": "1d",
	    "value": "1d"
	  },
	  {
	    "selected": false,
	    "text": "7d",
	    "value": "7d"
	  },
	  {
	    "selected": false,
	    "text": "14d",
	    "value": "14d"
	  },
	  {
	    "selected": false,
	    "text": "30d",
	    "value": "30d"
	  }
	],
	"query": "1m,10m,30m,1h,6h,12h,1d,7d,14d,30d",
	"refresh": 2,
	"type": "interval"
      }
    ]
  };

// set a title
dashboard.title = field; // TODO:Need to think of a way to generate a good title
dashboard.hideControls = true;
//console.log(tagKeys);

// This section here needs to push all of the dropdown objects to the dashboard.
// It returns an array of three elements - the first is to be pushed to dashboard, the second to tags and the third to groupBy
for(var i=0; i<tagKeys.length; i++) {
	//console.log(tagKeys[i][0]);
	if(!(tagKeys[i][0].includes("?"))) {
		dropDown = dropDownGen(tagKeys[i], meas, i);
		//console.log(dropDown);
		dashboard.templating.list.push (dropDown[0]);
		tags.push (dropDown[1]);
		groupBy.push (dropDown[2]);
	}
}
groupBy.push({"params": [ "null" ], "type": "fill" });

/*
dashboard.templating.list.push ({
    "allValue": null,
    "current": {
      "tags": [],
      "text": "All",
      "value": [
	"All"
      ]
    },
    "datasource": "askap",
    "hide": 0,
    "includeAll": true,
    "label": "Antennas",
    "multi": true,
    "name": "antennas",
    "options": [],
    "query": "show tag values from \"ade.paf.current\" with key = \"antenna\"",
    "refresh": 1,
    "regex": "",
    "sort": 0,
    "tagValuesQuery": "",
    "tags": [],
    "tagsQuery": "",
    "type": "query",
    "useTags": false
});
*/

dashboard.rows.push({
  "collapse": false,
  "height": "250px",
  "panels": [
    {
      "aliasColors": {},
      "bars": false,
      "datasource": "askap",
      "editable": true,
      "error": false,
      "fill": 0,
      "grid": {},
      "id": 1,
      "legend": {
	"avg": false,
	"current": false,
	"max": true,
	"min": true,
	"show": true,
	"total": false,
	"values": true
      },
      "lines": true,
      "line1idth": 1,
      "links": [],
      "nullPointMode": pointMode,
      "percentage": false,
      "pointradius": pointRadius,
      "points": (pointRadius>0),
      "renderer": "flot",
      "seriesOverrides": [
	    {
	      //"alias": "Ambient Temp",
	      "yaxis": 2
	    }
      ],
      "span": 12,
      "stack": false,
      "steppedLine": false,
      "targets": [
	{
	  "alias" : "", // Populate this field later
	  "dsType": "influxdb",
	  "groupBy": groupBy,
	  "measurement": meas,
	  "policy": "default",
	  "refId": "A",
	  "resultFormat": "time_series",
	  "select": [
	    [
	      {
		"params": [
		  field
		],
		"type": "field"
	      },
	      {
		"params": [],
		"type": "mean"
	      }
	    ]
	  ],
	  "tags": tags
	}
      ],
      "thresholds": [],
      "timeFrom": null,
      "timeShift": null,
      "title": result["desc"],
      "tooltip": {
	"msResolution": true,
	"shared": true,
	"sort": 0,
	"value_type": "cumulative"
      },
      "type": "graph",
      "xaxis": {
	"mode": "time",
	"name": null,
	"show": true,
	"values": []
      },
      "yaxes": [
	{
	  "format": format,
	  "label": result["units"],
	  "logBase": 1,
	  "max": null,
	  "min": null,
	  "show": true
	},
	{
	  "format": "short",
	  "label": null,
	  "logBase": 1,
	  "max": null,
	  "min": null,
	  "show": true
	}
      ]
    }
  ],
  "repeat": null,
  "repeatIteration": null,
  "repeatRowId": null,
  "showTitle": false,
  "title": "Row",
  "titleSize": "h6",
});

// Make a comma seperated string for the tag aliases to increase readability of the plot
for(i=0; i<tagKeys.length; i++) {
	aliasString += "[[tag_"+tagKeys[i]+"]]";
	
	if(i != (tagKeys.length-1)) {
		aliasString += ", ";	
	}
}

dashboard.rows[0]["panels"][0]["targets"][0].alias = aliasString;

callback(dashboard);
}).fail(function(result) {
	dashboard.rows.push({
		title: 'Chart',
		height: '300px',
		panels: [
			{
				title: "Error",
				type: 'text',
				span: 12,
				fill: 1,
				content: 'Failed to lookup name'
			}
		]
	});

	callback(dashboard);
})
};

//$( document ).ajaxStop( function() { callback(dashboard); });

function dropDownGen(key, meas, i) {
	//console.log(key+" "+meas);

	var retVal = [{
			"allValue": null,
			"current": {
			"tags": [],
			"text": "All",
			"value": [ "$__all" ]
			},
			"datasource": "askap",
			"hide": 0,
			"includeAll": true,
			"label": key, //Antennas
			"multi": true,
			"name": key, //antennas
			"options": [],
			"query": "show tag values from \""+meas+"\" with key =\""+key+"\"",
			"refresh": 1,
			"regex": "",
			"sort": 0,
			"tagValuesQuery": "",
			"tags": [],
			"tagsQuery": "",
			"type": "query",
			"useTags": false
		      },
	   	      {
			"operator" : '=~',
	    	       	"key"       : key,
	    	       	"value"     : "/^$"+key+"$/"
	   	      },
		      {
			"params": [ key ], 
			"type": "tag"
		      }
	];

	if(i != 0) {
		retVal[1].condition = "AND";
	}
	//console.log(retVal);
	return retVal;
}
