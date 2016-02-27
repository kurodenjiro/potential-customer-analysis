// JS/D3 script file of the Potentials interface
// updated 19.12.2015 larsverspohl

// utilities
var log = console.log.bind(console);
var spaceLess = function(x) { return x.replace(/[^A-Za-z0-9]/g,''); }; // remove all non-letter characters
/* Accepts one or more transitions and a callback as last argument, Example: 
    var transition1 = d3.selectAll('g').transition().duration(500)
      , transition2 = d3.selectAll('circle').transition().duration(400)
      , callback = function() {console.log('done')}
    onD3TransitionsEnd(transition1, transition2, callback) */
function transitionEnd() {
  var args = Array.prototype.slice.call(arguments);
  var selectionCount = 0;
	var cb = args[args.length - 1];

  for (var i = 0; i < args.length - 1; i++) {
    selectionCount += args[i].length;
    args[i].each('end', function(){
      selectionCount -= 1;
      selectionCount === 0 && cb();
    });
  }
} // http://bumbu.me/a-function-for-triggering-a-callback-at-the-end-of-d3-js-transitions/
function eventFire(el, eventType){
  if (el.fireEvent) {
    el.fireEvent('on' + eventType);
  } else {
    var eventObj = document.createEvent('Events');
    eventObj.initEvent(eventType, true, false);
    el.dispatchEvent(eventObj);
  }
} // simulate an event http://stackoverflow.com/questions/2705583/how-to-simulate-a-click-with-javascript

var dur = 3000;
var removeBars; // allow global access as we need it in narrative

// set up constants and containers
var diameter = window.innerHeight * 0.85,
    format = d3.format(',d'),
		svgWidth = diameter,
		svgHeight = diameter * 1.04;

var pack = d3.layout.pack()
    .size([diameter - 30, diameter - 30])
    .value(function(d) { return d.size; })
		.padding(5);

var svg = d3.select('#container').append('svg')
		.attr('id', 'main')
    .attr('width', svgWidth)
    .attr('height', svgHeight)
		.append('g')
    .attr('transform', 'translate(30,10)');
		

function buildAnnotation() {

			var title = svg.append('g')
					.attr('transform', 'translate(' + [(diameter * 0.95), 15] + ')');
	
			title.append('text')
					.attr('id', 'title')
					.attr('text-anchor', 'end')
					.text('unrefined data');


			// build legend
			(function() {
		
				var legend = svg.append('g')
						.attr('transform', 'translate(0,10)');
		
				legend.append('circle')
						.attr('r', 5)
						.style('fill', '#bebada')
						.attr('transform', 'translate(0,0)');
				legend.append('text')
						.attr('class', 'legend')
						.attr('transform', 'translate(10,5)')
						.text('Channels and Services');

				legend.append('circle')
						.attr('r', 5)
						.style('fill', '#fb8072')
						.attr('transform', 'translate(0,20)');
				legend.append('text')
						.attr('class', 'legend')
						.attr('transform', 'translate(10,25)')
						.text('Operator brands');
		
				legend.append('circle')
						.attr('r', 5)
						.style('fill', '#fdb462')
						.attr('transform', 'translate(0,40)');
				legend.append('text')
						.attr('class', 'legend')
						.attr('transform', 'translate(10,45)')
						.text('Demographics');

				legend.append('circle')
						.attr('r', 5)
						.style('fill', '#8dd3c7')
						.attr('transform', 'translate(0,60)');
				legend.append('text')
						.attr('class', 'legend')
						.attr('transform', 'translate(10,65)')
						.text('Subscription');

				legend.append('circle')
						.attr('r', 5)
						.style('fill', '#ffffb3')
						.attr('transform', 'translate(0,80)');
				legend.append('text')
						.attr('class', 'legend')
						.attr('transform', 'translate(10,85)')
						.text('Ad reach');

				legend.append('circle')
						.attr('r', 5)
						.style('fill', '#80b1d3')
						.attr('transform', 'translate(0,100)');
				legend.append('text')
						.attr('class', 'legend')
						.attr('transform', 'translate(10,105)')
						.text('Content');

				legend.append('rect')
						.attr('width', 15)
						.attr('height', 15)
						.style('fill', '#999')
						.attr('transform', 'translate(-7.5, ' + (diameter - 20) + ')');
				legend.append('circle')
						.attr('r', 5)
						.style('fill', 'none')
						.style('stroke-width', 3)
						.style('stroke', '#fff')
						.attr('transform', 'translate(0, ' + (diameter - 20 + 7.5) + ')');
				legend.append('text')
						.attr('class', 'legend')
						.attr('transform', 'translate(10, ' + (diameter - 20 + 12.5) + ')')
						.text('Robust characteristic [picked by 2 models]');
			
			})(); // anonymous self-invoked (to collapse rather redundant code)
			
} // buildAnnotation (legend and title)

buildAnnotation();


// get data for narrative

d3.json('data/story.json', function(error, data) {
	if(error) throw error;

	modal(data);

});


