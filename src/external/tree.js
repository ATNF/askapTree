// Monitor for presses of the control key for giving the user tree location on node click
hover = false; // Initialise globally that the mouse is not hovering an element
pathNode = null; // Initialise globally the value to store the node the user is attempting to grab the path of
displayOptions = "";
$(document).keydown(function(event) {
    if(event.which=="76")
        if(hover) {
            getPath(pathNode);
        }
});

//$(document).keyup(function() {
//        ctrlPressed = false;
//});

function makeTree(cont, options) {
    var influxHost = influxHost;
    var xoffset = 30;
    
    var ajaxOptions = {};

    // Set up options used in ajax call
    ajaxOptions.method = "GET";
    ajaxOptions.url = options.influxHost + "/query?pretty=true";
    ajaxOptions.type = "POST";
    ajaxOptions.datatype = "json";
    
    ajaxOptions.data = {
	db: options.database,
	q:'show series from "metadata.toc"'
    };
    
    // Make authorization headers optional
    if (options.username != '' && options.password != '') {
	ajaxOptions.xhdrFields = { withCredentials: true };
	ajaxOptions.headers = { 'Authorization': 'Basic ' + btoa(options.username + ':' + options.password) }
    }
       
    displayOptions = options.displayOptions;
    
// Initialise the tree with the subsystems to be populated by call to influxDB
    $.ajax(ajaxOptions).done(function(result) { 
        window.treeData = {
            "name": options.treeName,
            "children": []
        };

        // ****** Variable Declarations ******
        var map = result["results"][0]["series"][0]["values"]; // Array objects found in the database. Needs to be parsed still.
        var len = map.length;
        var tempStrings = null; // Variable to hold array of strings returned when the strings returned by this jquery call are split on the "," character.
        var tempObj = null; // Temporary object used to create children nodes when required.
        var l1names = []; // Keeps track of the node names that have been assigned to level 1 to avoid double-ups.
        var l2names = []; // As above, but with level 2
        var l1nodeName = null; // Temporary string to hold the level 1 node name.
        var l2nodeName = null; // As above.
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
                l1nodeName = tempStrings[2].split("level1=")[1].replace(/\\/g, ""); // Grab information after "level1=" and get rid of "\" charaters
                l2nodeName = tempStrings[3].split("level2=")[1].replace(/\\/g, "");
                description = tempStrings[1].split("desc=")[1].replace(/\\/g, "");
                measurement = tempStrings[4].split("measurement=")[1].replace(/\\/g, "");
                madeNode = check(l1names, l1nodeName); // Passes control to a function to check whether the node name has already been assigned a node.
                // If the node has not been made
                if(!madeNode) {
                    tempObj = newNode(l1nodeName); // Creates a new node and returns it into tempObj.
                    l1names.push(tempObj.name); // Pushes the name of the node to the array keeping track of assigned nodes.
                    treeData["children"].push(tempObj); // Pushes the node onto the 1st level of the tree.
                    console.log("SORTING");
                    //console.log(treeData["children"]);
                    console.log("SORTED");
                    //console.log(treeData["children"]);
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
                    treeData["children"][loc]["children"].push(tempObj);    
                    for(j=0; j<treeData["children"][loc]["children"].length; j++) {
                        if(treeData["children"][loc]["children"][j]["name"] == l2nodeName) {
                            locL2 = j;
                        }
                    }
                }    
            }
            // If the string was delimited into 4 parts, it means one of two possibilities:
            // metadata, desc, level1, meas OR
            // metadata, level1, level2, meas
            // Need to check which one based on the string stored in [1] and operate accordingly
            else if (tempStrings.length == 4) { // Indicates that the metadata being looked at doesn't have the description included, but does have a second level
                if(tempStrings[1].includes("level1")) {
                    l1nodeName = tempStrings[1].split("level1=")[1].replace(/\\/g, "");
                    l2nodeName = tempStrings[2].split("level2=")[1].replace(/\\/g, "");
                    measurement = tempStrings[3].split("measurement=")[1].replace(/\\/g, "");
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
                else {
                    l1nodeName = tempStrings[2].split("level1=")[1].replace(/\\/g, "");
                    measurement = tempStrings[3].split("measurement=")[1].replace(/\\/g, "");
                    l2nodeName = null;
                    description = tempStrings[1].split("desc=")[1].replace(/\\/g, "");

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
                }
            }
            else { // Indicates that the metadata being looked at doesn't have the description included or the second level
                l1nodeName = tempStrings[1].split("level1=")[1].replace(/\\/g, "");
                measurement = tempStrings[2].split("measurement=")[1].replace(/\\/g, "");
                l2nodeName = null; // No second level before measurement
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
            }

            // Finds the location of the correct place to push the measurement name to.
            if(l2nodeName != null) {
                for(j=0; j<treeData["children"][loc]["children"].length; j++) {
                    if(treeData["children"][loc]["children"][j]["name"] == l2nodeName) {
                        locL2 = j;
                    }
                }
            }
            else {
                locL2 = null;
            }
            // If the description has been included, push the name to a variable called desc to be displayed as a tooltip when the user hovers over the node.
            if(description != null) {
                tempObj = newNode(measurement);
                tempObj.desc = description;
            }
            else { // If the description is not included, set the desc var as an empty string
                tempObj = newNode(measurement);
                tempObj.desc = "";
            }

            if(l2nodeName != null) {
                locMeas = treeData["children"][loc]["children"][locL2]["children"].push(tempObj); // Push the measurement to the correct parent and grab the location.
                if(locMeas == undefined) {
                    console.log("MEASUREMENT");
                    console.log(tempObj);
                }
            }
            else {
                locMeas = treeData["children"][loc]["children"].push(tempObj); // Push the measurement to the correct parent and grab the location.
                if(locMeas == undefined) {
                    console.log("MEASUREMENT");
                    console.log(tempObj);
                }
            }
            
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
            //console.log(locMeas);
            getField(options, measurement, loc, locL2, locMeas-1); // Passes control to a function to grab the field keys from the database and append it to the correct location
            
            // Reset variables to recycle for next loop iteration.
            measurement = null;
            loc = 0;
            locL2 = 0;
            locMeas = 0;
        }
        // The following section of code only runs once all of the jquery requests for the page have ceased. This ensures all the data requred for the tree has been collected
        // before it continues to actually make the tree.
        $( document ).ajaxStop( function() {        
            depthFirst(treeData); // Use a depth first search approach to sort the first level of the tree
            depthFirst(treeData["children"]); // Use a recursive depth first search approach to sort the rest of the tree
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
                  + (margin.left + xoffset) + "," + margin.top + ")");

            window.i = 0,
                duration = 750,
                window.root;

            // declares a tree layout and assigns the size
            window.treemap = d3.tree().size([2*height/3, width]);

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
function getField(options, measurement, loc, locL2, locMeas) {

    var ajaxOptions = {};

    // Set up options used in ajax call
    ajaxOptions.method = "GET";
    ajaxOptions.url = options.influxHost + "/query?pretty=true";
    ajaxOptions.type = "POST";
    ajaxOptions.datatype = "json";
    
    ajaxOptions.data = {
	db: options.database,
	q:'show field keys from "'+measurement+'"'
    };
    
    // Make authorization headers optional
    if (options.username != '' && options.password != '') {
	ajaxOptions.xhdrFields = { withCredentials: true };
	ajaxOptions.headers = { 'Authorization': 'Basic ' + btoa(options.username + ':' + options.password) }
    }
    
    $.ajax(ajaxOptions).done(function(result) {
        var tempObj = null;

        // Check to make sure the returned json object is defined before continuing
        if(!(result["results"][0]["series"] == undefined)) {
            var field = result["results"][0]["series"][0]["values"];

            // Cycle through all of the field values
            for(i=0; i<field.length; i++) {
                if (field[i][0].endsWith("_double") || field[i][0].endsWith("_float") || field[i][0].endsWith("_integer") || field[i][0].endsWith("_string")) {
                    continue;
                }
                if (i>0 && field[i][0] == field[i-1][0]) {
                    continue;
                }
                tempObj = new Object();
                tempObj.database = options.database;
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
                else if(locL2 != null) { 
                    //console.log(locMeas);
                    treeData["children"][loc]["children"][locL2]["children"][locMeas]["children"].push(tempObj);
                }
                // If there is no level two
                else {
                    //console.log(locMeas);
                    treeData["children"][loc]["children"][locMeas]["children"].push(tempObj); 
                }

            }
        }
    });
}

// depthFirst takes one argument - the node being examined. In the case of the first layer, there is only one child and hence it is sorted specially. For all other calls, the function iterates through all of the children, alphabetically sorting their children and then recursively calling itself to pass in it's own children to repeat the process. When all the children have been exhausted for a node, control returns to the parent that called the function, allowing the next iteration of the loop to start.
function depthFirst(node) {
    for(var child in node) {
        if(child == "children") {
            node[child] = alphabetical(node[child]);
        }
        if(node[child].children) {
            node[child].children = alphabetical(node[child].children);
            depthFirst(node[child].children);
        }
    }
}

// alphabetical takes in one argument - the tree branch currently being examined. It loops through all of the children on that leaf and stores their names in an array. The array is then sorted alphabetically. After this, a nested for loop is used to find the corresponding object to the element in the alphabetically sorted array. When this is found, it is copied to the same position as the name the alphaNames array to a temporary object list. Once alphabetically sorted, this list is then passed back to the main function and written in place of the list that was passed to this function originally, alphabetically sorting the nodes in the tree data.
function alphabetical(depth) {
    var alphaNames = [];
    var tempObjList = [];
    var i = 0;
    var j = 0;

    for(i = 0; i<depth.length; i++) {
        alphaNames[i] = depth[i].name;
    }
    alphaNames.sort();
    for(i = 0; i<depth.length; i++) {
        for(j = 0; j<depth.length; j++) {
            if(depth[j].name == alphaNames[i]) {
                tempObjList[i] = depth[j]
            }
        }
    }
    return tempObjList;
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

  // ***************** Tooltip section **************************

  // Define the tooltip to show when the user hovers over a measurement node
  var tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("font", "12px sans-serif")
      .style("opacity", 0); // Initially set to invisible

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

  nodeEnter
      .on("mouseover", function (d) { // When the user hovers over a node, show the tooltip
          hover = true;
          pathNode = d;
          tooltip.text(d["data"].desc); // Grab the description name stored in the node
          tooltip.transition() // Transition to show the node
            .duration(200)
            .style("opacity", .9);
      })
      .on("mousemove", function () {return tooltip.style("top", (event.pageY-10)+"px").style("left", (event.pageX+10)+"px");}) // Follow the mouse cursor
      .on("mouseout", function (d) { // When the mouse moves off the node, fade away the tooltip
          hover = false;
          pathNode = null;
          tooltip.transition()
            .duration(200)
            .style("opacity", 0);
      })
      .append('rect') // Invisible rectangle used to trigger the mouseover actions
      .attr('class', 'click-capture')
      .style('visibility', 'hidden')
      .attr('x', 0)
      .attr('y', 0);

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

  function rightClick(d) {
      event.preventDefault();
      if((d.children == null) && (d._children == null)) {
         launchDash(d["data"]["name"], d["data"]["meas"], d["data"]["database"], "natel-discrete-panel", getOptions());
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

    while(currentNode["data"]["name"].parent != null) {
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
            launchDash(d["data"]["name"], d["data"]["meas"], d["data"]["database"], "graph", getOptions()); // Passes control to a function that opens the desired dashboard in a new tab.
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
    var url = new URL(window.location.href);
    var dots = false;
    var lines = false;

    // check user selection (need to get event to controller)
    for(var p of url.searchParams.getAll("var-displayOptions")) {
        switch(p) {
            case "Dots":
                dots = true;
                break;
            case "Lines":
                lines = true;
                break;
            default:
                break;
        }
    }
    if (!dots && !lines) {
        // check inital options from variables
         if ( displayOptions.search("Lines") > -1) {
            lines = true;
        }
        if ( displayOptions.search("Dots") > -1) {
            dots = true;
        }
    }
    if ( dots && lines) {
        return "2";
    }
    else if (lines) {
        return "1";
    }
    else {
        // dots
        return "0";
    }
}

// launchDash takes in two variables - the name of the field, and the name of the measurement. These variables are used to create a scripted dashboard URL, which the user is
// then linked to.

function launchDash(field, meas, database, type, displayOption) {
    // The scripted dashboard will be run on the same server as the user, therefore can grab the current URL and use that to link the user to the correct location
    var url = window.location.href; // Grab the URL as a string
    url = url.substring(0, url.indexOf('/dash')); // Get rid of everything after the port number as it is not needed.
    window.open(url+"/dashboard/script/askapMonitor.js?database="+database+"&meas="+meas+"&field="+field+"&plotType="+type+"&dispOpt="+displayOption);
}
