function makeTree(cont) {
//console.log("Called Successfully");
// Initialise the tree with the subsystems to be populated by call to influxDB
// TODO: Make class for the tempObj vars that contain children predefined
$.ajax( {
	method: 'GET',
	url: "http://akingest01.atnf.csiro.au:8086/query?pretty=true",
	type: 'POST',
	//data: { db:'askap', q:'show tag values from "metadata.toc" with key = level1' },
	data: { db: 'askap', q:'show series from "metadata.toc"'},
	datatype: 'json'
}).done(function(result) { 
	//window.l1 = result;
	window.treeData = {
		"name": "ASKAP",
		"children": []
	};
	var map = result["results"][0]["series"][0]["values"];
	var len = map.length;
	var tempStrings;
	var tempObj;
	var l1names = [];
	var l2names = [];
	var l1nodeName;
	var l2nodeName;
	var description = null;
	var madeNode = false;
	var loc = 0;
	var locL2 = 0;
	var locMeas = 0;

	// Maybe make an array of all of the names that have been assigned nodes to avoid double ups.
	for(var i = 0; i<len; i++) {
		loc = 0;
		locL2 = 0;
		description = null;
		tempStrings = result["results"][0]["series"][0]["values"][i][0].split(",");
		if(tempStrings.length == 5) { // Indicates that the description has been included in the metadata
			l1nodeName = tempStrings[2].split("level1=")[1].replace("\\", "").replace("\\ ", " ");
			l2nodeName = tempStrings[3].split("level2=")[1].replace("\\", "").replace("\\ ", " ");
			description = tempStrings[1].split("desc=")[1].replace("\\", "").replace("\\ ", " ");
			measurement = tempStrings[4].split("measurement=")[1];
			madeNode = check(l1names, l1nodeName);
			if(!madeNode) {
				tempObj = new Object();
				tempObj.name = l1nodeName;//.replace("\\", "");
				tempObj.children = [];
				l1names.push(tempObj.name);
				treeData["children"].push(tempObj);
			}
			for(var j=0; j<treeData["children"].length; j++) {
				if(treeData["children"][j]["name"] == l1nodeName) {
					loc = j;
				}
			}
			madeNode = checkChildren(treeData["children"][loc], l2nodeName);
			if(!madeNode) {
				// Cycle through node names to find the lvl 1 parents location
				tempObj = new Object();
				tempObj.name = l2nodeName;//.replace("\\", "");
				tempObj.children = [];
				l2names.push(tempObj.name);
				locL2 = treeData["children"][loc]["children"].push(tempObj);	
			}	
		}
		else { // TODO: Modulate this in a function
			l1nodeName = tempStrings[1].split("level1=")[1].replace("\\", "").replace("\\ ", " ");
			l2nodeName = tempStrings[2].split("level2=")[1].replace("\\", "").replace("\\ ", " ");
			measurement = tempStrings[3].split("measurement=")[1];
			madeNode = check(l1names, l1nodeName);
			if(!madeNode) {
				tempObj = new Object();
				tempObj.name = l1nodeName;//.replace("\\", "");
				tempObj.children = [];
				l1names.push(tempObj.name);
				treeData["children"].push(tempObj);
			}
			for(var j=0; j<treeData["children"].length; j++) {
				if(treeData["children"][j]["name"] == l1nodeName) {
					loc = j;
				}
			}
			madeNode = checkChildren(treeData["children"][loc], l2nodeName);
			if(!madeNode) {
				// Cycle through node names to find the lvl 1 parents location
				tempObj = new Object();
				tempObj.name = l2nodeName;//.replace("\\", "");
				tempObj.children = [];
				l2names.push(tempObj.name);
				treeData["children"][loc]["children"].push(tempObj);
			}

		}
		// Finds the location of the correct place to push the measurement name to
		for(var j=0; j<treeData["children"][loc]["children"].length; j++) {
			if(treeData["children"][loc]["children"][j]["name"] == l2nodeName) {
				locL2 = j;
			}
		}
		tempObj = new Object();
		if(description != null) {
			tempObj.name = description;// + " ("+measurement+")";
		}
		else {
			tempObj.name = measurement;
		}
		tempObj.children = [];
		locMeas = treeData["children"][loc]["children"][locL2]["children"].push(tempObj);
		
		// If measurement is ade.paf.temps, need to allocate two more lists on the next level to break up large amount of data
		if(measurement == "ade.paf.temps") {
			tempObj = new Object();
			tempObj.name = "List 1";
			tempObj.children = [];
			treeData["children"][loc]["children"][locL2]["children"][locMeas-1]["children"].push(tempObj);
			tempObj = new Object();
			tempObj.name = "List 2";
			tempObj.children = [];
			treeData["children"][loc]["children"][locL2]["children"][locMeas-1]["children"].push(tempObj);
		}

		// TODO: If measurement is ade.paf.status, need to allocate a list for errorCount
		if(measurement == "ade.paf.status") {
			tempObj = new Object();
			tempObj.name = "Error Count";
			tempObj.children = [];
			treeData["children"][loc]["children"][locL2]["children"][locMeas-1]["children"].push(tempObj);
		}

		getField(measurement, loc, locL2, locMeas-1);
		
		measurement = null;
		loc = 0;
		locL2 = 0;
		locMeas = 0;

		// TODO: Trim the bloat fields in the PAF status tag
/*		var strCheck = null;

		for(i=0; i<(treeData["children"][0]["children"][3]["children"][7]["children"].length); i++) {
				strCheck = treeData["children"][0]["children"][3]["children"][7]["children"][i]["name"];

				if(strCheck.search("Enabled") != -1) {
							treeData["children"][0]["children"][3]["children"][7]["children"].splice(i, 1);
				}
		}*/
	}
	$( document ).ajaxStop( function() {		
		var margin = {top: 20, right: 90, bottom: 30, left: 90},
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
		window.treemap = d3.tree().size([height, width]);

		// Assigns parent, children, height, depth
		root = d3.hierarchy(treeData, function(d) { return d.children; });
		root.x0 = height / 2;
		root.y0 = 0;

		// Collapse after the second level
		root.children.forEach(collapse);

		update(root);
/*
		for(i=0; i<(treeData["children"][0]["children"][3]["children"][7]["children"].length); i++) {
				console.log(treeData["children"][0]["children"][3]["children"][7]["children"][i]["name"]);
		}*/
	});	
});
		
// Set the dimensions and margins of the diagram
}

