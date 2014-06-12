/* globals define */
define(function(require, exports, module) {
    'use strict';
    // import dependencies
    var Engine = require('famous/core/Engine');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var Surface = require("famous/core/Surface");

    var d3 = require("D3");

    // create the main context
    var mainContext = Engine.createContext();
    mainContext.setPerspective(3000);

    // your app here
    

    var initialTime = Date.now();


    var planeModifier = new Modifier({
        transform: Transform.rotateX(Math.PI/3)
    });

    var scene = mainContext.add(planeModifier);


    var plane = new Surface({
        size: [window.innerWidth, window.innerHeight],
        properties:{
            backgroundColor: "rgba(255,255,255,.1)",
            border: "1px solid red"
        }
    });
    scene.add(new Modifier({
        transform: Transform.translate(0,-1000,-1000)
    })).add(plane);

    //D3 Graph
    var width = 960,
        height = 500;

    var color = d3.scale.category20();

    var force = d3.layout.force()
        .charge(-220)
        .linkDistance(30)
        .size([width, height]);

    this.surfaces = [];
    this.surfaceModifiers = [];

    //load in the data
    d3.json("../src/data.json", _dataLoaded);

    function _dataLoaded(error, graph) {
        force
            .nodes(graph.nodes)
            .size([window.innerWidth, window.innerHeight])
            .links(graph.links)
            .alpha(.1)
            .friction(1)
            .start();


        var nodes = force.nodes();

        //build the famous surfaces
        for (var i = 0; i < nodes.length; i++) {

           
            (function(node, index){
                var logo = new ImageSurface({
                    size: [50, 50],
                    content: '/content/images/famous_logo.png',
                    classes: ['backfaceVisibility', "logo"]
                });
                var centerSpinModifier = new Modifier({
                    origin: [0.5, 0.5],
                    align: [.5, .5],
                    opacity: .3 + Math.random(),
                    transform : function() {
                        var x = (node.x - window.innerWidth/2) * 3;
                        var y = (node.y - window.innerHeight/2) * 2;

                        return Transform.multiply(
                            Transform.translate(x, y, -100),
                            Transform.rotate( -Math.PI/3, .002 * (Date.now() - initialTime) - index, 0)
                        );
                    }
                });

                setTimeout(function(){
                    scene.add(centerSpinModifier).add(logo);
                    force.start();
                }, i * 500);
                
            })(nodes[i], i);           

        }//end for each node
    }

    Engine.on("click", function(){
        force.alpha(.1);
    })
});