// modal helper functions

function setModal(flag, data) {

	d3.select('section#container')
		.classed('blur', flag === 0 ? true : false); // blur background

	d3.select('div#modal > div')
		.style('opacity', flag === 0 ? 1 : 0)
		.html(flag === 0 ? data.title + data.text : ''); // add/remove text

	d3.select('li.explain')
		.html(flag === 0 ? 'enough read' : 'what\'s this?'); // change list html

	d3.select('div#modal')
		.style('display', flag === 0 ? 'flex' : 'none'); // change modal display property
	
	
}	// setModal()

function getBlurstate() {

	var bouncer = 0; // blur state bouncer

	if(d3.select('section#container').style('-webkit-filter') !== 'none' || d3.select('section#container').style('filter') !== 'none') {
		bouncer = 1;
	} // check blur state

	return bouncer;

}	// getBlurstate()


// modal function

function modal(data) {

	var data = data;
	var intro = data.introduction;

	d3.select('li.explain').on('mousedown', function() {

		var bouncer = getBlurstate();
		setModal(bouncer, intro);

		d3.select('a.modalBtn#tapper').on('mousedown', function() {
	
			// note we're not using setModal() here as the changes are subtley different
			d3.select('section#container').classed('blur', false);

			d3.select('div#modal').style('display', 'none');

				d3.select('div#modal > div')
					.transition().style('opacity', 0)
					.each('end', function(){
						
						d3.select('li.explain').html('what\'s this?');

						d3.select('div#modal > div *').remove();

					}); // remove intro
				
			tapper(data); // kickstart narrative
	
		}); // modal button handler to start animation 

		d3.select('a.modalBtn#close').on('mousedown', function() {

			var bouncer = getBlurstate();
			setModal(bouncer, intro);
			
		}); // modal button handler to close the modal

	}); // modal event handler

} // modal() function to build or remove modal


// named transitions for narrative

function setPointColour(that) {

	d3.selectAll('circle.plotpoints').call(pointColour,250,0,'#ccc');
	that.call(pointColour,250,0,'#444');
}

function setStoryHtml(text, del) {

		d3.select('div.narrative > div')
			.transition()
			.style('opacity', 0)
			.each('end', function() {

				d3.select('div.narrative > div')
					.html('')
					.html(text)
					.transition()
					.delay(del)
					.style('opacity', 1);

			});
	
}

function pointColour(el, dur, del, col) {
	el.transition('pointColour')
		.duration(dur)
		.delay(del)
		.style('fill', col);
}


// tapper function running the narrative

function tapper(data) {
	
	var data = data;
	var plotpoints = data.plotpoints;
	
	var n = plotpoints.length;
	var rangePlotpoints = d3.range(0, n-1);
	var svgLength = d3.select('svg.plotpoints').style('height').replace('px','');
	var svgWidth = d3.select('svg.plotpoints').style('width').replace('px','');
	var circlePadding = 15;
	var circleMargin = (svgLength - circlePadding * n)/2;
	
	removeBars(); // in case there were some
	
	var svgPlotpoints = d3.select('svg.plotpoints').selectAll('circle')
		.data(plotpoints)
		.enter();
		
	svgPlotpoints.append('circle')
		.attr('class', 'plotpoints')
		.attr('id', function(d,i) { return 'point' + i; })
		.attr('cx', svgWidth / 2)
		.attr('cy', function(d, i) { return circleMargin + i * circlePadding; })
		.attr('r', 4);
	
	d3.select('circle#point0')
		.transition()
		.duration(1000)
		.style('fill', '#444');

	var activePlotpoint = 0; // initialise first plotpoint
	var direction = 1; // 1 up; -1 down
	var plotpoint = d3.select('circle#point0')[0][0];
	setTimeout(function(){ eventFire(plotpoint, 'mousedown'); }, 50); // little delay to allow for latency
		
		
	// the main narrative driver
		
	d3.selectAll('circle.plotpoints').on('mousedown', function() {

		var thisData = d3.select(this).data()[0]; // get data joined to the active plotpoint

		// condition on data change direction
		if (thisData.id - activePlotpoint === 0 || thisData.id - activePlotpoint === 1 || thisData.id - activePlotpoint === -1) {
			
			if (thisData.id - activePlotpoint === -1 || direction === -1) {
				
				setStoryHtml(thisData.text, 0); // change html

				if(thisData.arguments) {
					var arg = thisData.arguments;
					storyAnims[thisData.animationReverse](arg);
				} // condition on if arguments are available
				storyAnims[thisData.animationReverse](); // trigger animation

			} else {

				setStoryHtml(thisData.text, thisData.delay); // change html

				if(thisData.arguments) {
					var arg = thisData.arguments;
					storyAnims[thisData.animation](arg);
				} // condition on if arguments are available
				storyAnims[thisData.animation](); // trigger animation
				
			} // play animations dependning on if we move downwards or updwards

			activePlotpoint = thisData.id;

			setPointColour(d3.select(this)); // change plotpoint colour

			setTimeout(function() {
		
				d3.selectAll('a.narrative').on('mouseover', function() {
					var thisId = d3.select(this).attr('id');
					storyAnims[thisId]();
				});
		
			}, 1000); // add listeners to a-tags (if available) after a delay to wait for HTML to build
			
			if(activePlotpoint === n - 1) { showRemNarrBtn(); } // only show remove narrative button when at the final plotpoint
			
			
		} // only change plotpoint if it progresses or decreases by one. We need to check how thisData.id - activePlotpoint behaves (-1 when points clicked, 0 when arrows used) as well as how the direction variable behaves (triggered when arrows used: -1 for down, 1 for up)

	}); // circle events to navigate plotpoints
	
	function changePlotpoint() {

		plotpoint = d3.select('circle#point' + activePlotpoint)[0][0];

		setTimeout(function(){ eventFire(plotpoint, 'mousedown'); }, 50); // little delay to allow for latency

	} // small function to change the plotpoint

	function showRemNarrBtn() {

		d3.selectAll('i.fa-arrow-down').transition().style('opacity', 0).remove();
		d3.select('div#removeNarrative').style('display', 'inherit');
		d3.select('div#removeNarrative').transition().style('opacity', 1);

	} // small function to show the Remove Narrative Button

	d3.select('body').on('keydown', function() {

		if((event.keyCode === 40 || event.key === 40 || event.which === 40) && activePlotpoint < n) {

			direction = 1; // set direction
			
			++activePlotpoint; // increment activePLotpoint by 1

			changePlotpoint(); // fire plotpoint event 

			if(activePlotpoint === n - 1) { showRemNarrBtn(); } // only show remove narrative button when at the final plotpoint

		} // arrow down
		

		if((event.keyCode === 38 || event.key === 38 || event.which === 38) && activePlotpoint > 0) {

			direction = -1; // set direction

			--activePlotpoint; // decrease activePLotpoint by 1

			changePlotpoint(); // fire plotpoint event 

		} // arrow down


	}); // keydown events to navigate plotpoints

	d3.select('div#removeNarrative').on('mousedown', function() {
		
		removeNarrative();
		
	}); // removeNarrative button event handler


} // tapper function to tell the story sequentially

