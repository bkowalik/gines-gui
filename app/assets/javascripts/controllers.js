'use strict';

angular.module('gines.controllers', []).controller('ginesCtrl', function($scope) {
    $scope.admin = null;
    $scope.events = null;
    $scope.world = null;
    $scope.chart = null;

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
    };

    $scope.updateWorld = function(graph, world) {
        //console.log(world);
        graph.emptyGraph();
        //TODO: redrawing world
        Object.keys(world).forEach(function(key) {
            var point = key.substring(1,key.length-1).split(',');
            //console.log(point);
            $scope.world.addNode('cell '+ key + ' count ' + world[key]['count'],{
                'x': point[0],
                'y': point[1],
                'size': 0.5+4.5*Math.random(),
                'color': 'rgb('+Math.round(Math.random()*256)+','+
                    Math.round(Math.random()*256)+','+
                    Math.round(Math.random()*256)+')'
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
});