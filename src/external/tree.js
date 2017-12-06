function makeTree(cont) {
//console.log("Called Successfully");
// Initialise the tree with the subsystems to be populated by call to influxDB

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
	var madeNode = false;
	var loc = 0;

	// Maybe make an array of all of the names that have been assigned nodes to avoid double ups.
	for(var i = 0; i<len; i++) {
		tempStrings = result["results"][0]["series"][0]["values"][i][0].split(",");
		if(tempStrings.length == 5) { // Indicates that the description has been included in the metadata
			l1nodeName = tempStrings[2].split("level1=")[1];
			l2nodeName = tempStrings[3].split("level2=")[1];
			madeNode = check(l1names, l1nodeName);
			if(!madeNode) {
				tempObj = new Object();
				tempObj.name = l1nodeName;
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
				tempObj.name = l2nodeName;
				tempObj.children = [];
				l2names.push(tempObj.name);
				treeData["children"][loc]["children"].push(tempObj);
				loc = 0;
			}
		}
		else { // TODO: Modulate this in a function
			l1nodeName = tempStrings[1].split("level1=")[1];
			l2nodeName = tempStrings[2].split("level2=")[1];
			madeNode = check(l1names, l1nodeName);
			if(!madeNode) {
				tempObj = new Object();
				tempObj.name = l1nodeName;
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
				tempObj.name = l2nodeName;
				tempObj.children = [];
				l2names.push(tempObj.name);
				treeData["children"][loc]["children"].push(tempObj);
				loc = 0;
			}

		}

	}
	var margin = {top: 20, right: 90, bottom: 30, left: 90},
	    width = 960 - margin.left - margin.right,
	    height = 500 - margin.top - margin.bottom;

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
		
});
		
	/*	
	var treeData =
	  {
	    "name": "ASKAP",
	    "children": [
	      {
		"name": "Composite Control",
		"children": [

		]
	      },
	      {
		"name": "Antenna",
		"children": [
		  {"name": "Antenna Power"},
		  {"name": "Drives"},
		  {"name": "Timing Common"},
		  {"name": "Timing - LRD"}, 
		  {"name": "Timing - TRD"},
		  {"name": "PAF"},
		  {"name": "Digital Receiver"},
		  {"name": "Beamformer"}
        ]
      },
      {
        "name": "Correlator Blocks",
        "children": [

        ]
      },
      {
        "name": "Ingest",
        "children": [

        ]
      },
      {
        "name": "Scheduling Blocks",
        "children": [

        ]
      },
      {
        "name": "Weather",
        "children": [

        ]
      },
      {
        "name": "Rack",
        "children": [

        ]
      },
      {
        "name": "Misc",
        "children": [

        ]
      },
      {
        "name": "Metadata",
        "children": [

        ]
      },
      {
        "name": "Event Log",
        "children": [

        ]
      },
      {
        "name": "Ignore",
        "children": [

        ]
      }
    ]
  };
*/
//console.log(treeData);

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
// Collapse the node and all it's children
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
    if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
    update(d);
  }
}
