'use strict';

angular.module('gines.controllers', []).controller('ginesCtrl', function($scope, $q) {
    $scope.admin = null;
    $scope.events = null;
    $scope.world = null;
    $scope.chart = null;
    $scope.admin = null;
    $scope.colors = {
        "School": "171,153,133",
        "Home": "236,215,188",
        "Work": "143,130,121"
    };

    $scope.init = function() {
        // Instanciate sigma.js and customize it :
        $scope.world = sigma.init(document.getElementById('simulation-sigma')).drawingProperties({
            defaultLabelColor: '#fff'
        });

        Highcharts.setOptions({
            global: {
                useUTC: false
            }
        });

        var chart
        $scope.chart = new Highcharts.Chart({
            chart: {
                renderTo: 'charts',
                type: 'line',
                //animation: Highcharts.svg, // don't animate in old IE
                marginRight: 10/*,
                events: {
                    load: function() {
                        var series = this.series[0];
                        setInterval(function() {
                            var x = (new Date()).getTime(), // current time
                                y = Math.random();
                            series.addPoint([x, y], true, true);
                        }, 1000);
                    }
                }*/
            },
            title: {
                text: 'Live data'
            },
            xAxis: {
                title: {
                    text: 'Day of simulation'
                },
                type: 'linear',
                tickPixelInterval: 150
            },
            yAxis: {
                title: {
                    text: 'Percentage'
                },
                plotLines: [{
                    value: 30,
                    width: 1,
                    color: '#808080'
                }]
            },
            /*tooltip: {
                formatter: function() {
                        return '<b>'+ this.series.name +'</b><br/>'+
                        Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) +'<br/>'+
                        Highcharts.numberFormat(this.y, 2);
                }
            },*/
            legend: {
                enabled: true
            },
            exporting: {
                enabled: true
            },
            series: [{
                name: 'Infected',
                color: '#DC0F0F',
                data: []
            },
            {
                name: 'Immune',
                color: '#FFA500',
                data: []
            },
            {
                name: 'Healthy',
                color: '#008000',
                data: []
            }]
        });


        $scope.events = new EventSource('/listen/localhost');
        $scope.events.onopen = function(event) {
            //console.log(event);
        }
        $scope.events.onerror = function(event) {
            //console.log(event);
        }
        $scope.events.onmessage = function(msg) {
            //console.log(msg);
            var data = JSON.parse(msg.data);
            $scope.updateWorld($scope.world, data["world"]);
            $scope.updateGraph($scope.chart, data["day"], data["condition"]);
        };

        $scope.admin = new WebSocket("ws://localhost:9000/admin/localhost");
        $scope.admin.onopen = function() {
            console.log("Opening");
        };
        $scope.admin.onerror = function(msg) {
            console.log("ERROR");
            console.log(msg);
        };
        $scope.admin.onclose = function(msg) {
            console.log("CLOSE");
            console.log(msg);
        };

        $scope.admin.onmessage = function(message) {
            console.log("MESSAGE");
            var data = JSON.parse(message.data);
            console.log(data);
        };
    };

    $scope.updateWorld = function(graph, world) {
        //console.log(world);
        graph.emptyGraph();
        //TODO: redrawing world
        Object.keys(world).forEach(function(key) {
            var point = key.substring(1,key.length-1).split(',');
            var type = world[key]['typ']['name'];

            if (type === "FakeHome")
                return

            var count = world[key]['count'];
            var condition = world[key]['condition'];
            var reddish = 255 - Math.floor(condition * 255);
            $scope.world.addNode('cell '+ key + ' count ' + count,{
                'x': point[0],
                'y': point[1],
                'size': 1.5+0.8*count,
                'color': 'rgb(255,' + reddish + ',' + reddish + ')'
            });
        });
        graph.draw();
    };

    $scope.updateGraph = function(chart, day, condition) {
        chart.series[0].addPoint({ // Infected
            x: day,
            y: condition["infected"]
        }, false);
        chart.series[1].addPoint({ // Immune
            x: day,
            y: condition["immune"]
        }, false);
        chart.series[2].addPoint({ // Healthy
            x: day,
            y: condition["healthy"]
        }, false);
        chart.redraw();
    };

    $scope.startSimulation = function() {
        Object.keys($scope.chart.series).forEach(function(key){
            $scope.chart.series[key].setData([]);
        });
        $scope.chart.redraw();
        $scope.admin.send(JSON.stringify({
            'command': 'start'
        }));
    };

    $scope.stopSimulation = function() {
        $scope.admin.send(JSON.stringify({
            'command': 'stop'
        }));
    };
});