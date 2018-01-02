function makeTree(cont) {
// Initialise the tree with the subsystems to be populated by call to influxDB
	$.ajax( {
		method: 'GET',
		url: "http://akingest01.atnf.csiro.au:8086/query?pretty=true",
		type: 'POST',
		data: { db: 'askap', q:'show series from "metadata.toc"'}, // Gets the tree structure information down to measurement name in a json object
		datatype: 'json'
	}).done(function(result) { 
		window.treeData = {
			"name": "ASKAP",
			"children": []
		};

		// ****** Variable Declarations ******
		var map = result["results"][0]["series"][0]["values"]; // Array objects found in the database. Needs to be parsed still.
		var len = map.length;
		var tempStrings = null;; // Variable to hold array of strings returned when the strings returned by this jquery call are split on the "," character.
		var tempObj = null;; // Temporary object used to create children nodes when required.
		var l1names = []; // Keeps track of the node names that have been assigned to level 1 to avoid double-ups.
		var l2names = []; // As above, but with level 2
		var l1nodeName = null;; // Temporary string to hold the level 1 node name.
		var l2nodeName = null;; // As above.
		var description = null; // Temporary string to hold the description of the node being generated.
		var madeNode = false; // Boolean variable used with the name arrays above to check whether the node being looked at has already been generated.
		var loc = 0; // Variable to hold location of node on level 1.
		var locL2 = 0; // Variable to hold location of node on level 2.
		var locMeas = 0; // Vaiable to hold location of the measurement name node.
		var i = 0; // For loop incrementer.
		var j = 0; // As above.
		var workingNode = null; // Used for predefined expansion of tree by user supplied arguments in URL
		var nextNode = null; // As above.

		// If the user has been linked to a certain location in the tree, parse the information located in the URL to expand the branch
		var url_string = window.location.href;
		var url = new URL(url_string);
		var locLink = url.searchParams.get("locLink");

		// Loop through each object returned by the jquery call, using the returned strings to make the tree structure.
		for(i = 0; i<len; i++) {
			loc = 0;
			locL2 = 0;
			description = null;
			tempStrings = result["results"][0]["series"][0]["values"][i][0].split(","); // Split the string on the "," character, allowing easier parsing.
			if(tempStrings.length == 5) { // Indicates that the description has been included in the metadata
				l1nodeName = tempStrings[2].split("level1=")[1].replace("\\", "").replace("\\ ", " "); // Grab information after "level1=" and get rid of "\" charaters
				l2nodeName = tempStrings[3].split("level2=")[1].replace("\\", "").replace("\\ ", " ");
				description = tempStrings[1].split("desc=")[1].replace("\\", "").replace("\\ ", " ");
				measurement = tempStrings[4].split("measurement=")[1];
				madeNode = check(l1names, l1nodeName); // Passes control to a function to check whether the node name has already been assigned a node.
				// If the node has not been made
				if(!madeNode) {
					tempObj = newNode(l1nodeName); // Creates a new node and returns it into tempObj.
					l1names.push(tempObj.name); // Pushes the name of the node to the array keeping track of assigned nodes.
					treeData["children"].push(tempObj); // Pushes the node onto the 1st level of the tree.
				}

				// Cycle through the children on level 1 to find the location of the node to append the child on level 2 to. This needs to be done as if it is already
				// assigned previously, it will not be assigned again and hence it is pointless to grab the location of the node inside the above conditional as it 
				// will only work once (on the initial assignment).
				for(j=0; j<treeData["children"].length; j++) {
					if(treeData["children"][j]["name"] == l1nodeName) {
						loc = j;
					}
				}
				madeNode = checkChildren(treeData["children"][loc], l2nodeName); // Checks to see if the child on level 2 has been assigned a node already.
				if(!madeNode) {
					tempObj = newNode(l2nodeName);
					l2names.push(tempObj.name);
					locL2 = treeData["children"][loc]["children"].push(tempObj);	
				}	
			}
			else { // Indicates that the metadata being looked at doesn't have the description included.  TODO: Modulate this in a function
				l1nodeName = tempStrings[1].split("level1=")[1].replace("\\", "").replace("\\ ", " ");
				l2nodeName = tempStrings[2].split("level2=")[1].replace("\\", "").replace("\\ ", " ");
				measurement = tempStrings[3].split("measurement=")[1];
				madeNode = check(l1names, l1nodeName);
				if(!madeNode) {
					tempObj = newNode(l1nodeName);
					l1names.push(tempObj.name);
					treeData["children"].push(tempObj);
				}
				for(j=0; j<treeData["children"].length; j++) {
					if(treeData["children"][j]["name"] == l1nodeName) {
						loc = j;
					}
				}
				madeNode = checkChildren(treeData["children"][loc], l2nodeName);
				if(!madeNode) {
					tempObj = newNode(l2nodeName);
					l2names.push(tempObj.name);
					treeData["children"][loc]["children"].push(tempObj);
				}

			}
			// Finds the location of the correct place to push the measurement name to.
			for(j=0; j<treeData["children"][loc]["children"].length; j++) {
				if(treeData["children"][loc]["children"][j]["name"] == l2nodeName) {
					locL2 = j;
				}
			}
			// If the description has been included, set the name of the node to be the description. Else, use the measurement name.
			if(description != null) {
				tempObj = newNode(measurement);//description;// + " ("+measurement+")";
			}
			else {
				tempObj = newNode(measurement);
			}

			locMeas = treeData["children"][loc]["children"][locL2]["children"].push(tempObj); // Push the measurement to the correct parent and grab the location.
			
			// If measurement is ade.paf.temps, need to allocate two more lists on the next level to break up large amount of data.
			if(measurement == "ade.paf.temps") {
				tempObj = newNode("List 1");
				treeData["children"][loc]["children"][locL2]["children"][locMeas-1]["children"].push(tempObj);
				tempObj = newNode("List 2");
				treeData["children"][loc]["children"][locL2]["children"][locMeas-1]["children"].push(tempObj);
			}

			// If measurement is ade.paf.status, need to allocate multiple sub groups to break up large amount of data.
			if(measurement == "ade.paf.status") {
				tempObj = newNode("Error Count");
				treeData["children"][loc]["children"][locL2]["children"][locMeas-1]["children"].push(tempObj);
				tempObj = newNode("FEC-EO");
				treeData["children"][loc]["children"][locL2]["children"][locMeas-1]["children"].push(tempObj);
				tempObj = newNode("PAF Controller");
				treeData["children"][loc]["children"][locL2]["children"][locMeas-1]["children"].push(tempObj);
				tempObj = newNode("PAF Power Supply");
				treeData["children"][loc]["children"][locL2]["children"][locMeas-1]["children"].push(tempObj);
				tempObj = newNode("TEC Controller");
				treeData["children"][loc]["children"][locL2]["children"][locMeas-1]["children"].push(tempObj);
			}

			// If measurement is power.ant, need to allocate multiple sub groups to break up large amount of data.
			if(measurement == "power.ant") {
				tempObj = newNode("Min");
				treeData["children"][loc]["children"][locL2]["children"][locMeas-1]["children"].push(tempObj);
				tempObj = newNode("Max");
				treeData["children"][loc]["children"][locL2]["children"][locMeas-1]["children"].push(tempObj);
			}

			getField(measurement, loc, locL2, locMeas-1); // Passes control to a function to grab the field keys from the database and append it to the correct location
			
			// Reset variables to recycle for next loop iteration.
			measurement = null;
			loc = 0;
			locL2 = 0;
			locMeas = 0;
		}
		// The following section of code only runs once all of the jquery requests for the page have ceased. This ensures all the data requred for the tree has been collected
		// before it continues to actually make the tree.
		$( document ).ajaxStop( function() {		
			var margin = {top: 20, right: 90, bottom: 30, left: 90}, //20
			    width = window.innerWidth - margin.left - margin.right, //960
			    height = window.innerHeight - margin.top - margin.bottom; //1000

			// append the svg object to the body of the page
			// appends a 'group' element to 'svg'
			// moves the 'group' element to the top left margin
			window.svg = d3.select(cont).append("svg")
			    .attr("width", width + margin.right + margin.left)
			    .attr("height", height + margin.top + margin.bottom)
			  .append("g")
			    .attr("transform", "translate("
				  + margin.left + "," + margin.top + ")");

			window.i = 0,
			    duration = 750,
			    window.root;

			// declares a tree layout and assigns the size
			window.treemap = d3.tree().size([height-30, width]);

			// Assigns parent, children, height, depth
			root = d3.hierarchy(treeData, function(d) { return d.children; });
			root.x0 = height / 2;
			root.y0 = 0;

			// Collapse after the second level
			root.children.forEach(collapse);	

			update(root);
			
			// If the user has specified a branch path in the URL, expand the path
			if(locLink != null) {
				locLink = locLink.split(","); // Split up the branch path string on the commas to generate an array
				workingNode = root; // Initialise the workingNode to be the root of the tree
				for(i=0; i<locLink.length; i++) { // Cycle through all of the layers in the specified branch path
					for(j=0; j<workingNode.children.length; j++) { // Cyle through all of the children of the working node
						// If a child of the working node matches the name specified in the branch path, expand it using the click function 
						if(locLink[i] == workingNode.children[j]["data"]["name"]) {
							click(workingNode.children[j]);
							nextNode = workingNode.children[j]; // Store the location of the successful node to look through it next
						}
					}
					workingNode = nextNode; // Update working node for next loop
				}
			}
		});	
	});		
}

