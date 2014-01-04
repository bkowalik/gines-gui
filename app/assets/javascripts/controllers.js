'use strict';

angular.module('gines.controllers', []).controller('ginesCtrl', function($scope) {
    $scope.init = function() {
        // Instanciate sigma.js and customize it :
        var sigInst = sigma.init(document.getElementById('simulation-sigma')).drawingProperties({
            defaultLabelColor: '#fff'
        });

        var i, N = 500, C = 5, d = 0.5, clusters = [];
        for(i = 0; i < C; i++){
          clusters.push({
            'id': i,
            'nodes': [],
            'color': 'rgb('+Math.round(Math.random()*256)+','+
                            Math.round(Math.random()*256)+','+
                            Math.round(Math.random()*256)+')'
          });
        }

        for(i = 0; i < N; i++){
          var cluster = clusters[(Math.random()*C)|0];
          sigInst.addNode('n'+i,{
            'x': Math.random(),
            'y': Math.random(),
            'size': 0.5+4.5*Math.random(),
            'color': cluster['color'],
            'cluster': cluster['id']
          });
          cluster.nodes.push('n'+i);
        }

        sigInst.draw();

        var events = new EventSource("/listen/localhost");
        events.addEventListener('message', function(msg) {
            console.log("msg");
        }, false);

        Highcharts.setOptions({
            global: {
                useUTC: false
            }
        });

        var chart;
        $('#charts').highcharts({
            chart: {
                type: 'spline',
                //animation: Highcharts.svg, // don't animate in old IE
                marginRight: 10,
                events: {
                    load: function() {

                        // set up the updating of the chart each second
                        var series = this.series[0];
                        setInterval(function() {
                            var x = (new Date()).getTime(), // current time
                                y = Math.random();
                            series.addPoint([x, y], true, true);
                        }, 1000);
                    }
                }
            },
            title: {
                text: 'Live random data'
            },
            xAxis: {
                type: 'datetime',
                tickPixelInterval: 150
            },
            yAxis: {
                title: {
                    text: 'Value'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                formatter: function() {
                        return '<b>'+ this.series.name +'</b><br/>'+
                        Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) +'<br/>'+
                        Highcharts.numberFormat(this.y, 2);
                }
            },
            legend: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            series: [{
                name: 'Random data',
                data: (function() {
                    // generate an array of random data
                    var data = [],
                        time = (new Date()).getTime(),
                        i;

                    for (i = -19; i <= 0; i++) {
                        data.push({
                            x: time + i * 1000,
                            y: Math.random()
                        });
                    }
                    return data;
                })()
            }]
        });

    };
});