function removeNarrative() {

	removeBars();
	d3.selectAll('div.narrative > div > *').transition().style('opacity', 0).remove();
	d3.selectAll('svg.plotpoints > *').transition().style('opacity', 0).remove();
	d3.selectAll('div#removeNarrative').transition().style('opacity', 0).style('display', 'none');

} // small function to remove the story
	

// animation functions for narrative

var animFlag = 0; // flag to be set to 1 during animation hence allowing me to block other animations

var storyAnims = {};

var nodes = []; // needs to be global
var update; // needs to be global as used in allCase() and recudeCases()
var force;
var graph;
var forceInterval;
		
storyAnims.none = function() {
	
	log('no animation for this plotpoint');
	
}; // none


storyAnims.allCases = function() {
	
	d3.selectAll('svg#main > g *').remove(); // remove all elements in svg g
	// d3.select('div.tooltip').style('opacity', 0);
	nodes = []; // empty nodes

	setTimeout(function(){

		var loc = d3.select('div.plotpoints')[0][0].getBoundingClientRect();

		d3.select('div.tooltip')
			.html(function() { return 'Use your keyboard down- and up-arrows to navigate'; })
			.style('opacity', 1)
			.style('background-color', '#555')
			.style('color', '#fff')
			.style('top', (loc.top + loc.height - 30) + 'px')
			.style('left', null)
			.style('right', '3%');

	}, 8000);


	setTimeout(function() {

		d3.select('div.tooltip')
			.transition()
			.style('opacity', 0)

		d3.select('div.tooltip')
			.transition()
			.delay(400)		
			.style('background-color', '#F2F1EF')
			.style('color', '#6C7A89')
			.style('right', null);


	}, 12000)

	function cases() {
	
		var width = svgWidth, height = svgHeight;
		var startPointX = svgWidth/2, startPointY = svgHeight/2;
	
		force = d3.layout.force()
		    .nodes(nodes)
		    .links([])
		    .size([width, height])
				.gravity(0.5) // .1 attraction to focal point. 0 none - 1 quite a lot (can go > 1)
				.friction(0.5); // .9 values in range [0,1], velocity decay, the higher the more decay
				// .charge(-30) // -30 negative value: node repulsion - positive value: node attraction
				// .theta(.8) //.8 not to worry - affects large clusters
				// .alpha(.9); // changing doesn't change much. 1 controls the cooling paramater deciding the time it takes the layout to settle
				// set up the force

		force.on('tick', function(e) {
		  svg.selectAll('circle.shreds')
				.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
		}); // we decide what happens per tick (this adds the force to the circles)


		// create data with 3 parts: keep, remove1 and remove2
		
		for(var i = 0; i < 1000; i++) {
		  nodes.push({
		    x: startPointX,
				y: startPointY,
				nodeClass: 'keep', 
				colour: 'hsl('+ Math.floor(Math.random()*360) + ', 100%, 50%)' // node used
		  }); // we add a node determining the start coordinates
		} // produce keep data

		for(var i = 0; i < 1000; i++) {
		  nodes.push({
		    x: startPointX,
				y: startPointY,
				nodeClass: 'remove1', 
				colour: 'hsl('+ Math.floor(Math.random()*360) + ', 100%, 50%)' // node used
		  }); // we add a node determining the start coordinates
		} // produce remove1 data

		for(var i = 0; i < 100; i++) {
		  nodes.push({
		    x: startPointX,
				y: startPointY,
				nodeClass: 'remove2', 
				colour: 'hsl('+ Math.floor(Math.random()*360) + ', 100%, 50%)' // node used
		  }); // we add a node determining the start coordinates
		} // produce remove2 data


		force.start(); // we start the layout

		update = function(data) {

			// update
			graph = svg.selectAll('.shreds')
				.data(data);
	
			// enter
			graph.enter().append('circle')
				.attr('class', function(d) { return d.nodeClass; })
				.classed('shreds', true)
				.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
			  .attr('r', 3)
			  // .style('fill', function(d) { return d.colour; })
			  .style('fill', 'mediumblue')
				.style('stroke', 'none')
				.call(force.drag); // data-join with each new node //:

			// exit
			graph.exit()
				.classed('exit', true)
				.classed('shreds', false)
				.transition().duration(800)
				.style('r', 0)
				.remove();
		
		}; // update()

		update(nodes);
	
	} // cases()
	
	cases();
	
}; // allCases