function check(names, nodeName) {
	var madeNode = false;
	var i = 0;

	for(i = 0; i<names.length; i++) {
		if(names[i] == nodeName) {
			madeNode = true;
		}
		else {}
	}
//	console.log(madeNode);
	return(madeNode);
}

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

function getField(measurement, loc, locL2, locMeas) {
	$.ajax( {
		method: 'GET',
		url: "http://akingest01.atnf.csiro.au:8086/query?pretty=true",
		type: 'POST',
		data: { db: 'askap', q:'show field keys from "'+measurement+'"'},
		datatype: 'json'
	}).done(function(result) {
		// Grab the field key data to append to the measurement name
		var tempObj = null;
		if(!(result["results"][0]["series"] == undefined)) {
			var field = result["results"][0]["series"][0]["values"];

			for(i=0; i<field.length; i++) {
				tempObj = new Object();
				tempObj.name = field[i][0];
				// If the name of the field being read contains dom or tec, seperate it into list 1. else, put into list 2
				if(measurement == "ade.paf.temps") {
					if((tempObj.name.search("dom") != -1) || (tempObj.name.search("tec") != -1)) { // The field being appended is either dom or tec
						treeData["children"][loc]["children"][locL2]["children"][locMeas]["children"][0]["children"].push(tempObj);
					} 
					else {
						treeData["children"][loc]["children"][locL2]["children"][locMeas]["children"][1]["children"].push(tempObj);
					}
				} else if(measurement == "ade.paf.status") {
					// Need to append every field with the string errorCount in it into a seperate node
					if(tempObj.name.search("errorCount") != -1) {
						treeData["children"][loc]["children"][locL2]["children"][locMeas]["children"][0]["children"].push(tempObj);
					} else if((tempObj.name.search("tatus") == -1) && (tempObj.name.search("nabled") == -1) && (tempObj.name.search("isabled") == -1)) {
						treeData["children"][loc]["children"][locL2]["children"][locMeas]["children"].push(tempObj);
					}

				}
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

  // Enter any new modes at the parent's previous position.
  var nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr("transform", function(d) {
        return "translate(" + source.y0 + "," + source.x0 + ")";
    })
    .on('click', click);

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

  // Update the links...
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

  // Toggle children on click.
  function click(d) {
    if (d.children) { // If the node has already been clicked and the children sprouted
        d._children = d.children;
        d.children = null;
      } else { // If the node has not been clicked yet	
        d.children = d._children;
        d._children = null;
	if(d.children == null) { // If the node clicked is a leaf node, need to generate a scripted dashboard
	//	window.alert("No Children");
		//window.alert(d["data"]["name"]);
		launchDash(d["data"]["name"]);
	}
      }
    update(d);
  }
}

function launchDash(pvname) {
	window.open("http://akingest01:3000/dashboard/script/pvplot.js?pvname=ak03:paf:ctrl:adc1:pafAvTemp");
}