// newNode takes in a single variable - the name to append to the .name element. It creates a new object, appends the name and initialises the children array. It then returns the
// object.
function newNode(name) {
	var tempObj = new Object();
	tempObj.name = name;
	tempObj.children = [];
	
	return tempObj;
}

// check takes in two variables - a list of names and the name of the node currently being assessed. It initialises a boolean variable to false to be used as the return value.
// It then loops through the full list of names passed in, searching for an occurance of the name of the node currently being assessed. If it finds that the name exists in this
// list, it indicates that the node has already been assigned and hence returns true. Else, returns false.
function check(names, nodeName) {
	var madeNode = false;
	var i = 0;

	for(i = 0; i<names.length; i++) {
		if(names[i] == nodeName) {
			madeNode = true;
		}
		else {}
	}
	return(madeNode);
}

// same as above function, used to check if a child has already been assigned to a parent.
function checkChildren(children, nodeName) {
	var madeNode = false;
	var i = 0;

	for(i=0; i<children["children"].length; i++) {
		if(children["children"][i]["name"] == nodeName) {
			madeNode = true;
		}
	}

	return(madeNode);
}

// getField takes in four variables - the name of the measurement just allocated space on the tree for, the location of the parent of the branch on level 1, the location of the parent
// on level 2, and the location of the measurement. The purpose of the function is to append the field key data to the correct measurement name. It initially places a jquery request 
// to grab the field keys for the measurement in a json object from the database.
function getField(measurement, loc, locL2, locMeas) {
	$.ajax( {
		method: 'GET',
		url: "http://akingest01.atnf.csiro.au:8086/query?pretty=true",
		type: 'POST',
		data: { db: 'askap', q:'show field keys from "'+measurement+'"'},
		datatype: 'json'
	}).done(function(result) {
		var tempObj = null;

		// Check to make sure the returned json object is defined before continuing
		if(!(result["results"][0]["series"] == undefined)) {
			var field = result["results"][0]["series"][0]["values"];

			// Cycle through all of the field values
			for(i=0; i<field.length; i++) {
				tempObj = new Object();
				tempObj.name = field[i][0];	
				tempObj.meas = measurement; // Store measurement name (parent) in the node so the information is available to create a dashboard on click.
			
				// If the measurement name is ade.paf.temps, need to push leafs to different locations than normal
				if(measurement == "ade.paf.temps") {
					// If the name of the field being read contains the substring "dom" or "tec", seperate it into list 1. else, put into list 2
					if((tempObj.name.search("dom") != -1) || (tempObj.name.search("tec") != -1)) {
						treeData["children"][loc]["children"][locL2]["children"][locMeas]["children"][0]["children"].push(tempObj);
					} 
					else {
						treeData["children"][loc]["children"][locL2]["children"][locMeas]["children"][1]["children"].push(tempObj);
					}
				// If the measurement name is ade.paf.status, need to push leafs to different locations than normal
				} else if(measurement == "ade.paf.status") {
					// Append every field with the string "errorCount" in it into a seperate node
					if(tempObj.name.search("errorCount") != -1) {
						// Push the object to the errorCount child node
						treeData["children"][loc]["children"][locL2]["children"][locMeas]["children"][0]["children"].push(tempObj);
					// Same as above, grouped by "FecEoInfo"
					} else if(tempObj.name.search("FecEoInfo") != -1) {
						// Push the object to the FecEoInfo child node
						treeData["children"][loc]["children"][locL2]["children"][locMeas]["children"][1]["children"].push(tempObj);
					// If none of the above apply, append to the root of the parent if various strings aren't included.
					} else if(tempObj.name.search("ctrl_") != -1) {
						// Push the object to the PAF Controller child node
						treeData["children"][loc]["children"][locL2]["children"][locMeas]["children"][2]["children"].push(tempObj); 
					} else if(tempObj.name.search("psu_") != -1) {
						// Push the object to the PAF Power Supply child node
						treeData["children"][loc]["children"][locL2]["children"][locMeas]["children"][3]["children"].push(tempObj);
					} else if(tempObj.name.search("tec_") != -1) {
						// Push the object to the TEC Controller child node
						treeData["children"][loc]["children"][locL2]["children"][locMeas]["children"][4]["children"].push(tempObj);
					} else if((tempObj.name.search("tatus") == -1) && (tempObj.name.search("nabled") == -1) && (tempObj.name.search("isabled") == -1)) {
						treeData["children"][loc]["children"][locL2]["children"][locMeas]["children"].push(tempObj);
					}
				// If the measyremet name is power.ant, need to push leafs to a different locations than normal
				} else if(measurement == "power.ant") {
					if(tempObj.name.search("min") != -1) {
						treeData["children"][loc]["children"][locL2]["children"][locMeas]["children"][0]["children"].push(tempObj);
					} else if(tempObj.name.search("max") != -1) {
						treeData["children"][loc]["children"][locL2]["children"][locMeas]["children"][1]["children"].push(tempObj);
					} else {
						treeData["children"][loc]["children"][locL2]["children"][locMeas]["children"].push(tempObj);
					}
				}
				// If no special allocation needs to take place, allocate child nodes as normal.
				else {
					treeData["children"][loc]["children"][locL2]["children"][locMeas]["children"].push(tempObj);
				}
			}
		}
	});
}