storyAnims.reduceCases = function(removeNo) {

	force.stop(); // stop it. otherwise nodes to remove will be visible as recalculated based on original positions 

	var n = d3.selectAll('.shreds.remove' + removeNo)[0].length;

	d3.selectAll('.shreds.remove' + removeNo)
		.transition()
		.duration(4000)
		.delay(function(d,i) { return i / n * 4000; })
		.style('fill', '#fff')
		.attr('transform', function(d) { return 'translate(' + d.x + ', ' + svgHeight + ')'; }); // rain effect

	nodes = nodes.filter(function(el){
		return el.nodeClass !== 'remove' + removeNo;
	}); // trim data

	setTimeout(function() {

		d3.selectAll('.shreds.remove' + removeNo).remove();

		force.nodes(nodes); // this moves nodes to new position
		force.start();

	}, 7000); // invoke after rain

}; // reduceCases


storyAnims.showUnrefinedVariables = function() {

	// 1 get constant data

	function kickStart() {

		if(d3.select('.node').empty()) {
			
			buildAnnotation();

			getData();

		}			
			
		var transition1 = d3.selectAll('.node > circle')
			.transition()
			.duration(3000)
			.attr('r',1e-6);

		var transition2 = d3.selectAll('.node > text')
			.transition()
			.duration(3000)
			.style('font-size',1e-6);

		transitionEnd(transition1, transition2, getData); // wait for the transitions to finsih then trigger the callback n.getData
			
	
	}	// 1a kickStart()

	function getData() {

		d3.select('g.node').remove();

		getNewData('data/data_constant.json');

	} // 1b getData()

	var removeForce = d3.selectAll('.shreds')
		.transition()
		.duration(1000)
		.attr('r', 0); // remove the forcelayout

	transitionEnd(removeForce, function() {

		d3.selectAll('svg#main > g *').remove(); // remove all elements in svg g

		kickStart(); // narrative
		
	}); // invoke the circel-pack after transition end in callback 
	
}; // showUnrefinedVariables


storyAnims.highlightVars = {};

storyAnims.highlightVars.setHighlight = function(id, html) {

	animFlag = 1; 
	
	var x = d3.select('.node#' + id + ' > circle').data()[0].x;
	var y = d3.select('.node#' + id + ' > circle').data()[0].y;
	var r = d3.select('.node#' + id + ' > circle').attr('r');

	d3.select('.node#' + id + ' > circle')
		.transition()
		.duration(dur/2)
		.ease('elastic')
		.attr('r', r * 15);

	d3.select('.tooltip')
		.html(html)
		.style('left', x + 'px')
		.style('top', y + 'px');

	d3.select('.tooltip')
		.transition()
		.delay(250)
		.style('opacity', 0.9);

	setTimeout(function() {

		d3.select('.tooltip')
			.transition()
			.style('opacity', 0);

		d3.select('.node#' + id + ' > circle')
			.transition()
			.duration(500)
			.attr('r', r)
			.each('end', function() {
				animFlag = 0; 
			});

	}, dur * 0.66);

}; // highlightVars.setHighlight

storyAnims.highlightVarsAll = function() {

	if(!animFlag) {

		storyAnims.highlightVars.setHighlight('Age', 'Age'); // start 0 - end 3250
		setTimeout(function() { storyAnims.highlightVars.setHighlight('LikesSport', 'Really likes to watch Sports') }, dur + 500); // start 3500 - end 6750
		setTimeout(function() { storyAnims.highlightVars.setHighlight('SUBOperator18', 'Subscribes to a certain operator') }, dur*2 + 1000); // start 7000 - end 10250

	}

}; // highlightVarsAll - not used !

storyAnims.highlightVarsAge = function() {

	if(!animFlag) storyAnims.highlightVars.setHighlight('Age', 'Age');

}; // highlightVarsAge

storyAnims.highlightVarsContent = function() {

	if(!animFlag) storyAnims.highlightVars.setHighlight('LikesSport', 'Really likes to watch Sports');

}; // highlightVarsContent

storyAnims.highlightVarsSubs = function() {

	if(!animFlag) storyAnims.highlightVars.setHighlight('SUBOperator12', 'Subscribes to a certain operator');

}; // highlightVarsSubs


storyAnims.mouseoverAge = function() {

	var ageNode = d3.select('.node#Age')[0][0];

	setTimeout(function() { eventFire(ageNode, 'mouseover'); }, 1);
	setTimeout(function() { eventFire(ageNode, 'mouseout'); }, 750);

}; // mouseoverAge

storyAnims.mouseoverSub19 = function() {

	var subNode = d3.select('.node#UsedtobeOnlineOperator19sub')[0][0];

	setTimeout(function() { eventFire(subNode, 'mouseover'); }, 1);
	setTimeout(function() { eventFire(subNode, 'mouseout'); }, 750);

}; // mouseoverSub19

storyAnims.mouseoverRecom19 = function() {

	var recomNode = d3.select('.node#RecommendsOnlineOperator19')[0][0];

	setTimeout(function() { eventFire(recomNode, 'mouseover'); }, 1);
	setTimeout(function() { eventFire(recomNode, 'mouseout'); }, 750);

}; // mouseoverRecom19


storyAnims.highlightCategories = function() {
	
	// 5d remove bars

	if(!d3.select('svg.svgRight').empty()) {
		storyAnims.moveNarrative('up');
	}

	removeBars();
	
	// 6 highlight category bubbles

	var categories = [
		{ id: 'InformationonTVandvideooperatorbrands', colour: '#FB8072' },
		{ id: 'Advertisingreachinformation', colour: '#FFFBB6' },
		{ id: 'InformationonTVandvideochannelbrands', colour: '#BCBCD9' },
		{ id: 'Contentinformation', colour: '#89B1D1' },
		{ id: 'Subscriptioninformation', colour: '#9DCFC5' },
		{ id: 'Demographicinformation', colour: '#F3B56C'}
	]; // object holding all category ID's and colours

	function highlightCategory(nodeId, tempFill) {

		var r = d3.select('.node#' + nodeId + ' > circle').attr('r');
		var fill = d3.select('.node#' + nodeId + ' > circle').style('fill');

		d3.select('.node#' + nodeId + ' > circle')
			.transition()
			.attr('r', r*1.5).style('fill', tempFill)
			.transition().duration(1000).ease('elastic')
			.attr('r', r).style('fill', fill);

	} // function to transition each bubble accordingly

	categories.forEach(function(el, i) {
		
		var timeout = i * 150;
		
		setTimeout(function() { highlightCategory(el.id, el.colour) }, timeout);
		
	}); // highlight each bubble
	
	
}; // highlightCategories

storyAnims.showCategoryDescriptions = function() {
	
	// 7 point at bubbles

	var categories = [
		{ id: 'InformationonTVandvideooperatorbrands', colour: '#FB8072', text1: '<h1>Marketing departement</h1>', text2: '<h2>Umbrella brand info</h2>' },
		{ id: 'Advertisingreachinformation', colour: '#FFFBB6', text1: '<h1>Sales departement</h1>', text2: '<h2>Advertising info</h2>' },
		{ id: 'InformationonTVandvideochannelbrands', colour: '#BCBCD9', text1: '<h1>Distribution departement</h1>', text2: '<h2>Channel info</h2>' },
		{ id: 'Contentinformation', colour: '#89B1D1', text1: '<h1>Acquisitions departement</h1>', text2: '<h2>Content info</h2>' },
		{ id: 'Subscriptioninformation', colour: '#9DCFC5', text1: '<h1>CRM departement</h1>', text2: '<h2>Subscription info</h2>' },
		{ id: 'Demographicinformation', colour: '#F3B56C', text1: '<h1>Everyone !', text2: '<h2>Demographic info</h2>' }
	]; // object holding all category ID's and colours

	function getData(index) {

		var id = categories[index].id;

		var boundRect = d3.select('.node#' + id + ' > circle')[0][0];
		boundRect = boundRect.getBoundingClientRect();

		var x = boundRect.left + boundRect.width/2;
		var y = boundRect.top;

		var width = 100;
		var height = 50;	
	
		var data = [
			{ x: x, 
				y: y, 
				width: width, 
				height: height, 
				colour: categories[index].colour,
				text1: categories[index].text1,
				text2: categories[index].text2
		 	}
		];

		return data;
	
	} // getData()

	var data = getData(0);

	var info = d3.select('body').selectAll('#labels')
		.data(data).enter()
		.append('div')
		.attr('id', 'categoryLabel');		
	
	var time = 1200;
		
	categories.forEach(function(el, i) {

		var timeout = i * time;

		setTimeout(function() {

			data = getData(i);

			info.data(data)
				.transition()
				.duration(time/2)
				.style('left', data[0].x + 'px')
				.style('top', data[0].y + 'px')
				.style('background', data[0].colour);

			setTimeout(function() { info.html(data[0].text1 + data[0].text2); }, time/4); // delay the html appearance 

		}, timeout); // setTimeout()

	}); // loop through each categories element
	
	
}; // showCategoryDescriptions