// Collapse the node and all its children
function collapse(d) {
  if(d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }
}

function update(source) {

  // Assigns the x and y position for the nodes
  var treeData = treemap(root);

  // Compute the new tree layout.
  var nodes = treeData.descendants(),
      links = treeData.descendants().slice(1);

  // Normalize for fixed-depth.
  nodes.forEach(function(d){ d.y = d.depth * 180});

  // ****************** Nodes section ***************************

  // Update the nodes...
  var node = svg.selectAll('g.node')
      .data(nodes, function(d) {return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr("transform", function(d) {
        return "translate(" + source.y0 + "," + source.x0 + ")";
      })
      .on('click', click)
      .on("contextmenu", rightClick);

  // Add Circle for the nodes
  nodeEnter.append('circle')
      .attr('class', 'node')
      .attr('r', 1e-6)
      .style("fill", function(d) {
          return d._children ? "lightsteelblue" : "#fff";
      });

  // Add labels for the nodes
  nodeEnter.append('text')
      .attr("dy", ".35em") // Was .35em
      .attr("x", function(d) {
          return d.children || d._children ? -13 : 13;
      })
      .attr("text-anchor", function(d) {
          return d.children || d._children ? "end" : "start";
      })
      .text(function(d) { return d.data.name; });

  // UPDATE
  var nodeUpdate = nodeEnter.merge(node);

  // Transition to the proper position for the node
  nodeUpdate.transition()
    .duration(duration)
    .attr("transform", function(d) { 
        return "translate(" + d.y + "," + d.x + ")";
     });

  // Update the node attributes and style
  nodeUpdate.select('circle.node')
    .attr('r', 10)
    .style("fill", function(d) {
        return d._children ? "lightsteelblue" : "#fff";
    })
    .attr('cursor', 'pointer');


  // Remove any exiting nodes
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) {
          return "translate(" + source.y + "," + source.x + ")";
      })
      .remove();

  // On exit reduce the node circles size to 0
  nodeExit.select('circle')
    .attr('r', 1e-6);

  // On exit reduce the opacity of text labels
  nodeExit.select('text')
    .style('fill-opacity', 1e-6);

  // ****************** links section ***************************

  // Update the links
  var link = svg.selectAll('path.link')
      .data(links, function(d) { return d.id; });

  // Enter any new links at the parent's previous position.
  var linkEnter = link.enter().insert('path', "g")
      .attr("class", "link")
      .attr('d', function(d){
        var o = {x: source.x0, y: source.y0}
        return diagonal(o, o)
      });

  // UPDATE
  var linkUpdate = linkEnter.merge(link);

  // Transition back to the parent element position
  linkUpdate.transition()
      .duration(duration)
      .attr('d', function(d){ return diagonal(d, d.parent) });

  // Remove any exiting links
  var linkExit = link.exit().transition()
      .duration(duration)
      .attr('d', function(d) {
        var o = {x: source.x, y: source.y}
        return diagonal(o, o)
      })
      .remove();

  // Store the old positions for transition.
  nodes.forEach(function(d){
    d.x0 = d.x;
    d.y0 = d.y;
  });

  // Creates a curved (diagonal) path from parent to the child nodes
  function diagonal(s, d) {

    path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`

    return path
  }

/*  // Toggle children on click.
  function click(d) {
    if (d.children) { // If the node has already been clicked and the children sprouted
        d._children = d.children;
        d.children = null;
      } else { // If the node has not been clicked yet	
        d.children = d._children;
        d._children = null;
	if(d.children == null) { // If the node clicked is a leaf node, need to generate a scripted dashboard
		launchDash(d["data"]["name"], d["data"]["meas"], "graph"); // Passes control to a function that opens the desired dashboard in a new tab.
	}
      }
    update(d);
  }*/

  function rightClick(d) {
    event.preventDefault();
    if((d.children == null) && (d._children == null)) {
    	launchDash(d["data"]["name"], d["data"]["meas"], "coprglory-discrete-panel", null);
    } else if((d.children == null) && (d._children != null)) { // If the node is node a leaf but has not been expanded, give the user an option to copy the path
	getPath(d);
    }
  }
}

// getPath takes in one parameter - the data of a node in the tree. It grabs the name of the node, and stores it in a path string. It then jumps up a level,
// looking at the parent of the inital node. It grabs the name of the parent and appends it to the path string. It does this until it reaches the first level
// of the tree, ignoring the root node as this is not needed in the path description.
function getPath(d) {
	var currentNode = d;
	var path = "";
	var leaf = true;
	var newURL = "";

	while(currentNode["data"]["name"] != "ASKAP") {
		// leaf is used to ignore inserting a comma if it is the bottom level node
		if(leaf) {
			path = currentNode["data"]["name"]+path;
			leaf = false;
		}
		else {
			path = currentNode["data"]["name"]+","+path;
		}
		currentNode = currentNode.parent;
	}

	newURL = window.location.href;
	// If the URL already includes a branch path, need to delete it before inserting the updated one
	if(newURL.includes('&')) {
		newURL = newURL.substring(0, newURL.indexOf('&'));
	}
	newURL += "&locLink="+path;
	
	window.prompt("Link to tree location:", newURL); // Open the URL in a text box that the user can copy to their clipboard
}

// Toggle children on click.
function click(d) {
	if (d.children) { // If the node has already been clicked and the children sprouted
		d._children = d.children;
		d.children = null;
	} else { // If the node has not been clicked yet	
		d.children = d._children;
		d._children = null;
		if(d.children == null) { // If the node clicked is a leaf node, need to generate a scripted dashboard
			// Need to check the state of the URL to see what display options have been selected  to send to the graph. This is done through getOptions().
			launchDash(d["data"]["name"], d["data"]["meas"], "graph", getOptions()); // Passes control to a function that opens the desired dashboard in a new tab.
	}
}
update(d);
}

// getOptions takes in no parameters. Its purpose is to read the information stored in the URL from the "Display Options" custom template and use this to send an integer to
// the scripted dashboard URL on left click of a node. It functions by initially grabbing the URL parameters, and then discarding the values not needed. It then cycles
// through what is left and pushed the values of the parameter to an array of strings called displayOptions. If the length of this is 2, the user has selected to view both
// points and lines, and hence the return value is set as 2. If this is not the case and the length is 1, a switch case statement is used to set the return value appropriately.
// The returned string is therefore an integer representing the state of the template value with the following convention:
// 0 - Points only | 1 - Lines only | 2 - Points and lines
function getOptions() {
	var displayOptions = [];
	var retVal = "0";
	var url = new URL(window.location.href);
	var params = new URLSearchParams(url.search.replace("orgId=1&", "")); // Can discard the orgId param

	for(let p of params) {
		displayOptions.push(p[1]);
	}

	if(displayOptions.length == 2) {
		retVal = "2";
	}

	else if(displayOptions.length == 1) {
		switch(displayOptions[0]) {
			case "Dots":
				retVal = "0";
				break;
			case "Lines":
				retVal = "1";
				break;
			default:
				break;
		}
	}

	return retVal;
}

// launchDash takes in two variables - the name of the field, and the name of the measurement. These variables are used to create a scripted dashboard URL, which the user is
// then linked to.

function launchDash(field, meas, type, displayOption) {
	// If the display option is not null, the user has specified how to plot the graph
	if(displayOption != null) {
		window.open("http://rotwang.atnf.csiro.au:3500/dashboard/script/askapMonitor.js?meas="+meas+"&field="+field+"&plotType="+type+"&dispOpt="+displayOption); // Replace port with Grafana server port
	}

	else {
		window.open("http://rotwang.atnf.csiro.au:3500/dashboard/script/askapMonitor.js?meas="+meas+"&field="+field+"&plotType="+type); // Replace port with Grafana server port
	}
}