storyAnims.removeCategoryDescriptions = function() {
	
	d3.selectAll('div#categoryLabel')
		.transition()
		.style('opacity', 0)
		.remove();

}; // removeCategoryDescriptions


storyAnims.getReducedDataset = function() {

  // 3 eliminate noise variables

	d3.selectAll('div#categoryLabel')
		.transition()
		.style('opacity', 0)
		.remove();

	d3.select('text#title').html('reduced data');
		
	getNewData('data/data_germany_split_size.json'); 
	
}; // getReducedDataset

storyAnims.getImportantDataset = function() {
	
  // 4 show weighted ranking
	
	d3.select('text#title').html('ranked data');
	
	getNewData('data/data_germany_split.json'); 
	
	
}; // getImportantDataset


storyAnims.moveNarrative = function(direction) {
	
	var direction = direction; // 'up' or 'down'
	
	d3.select('div.narrative')
		.transition()
		.style('height', '50%')
		.style('top', direction === 'down' ? '45%' : '15%');
	
}; // moveNarrative

storyAnims.growBars = function() {
	
 	// 5a-c show bars of example variables

	// the nodes to highlight
	var ageNode = d3.select('.node#Age')[0][0];
	var recomNode = d3.select('.node#RecommendsOnlineOperator19')[0][0];
	var subpastNode = d3.select('.node#UsedtobeOnlineOperator19sub')[0][0];

	var timeout = 1;
	setTimeout(function() { eventFire(ageNode, 'mouseover'); }, timeout);
	setTimeout(function() { eventFire(ageNode, 'mousedown'); }, timeout + 500);
	setTimeout(function() { eventFire(ageNode, 'mouseout'); }, timeout + 750);

	timeout = 1500;
	setTimeout(function() { eventFire(recomNode, 'mouseover'); }, timeout);
	setTimeout(function() { eventFire(recomNode, 'mousedown'); }, timeout + 500);
	setTimeout(function() { eventFire(recomNode, 'mouseout'); }, timeout + 750);

	timeout = 3000;
	setTimeout(function() { eventFire(subpastNode, 'mouseover'); }, timeout);
	setTimeout(function() { eventFire(subpastNode, 'mousedown'); }, timeout + 500);
	setTimeout(function() { eventFire(subpastNode, 'mouseout'); }, timeout + 750);
	
	storyAnims.moveNarrative('down');
	
}; // growBars

storyAnims.removeBars = function() {
	
	if(!d3.select('svg.svgRight').empty()) {
		storyAnims.moveNarrative('up');
	}
	
	removeBars();

}; // removeBars


storyAnims.finalModel = function() {
	
	// 8 transition to overall model

	d3.select('text#title').html('the final data');

	getNewData('data/data_germany_all.json');

	
}; // finalModel






// -----------------------------------------------------------------------------------



var tip = d3.select('body').append('div')   
    .attr('class', 'tooltip')               
    .style('opacity', 0);

// get data
var currentJson,
 	 	dataSet,
		currentUrl;
		

// dataset lookup
var dataLookup = {

	data0: 'constant',
	data1: 'germany_split',
	data2: 'germany_all',
	data3: 'constant',
	data4: 'uk_split',
	data5: 'uk_all',
	data6: 'constant',
	data7: 'us_split',
	data8: 'us_all',
		
};


// get data 
var getNewData = function(dataFile) {

  d3.json(dataFile, function(error, data) {

		dataSet = dataFile.replace('data/data_', '');
		dataSet = dataSet.replace('.json', '');
		dataSet = dataSet === 'constant' ? 1 : 2; // 1 = constant data, 2 = all other datasets (decides below which transition to use)

    currentJson = data;
		refresh();

  });
};


// event listener, handler to pick dataset
d3.selectAll('li.data').on('mousedown', function() {

	// remove all narrative stuff and re-build the annotations only if the narrative is currently happening
	if(d3.select('svg.plotpoints *')[0][0] !== null){
		removeNarrative();
		d3.selectAll('svg > g *').remove();
		buildAnnotation();
	}

	var liId = d3.select(this).attr('id');
	var data = dataLookup[liId];
	var dataFile = 'data/data_' + data + '.json';
	getNewData(dataFile);
	
	var titletext = d3.select(this).html();
	d3.select('#title').html(titletext);
	
});

// draw function
var refresh = function() {
	

		// event-listener for overall data, needs to be inside refresh()
		d3.selectAll('li.all').on('mousedown', function(){
			d3.select('#title').html('unrefined data');
			getNewData1();
		});

		// manually created color scale - works with multi-nested (sub-models) and single-nested models (no sub-models)
		var colorScale = d3.scale.ordinal()
				.domain(['Subscription', 'Advertising reach', 'TV and video channels', 'TV and video operators', 'Content', 'Demographics'])
				.range(['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462']);
				// 1 Subscription 2 Ad reach 3 Channels 4 Operator 5 Content 6 Demo


		// data-join
		var node = svg.selectAll('.node')
        .data(pack.nodes(currentJson), function(d) { return d.key; });
				// data bound to svg
				// including a key function (using the identity function (d)) makes sure the same circles get transitioned 

		// enter g
		var enter = node.enter().insert('g')
				.attr('class', function(d) { return d.children ? 'node' : 'leaf node'; })
				.attr('id', function(d) { return spaceLess(d.name); })
        .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
		
		// set delay for staggered object constancy only for transition from constant to importance dataset (too slow for the other direction)
		if(dataSet == 2) { 
	    node.transition()
					.delay(function(d,i) { return i * 20; })
					.duration(dur / 3)
					.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
					// update circles x/y positions 
		} else {
	    node.transition()
					.duration(dur / 3)
					.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
					// update circles x/y positions 
		}

		// enter circles
		var circles = enter.insert('circle')
				.attr('r', 0)
				.transition() // trans.-attributes set by below upd.-sel
				.attr('r', function(d) { return d.r; });
				// entered and transition circles r
		
		node.select('circle')
        .transition()
        .duration(dur)
				.style('fill', function(d) { return !d.children ? colorScale(d.category) : '#BFBFBF'; })
				.style('stroke-width', function(d) { return d.children ? 2 : d['total model'] === 1 ? 4 : 0; }) // highlight features in both models
				.style('stroke', function(d) { return d.children ? '#999' : d['total model'] === 1 ? '#fff' : null; }) // highlight features in both models
				.style('opacity', function(d) { return !d.children ? 1 : 0.2; })
        .attr('r', function(d) { return d.r; });
				// update circles radius 
		

		var labels = enter.filter(function(d) { return !d.children; })
				.append('text');
				// enter labels
		
		labels.style('font-size', 0);
		
		node.filter(function(d) { return !d.children; })
				.select('text')
				// .style('font-size', 0)
				.transition()
				.delay(dataSet === 1 ? dur/4 : dur)
	      .attr('dy', '.3em')
	      .style('text-anchor', 'middle')
				.style('font-size', function() { return dataSet === 1 ? 0 : 10; })	 // required alongside the ugly hack above, no labels for constant model
				.text(function(d) { return d.name.substring(0, d.r / 3); });
				// update labels


		// exit		
		node.exit()
			.transition()
			.duration(dur / 2)
			.style('opacity', 0)
			.remove();
			// exit the node objects (= g elements incl. circle and text)



		// yank the encircling nodes (not the leafs, representing the categories) to the top of the DOM so they will always be in the background
		var parentSvg = document.querySelector('#container > svg > g');
		var firstChild = parentSvg.querySelector(':first-child');
		var notleafs = d3.selectAll('g.node:not(.leaf)');
		notleafs[0].forEach(function(d) {
			parentSvg.insertBefore(d, firstChild);
		});
				


		// tooltip and circle size on hover
		node.on('mouseover', function(d){
									
			tip.style('opacity', 0.9);
			tip.html(!d.children ? d.name + '</br>' + 'importance: ' + d3.round(d.size, 1) : d.name)
				.style('left', (d3.event.pageX) + 'px')
				.style('top', (d3.event.pageY - 28) + 'px');
			
			if(!d.children){
				d3.select(this.firstChild)
					.transition()
					.duration(dur/10)
					.ease('cubic')
					.attr('r', function(d) { return d.r * 1.2; })
					.style('opacity', 0.9);
					
			}
		});

		node.on('mousemove', function(d){
			tip.style('left', (d3.event.pageX) + 'px')
				.style('top', (d3.event.pageY - 28) + 'px');
		});

		node.on('mouseout', function(d){
			tip.style('opacity', 0);

			if(!d.children){			
				d3.select(this.firstChild)
					.transition()
					.duration(dur/10)
					.attr('r', function(d) { return d.r; })
					.style('opacity', 1);
			}
		});


		var formatPercentPrep = d3.format('%');
		var formatPercent = function(x) { return formatPercentPrep(x); };

		// bars
		if(dataSet === 2){
						
			var del = 200;
			// log(node.filter(function(d) { return !d.children; }));
			node.filter(function(d) { return !d.children; }).on('mousedown', function(d){
			
				d3.select('.svgRightWrapper')
					.style('border-left-color','#BFBFBF')
					.style('border-left-width', '1px');

				d3.select('#removeBars')
					.transition()
					.style('opacity', 1);
			
				var svgRight = d3.select('.svgRightWrapper').append('svg')
					.classed('svgRight', true)
					.attr('width', 400)
					.attr('height', 100);
				
				var headline = svgRight.append('text')
					.text(d.name + ' (' + d.category + ')')
					.style('font-size', 10)
					.style('fill','#6C7A89')
					.style('font-weight', 'bold')
					.attr('x', 0 )
					.attr('y', 10);

				var barPotential = svgRight.append('rect')
					.style('fill','#6C7A89')
					.attr('width', 0)
					.transition().duration(dur/10)
					.attr('width', d.potential*300)
					.attr('height', 20)
					.attr('x', 0)
					.attr('y', 20);

				var barNonPotential = svgRight.append('rect')
					.style('fill','#999')
					.attr('width', 0)
					.transition().delay(del/30).duration(dur/10)
					.attr('width', d.nonPotential*300)
					.attr('height', 20)
					.attr('x', 0)
					.attr('y', 41);

				var textPotential = svgRight.append('text')
					.text(formatPercent(d.potential) + ' Potentials')
					.style('font-size', 0)
					.transition().duration(dur/10)
					.style('font-size', 10)
					.style('fill','#6C7A89')
					.attr('x', d.potential*300 + 4 )
					.attr('y', 20 + 20 / 2 + 10 / 4); // convoluted hack but works w. width / 2 + font-size / 4

				var textNonPotential = svgRight.append('text')
					.text(formatPercent(d.nonPotential) + ' Non-Potentials')
					.style('font-size', 0)
					.transition().delay(del/30).duration(dur/10)
					.style('font-size', 10)
					.style('fill','#999')
					.attr('x', d.nonPotential*300 + 4 )
					.attr('y', 41 + 20 / 2 + 10 / 4); // convoluted hack but works w. width / 2 + font-size / 4

				// exceptions
				if (d.name == 'Age'){
					barPotential.attr('width', d.potential*5);
					
					barNonPotential.attr('width', d.nonPotential*5);
					
					textPotential
						.attr('x', d.potential*5 + 4 )
						.text(d3.round(d.potential,1) + ' years  Potentials');

					textNonPotential
						.attr('x', d.nonPotential*5 + 4 )
						.text(d3.round(d.nonPotential,1) + ' years  Non-Potentials');
								
			 	} else if (d.name == 'Has Kids') {

			 		headline.text('No. of children (' + d.category + ')');

					textPotential.text(d3.round(d.potential,2) + '  Potentials')
						.attr('x', (d.potential * 100) + 4 );

					textNonPotential.text(d3.round(d.nonPotential,2) + '  Non-Potentials')
						.attr('x', (d.nonPotential * 100) + 4 );

					barPotential.attr('width', d.potential * 100);

					barNonPotential.attr('width', d.nonPotential * 100);

			 	} else if (d.name == 'Country') {
			 		
			 		headline.text('Country: skewed towards Finland, Sweden');
					barPotential.attr('width', 0);
					barNonPotential.attr('width', 0);
					textPotential.text(null);
					textNonPotential.text(null);
					
			 	} else if (d.name == 'Income') {
			 		
					barPotential.attr('width', d.potential*20);

					barNonPotential.attr('width', d.nonPotential*20);

					textPotential.text(d3.round((d.potential),1) + '  Potentials (scale from 1 to 11 = highest)')
						.attr('x', (d.potential*20) + 4 );

					textNonPotential.text(d3.round(d.nonPotential,1) + '  Non-Potentials (scale from 1 to 11 = highest)')
						.attr('x', (d.nonPotential*20) + 4 );
					
			 	} else if (d.name == 'Gender') {
			 		
					barPotential.attr('width', d.potential*40);

					barNonPotential.attr('width', d.nonPotential*40);

					textPotential.text(d3.round((d.potential),1) + '  Potentials (1 = only male, 2 = only female)')
						.attr('x', (d.potential*40) + 4 );

					textNonPotential.text(d3.round(d.nonPotential,1) + '  Non-Potentials (1 = only male, 2 = only female)')
						.attr('x', (d.nonPotential*40) + 4 );
					
			 	}
	

			});

		} // bars
		
		removeBars = function(){

			d3.selectAll('.svgRight').remove();

			d3.select('.svgRightWrapper')
				.style('border-left-color','none')
				.style('border-left-width', '0px');

			d3.select('#removeBars')
				.transition()
				.style('opacity', 0);

		};
		
		d3.select('.svgRightWrapper').on('dblclick', removeBars);
		d3.select('#removeBars').on('mousedown', removeBars);

			
}; // refresh()



getNewData('data/data_constant.json');

setTimeout(function() { eventFire(d3.select('li.explain')[0][0], 'mousedown'); }, 4000);
