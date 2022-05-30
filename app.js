function final(){
    var filePath="data.csv";
    question0(filePath);
    plot1(filePath);
    plot2(filePath);
    plot3(filePath);
    plot4(filePath);
    plot5(filePath);
}

var question0=function(filePath){
    d3.csv(filePath).then(function(data){
        console.log(data[0])
    });
}
/*
how has the average amount of 3 pointers guards and small 
forwards attempt per game changed since Stephen Curry was drafted in 2009?
Value 1: year
Value 2: average of 3PA – 3-Point Field Goal 
Attempts per game for each small forward and guard
*/
var plot1=function(filePath){
    var rowConverter = function(d){
        return {
            position_cleaned: d.position_cleaned,
            "3PA": parseInt(d['3PA']),
            Year: parseInt(d.Year),
            player: d.Player
            }
    };
    d3.csv(filePath, rowConverter).then(function(data){
        var width = 1000;
        var height = 1000;
        var margin = {
            top: 50, bottom: 50, left: 50, right: 50
        }
        var filt = data.filter(function(d){ 
            return d['Year'] >= 2010 && (d.position_cleaned == 'g' || d.position_cleaned == 'sf') && d['3PA'] > 10; 
        });
        // var med = d3.median(filt, d=>d['3PA']);
        // var filt = filt.filter(function(d){ 
        //     return d['3PA'] >= med; 
        // });
        var xScaleLabel = d3.scaleBand()
            .domain(d3.range(2009, 2018, 1))
            .range([margin.left, width-margin.right])
            .paddingInner(.5);

        var xAxis = d3.axisBottom().scale(xScaleLabel)
                .tickValues(d3.range(2010, 2018, 1));

        var yInterval = 50;
        var yScale = d3.scaleLinear()
            .domain([0,d3.max(filt, d=>d['3PA'])+yInterval+1])
            .range([height-margin.top,margin.bottom]);
        var yAxis = d3.axisLeft().scale(yScale)
            .tickValues(d3.range(0, d3.max(filt, d=>d['3PA'])+yInterval+1, yInterval));
        var svg = d3.select("#plot1")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .call(d3.zoom().on("zoom", function () {
                svg.attr("transform", d3.zoomTransform(this))
            }))
            .append("g");
        svg.append("g").call(xAxis).attr("class","xAxis")
            .transition()
            .attr('transform', 'translate(0,' + (height-margin.bottom) + ")");
        svg.append("g").call(yAxis).attr("class","yAxis")
            .transition()
            .attr('transform', 'translate(' + margin.left + ",0)");
             
        var colors = {'sf': 'royalblue', 'g':'sienna'}
        var scatter = svg.append('g')
                    .attr("clip-path", "url(#clip)")
        scatter.selectAll("circles")
            .data(filt).enter()
            .append("circle")
            .attr("class", "hello")
            .attr('transform', 'translate(' + (xScaleLabel.bandwidth()/2) + ", 0)")
            .attr("cx", function(d) {
                return xScaleLabel(d.Year);
            })
            .attr("cy", function(d) {
                return yScale((d['3PA']));
            })
            .attr("r", function(d, i) {
                return 5;
            })
            .attr("fill", function(d, i){
                return colors[d.position_cleaned];
            })
            ;
        var tooltip = d3.select("#plot1")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")
        var mouseover = function(e,d) {
                tooltip
                  .style("opacity", 1)
                d3.select(this)
                  .style("stroke", "black")
                  .style("opacity", 1)
              }
        var mousemove = function(e,d) {
                var string = "Player: " + d.player;
                if (d.position_cleaned == 'g') {
                    var pos = "Guard";
                }
                else {
                    var pos = "Small Forward";
                }
                var string = string + "<br>Position: " + pos;
                var string = string + "<br>Total 3PA: " + d['3PA'];
                var prev = d.Year - 1;
                console.log(prev)
                var string = string + "<br>Season: " + prev + "-" + d.Year;
                tooltip
                  .html(string)
                  .style("left", (d3.pointer(e)[0] + 100) + "px")
                  .style("top", (d3.pointer(e)[1] + 180) + "px")
              }
        var mouseleave = function(e,d) {
                tooltip
                  .style("opacity", 0)
                d3.select(this)
                  .style("stroke", "none")
                  .style("opacity", 0.8)
              }
        svg.selectAll(".hello")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            ;
    });
}
var plot2=function(filePath){
    var rowConverter = function(d){
        return {
            player_cleaned_nice: d.player_cleaned_nice,
            Year: parseInt(d.Year),
            minutes_running: parseInt(d.minutes_running)
            }
    };
    d3.csv(filePath, rowConverter).then(function(data){
        var width = 2000;
        var height = 1000;
        var margin = {
            top: 50, bottom: 50, left: 200, right: 50
        }
        var svg = d3.select("#plot2")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom);
        var filt = data.filter(function(d){ 
                        return d['Year'] >= 1952; 
                    });
        var filt = filt.sort(function(a, b){
            // Sort by count
            var dyear = a.Year - b.Year;
            if(dyear) return dyear;

            // If there is a tie, sort by TRB
            var dreb = b.minutes_running - a.minutes_running;
            return dreb;
        });
        var playerSums = d3.flatRollup(filt, function(d) {
            return {
                player: d[0].player_cleaned_nice,
                career_minutes_played: d3.max(d, d => d.minutes_running),
                year: d[0].Year
            }
        }
        , d => d.Year); 
        var playerSums = playerSums.map(([year, values]) => ({year, ...values}));
        var current_years = d3.range(1952, 2018, 1);
        var xScaleLabel = d3.scaleBand()
            .domain(d3.range(1951, 2018, 1))
            .range([margin.left, width-margin.right])
            .paddingInner(.5);

        var xAxis = d3.axisBottom().scale(xScaleLabel)
                .tickValues(current_years);

        var mx_minutes = d3.max(playerSums, d=>d.career_minutes_played);
        var yScale = d3.scaleLinear()
                        .domain([0,mx_minutes+2001])
                        .range([height-margin.bottom, margin.top]);
        var yInterval = 2000;
        var yAxis = d3.axisLeft().scale(yScale)
            .tickValues(d3.range(0, mx_minutes + 2001, yInterval));
        svg.selectAll('rect')
            .data(playerSums)
            .enter()
            .append('rect')
            .attr("class", "bars")
            .attr('x', function(d, i){
                return xScaleLabel(d.year);
            })
            .attr('y', function(d){
			    return yScale(d.career_minutes_played);
		    })
		    .attr('width', function(d){
			    return xScaleLabel.bandwidth();
		    })
		    .attr('height', function(d, i){
                return height - margin.bottom - yScale(d.career_minutes_played);
		    })
            .attr('fill', 'orange');
        svg.append("g").call(xAxis)
            .attr("class","xAxis")
            .transition()
            .attr('transform', 'translate(0,' + (height-margin.bottom) + ")")
            .selectAll("text")
            .attr("x",-10)
            .attr('text-anchor', 'end')
            .attr("transform","rotate(-50)")
            .attr("font-size", 20);
        svg.append("g").call(yAxis)
            .attr("class","yAxis")
            .transition()
            .attr('transform', 'translate(' + (margin.left) + ", 0)")
            .selectAll("text")
            .attr("font-size", 20);
        var tooltip = d3.select("#plot2")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("padding", "5px")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px");
        var mouseover = function(e,d) {
                tooltip
                    .style("opacity", 1)
                d3.select(this)
                    .style("stroke", "black")
                    .style("opacity", 1)
              }
        var mousemove = function(e,d) {
                var string = "Player: " + d.player;
                var string = string + "<br>Total Career Minutes: " + d.career_minutes_played;
                var prev = d.year - 1;
                var string = string + "<br>Season: " + prev + "-" + d.year;
                var y = d3.max([d3.pointer(e)[1] + 500, height-margin.top]);
                tooltip
                  .html(string)
                  .style("left", (d3.pointer(e)[0] + 100) + "px")
                  .style("top", (y + 500) + "px")
        }
        var mouseleave = function(e,d) {
                tooltip
                  .style("opacity", 0)
                d3.select(this)
                  .style("stroke", "none")
              }
        svg.selectAll(".bars")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            ;
    });
}
/*
This graph will answer the question – do the best rebounders grab more offensive 
rebounds or more defensive rebounds? For every season find the player who grabbed 
the most rebounds that season and create a stacked bar chart with the total number 
of offensive rebounds grabbed and the total number of defensive rebounds grabbed that season. 
*/
var plot3=function(filePath){
    var rowConverter = function(d){
        return {
            player_cleaned_nice: d.player_cleaned_nice,
            Year: parseInt(d.Year),
            time_period: d.time_period,
            ORB: parseInt(d.ORB),
            DRB: parseInt(d.DRB),
            TRB: parseInt(d.TRB),
            }
    };
    d3.csv(filePath, rowConverter).then(function(data){
        var width = 1000;
        var height = 1000;
        var margin = {
            top: 50, bottom: 50, left: 50, right: 50
        }
        var svg = d3.select("#plot3")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom);
        var filt = data.filter(function(d){ 
            return d['time_period'] == '1974-1989'; 
        });
        var filt = filt.sort(function(a, b){
            // Sort by count
            var dyear = a.Year - b.Year;
            if(dyear) return dyear;

            // If there is a tie, sort by TRB
            var dreb = b.TRB - a.TRB;
            return dreb;
        });
        var maxes = d3.flatRollup(filt, function(d) {
            return {
                player: d[0].player_cleaned_nice,
                trb: d3.max(d, d => d.TRB),
                orb: d[0].ORB,
                drb: d[0].DRB
            }
        }
        , d => d.Year); 
        var maxes = maxes.map(([year, values]) => ({year, ...values}));
        var current_years = d3.range(1974, 1990, 1);
        var categories = ['orb', 'drb']
        var stacked  = d3.stack().keys(categories)(maxes);
        var xScaleLabel = d3.scaleBand()
            .domain(d3.range(1973, 1990, 1))
            .range([margin.left, width-margin.right])
            .paddingInner(.5);

        var xAxis = d3.axisBottom().scale(xScaleLabel)
                .tickValues(current_years);

        var mx_trb = d3.max(maxes, d=>d.trb);
        var yScale = d3.scaleLinear()
                        .domain([0,mx_trb+101])
                        .range([height-margin.bottom, margin.top]);
        var yInterval = 100;
        var yAxis = d3.axisLeft().scale(yScale)
            .tickValues(d3.range(0, mx_trb + 101, yInterval));
        var colors = d3.scaleOrdinal()
                        .domain(d3.range(categories.length))
                        .range(['red', 'blue']);

        var groups = svg.selectAll('.gbars')
                        .data(stacked)
                        .enter()
                        .append('g')
                        .attr('class', 'gbars')
                        .attr('fill', function(d,i){
                            return colors(i)
                        });
		groups.selectAll('rect')
            .data(function(d){
                return d;
            })
            .enter()
            .append('rect')
            .attr('x', function(d, i){
                return xScaleLabel(current_years[i]);
            })
            .attr('y', function(d){
			    return yScale(d[1]);
		    })
		    .attr('width', function(d){
			    return xScaleLabel.bandwidth();
		    })
		    .attr('height', function(d, i){
                var diff = yScale(d[0]) - yScale(d[1]);
                return diff;
		    });
        svg.append("g").call(xAxis)
            .attr("class","xAxis")
            .transition()
            .attr('transform', 'translate(0,' + (height-margin.bottom) + ")")
            .selectAll("text")
            .attr('text-anchor', 'end');
        svg.append("g").call(yAxis)
            .attr("class","yAxis")
            .transition()
            .attr('transform', 'translate(' + (margin.left) + ", 0)");
        svg.selectAll("labels")
            .data(maxes).enter().
            append("text")
            .attr("class","labels")
            .text(function(d) { 
                return d['player'];
            })
            .attr("x", function(d,i){
                return xScaleLabel(current_years[i]);
            })
            .attr("y", function(d,i){
                return height-margin.bottom;
            })
            .attr("font-size" , "20px")
            .attr("fill" , "black")
            .attr("transform", function (d,i) {
                var x = xScaleLabel(current_years[i]) 
                return `rotate(-90, ${x}, ${height-(margin.bottom + 20)})`
            });     
        var categ_labels = ['Offensive Rebounds', 'Defensive Rebounds']   
        d3.range(categ_labels.length).forEach( function (i) {
            var subCateg = categ_labels[i];
            svg.selectAll("legend")
                .data([1])
                .enter()
                .append("circle")
                .attr("cx", width-150)
                .attr("cy", (i*30) + 60)
                .attr("fill", colors(i))
                .attr("r", 10)
            svg.selectAll("legend")
                .data(["sales"])
                .enter()
                .append("text")
                .attr("x", width-120)
                .attr("y", (i*30) + 60 + 5)
                .attr("font-size",20)
                .text(subCateg);
        });
        var radio = d3.select('#radio_plot3')
            .attr('name', 'period').on("change", function (d) {
                svg.selectAll("rect").remove();
                svg.selectAll(".gbars").remove();
                svg.selectAll(".labels").remove();
                svg.select(".xAxis").remove();
                svg.select(".yAxis").remove();
                var current_period = d.target.value;
                if (current_period == '1974-1989') {
                    var current_years = d3.range(1974, 1990, 1);
                    var current_years_axes = d3.range(1973, 1990, 1);
                }
                else if (current_period == '1990-1999') {
                    var current_years = d3.range(1990, 2000, 1);
                    var current_years_axes = d3.range(1989, 2000, 1);
                }
                else {
                    var current_years = d3.range(2000, 2018, 1);
                    var current_years_axes = d3.range(1999, 2018, 1);
                }
                var filt = data.filter(function(d){ 
                    return d['time_period'] == current_period; 
                });
                var filt = filt.sort(function(a, b){
                    // Sort by count
                    var dyear = a.Year - b.Year;
                    if(dyear) return dyear;
        
                    // If there is a tie, sort by TRB
                    var dreb = b.TRB - a.TRB;
                    return dreb;
                });
                var maxes = d3.flatRollup(filt, function(d) {
                    return {
                        player: d[0].player_cleaned_nice,
                        trb: d3.max(d, d => d.TRB),
                        orb: d[0].ORB,
                        drb: d[0].DRB
                    }
                }
                , d => d.Year); 
                var maxes = maxes.map(([year, values]) => ({year, ...values}));
                var categories = ['orb', 'drb']
                var stacked  = d3.stack().keys(categories)(maxes);
                var xScaleLabel = d3.scaleBand()
                    .domain(current_years_axes)
                    .range([margin.left, width-margin.right])
                    .paddingInner(.5);
                
                var xAxis = d3.axisBottom().scale(xScaleLabel)
                        .tickValues(current_years);
        
                var mx_trb = d3.max(maxes, d=>d.trb);
                var yScale = d3.scaleLinear()
                                .domain([0,mx_trb+101])
                                .range([height-margin.bottom, margin.top]);
                var yInterval = 100;
                var yAxis = d3.axisLeft().scale(yScale)
                    .tickValues(d3.range(0, mx_trb + 101, yInterval));
                var colors = d3.scaleOrdinal()
                                .domain(d3.range(categories.length))
                                .range(['red', 'blue']);
                var groups = svg.selectAll('.gbars')
                                .data(stacked)
                                .enter()
                                .append('g')
                                .attr('class', 'gbars')
                                .attr('fill', function(d,i){
                                    return colors(i)
                                });
                groups.selectAll('rect')
                    .data(function(d){
                        console.log(d)
                        return d;
                    })
                    .enter()
                    .append('rect')
                    .attr('x', function(d, i){
                        return xScaleLabel(current_years[i]);
                    })
                    .attr('y', function(d){
                        return yScale(d[1]);
                    })
                    .attr('width', function(d){
                        return xScaleLabel.bandwidth();
                    })
                    .attr('height', function(d, i){
                        var diff = yScale(d[0]) - yScale(d[1]);
                        return diff;
                    });
                svg.append("g").call(xAxis)
                    .attr("class","xAxis")
                    .transition()
                    .attr('transform', 'translate(0,' + (height-margin.bottom) + ")")
                    .selectAll("text")
                    .attr('text-anchor', 'end');
                svg.append("g").call(yAxis)
                    .attr("class","yAxis")
                    .transition()
                    .attr('transform', 'translate(' + (margin.left) + ", 0)");
                svg.selectAll("labels")
                    .data(maxes).enter().
                    append("text")
                    .attr("class","labels")
                    .text(function(d) { 
                        return d['player'];
                    })
                    .attr("x", function(d,i){
                        return xScaleLabel(current_years[i]);
                    })
                    .attr("y", function(d,i){
                        return height-margin.bottom;
                    })
                    .attr("font-size" , "20px")
                    .attr("fill" , "black")
                    .attr("transform", function (d,i) {
                        var x = xScaleLabel(current_years[i]) 
                        return `rotate(-90, ${x}, ${height-(margin.bottom + 20)})`
                    });     
            });
    });
}
/*
united states counts
*/
var plot4=function(filePath) {
    var rowConverter = function(d){
        return {
            state: d.state,
            Player: (d.Player)
            }
    };
    d3.csv(filePath,rowConverter).then(function(data) {
        var width = 960;
        var height = 500;
        var margin = {
            top: 50, bottom: 50, left: 50, right: 50
        }
        var svg = d3.select("#plot4")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom);
        // State Symbol dictionary for conversion of names and symbols.
        var stateSym = {
        AZ: 'Arizona',
        AL: 'Alabama',
        AK: 'Alaska',
        AR: 'Arkansas',
        CA: 'California',
        CO: 'Colorado',
        CT: 'Connecticut',
        DC: 'District of Columbia',
        DE: 'Delaware',
        FL: 'Florida',
        GA: 'Georgia',
        HI: 'Hawaii',
        ID: 'Idaho',
        IL: 'Illinois',
        IN: 'Indiana',
        IA: 'Iowa',
        KS: 'Kansas',
        KY: 'Kentucky',
        LA: 'Louisiana',
        ME: 'Maine',
        MD: 'Maryland',
        MA: 'Massachusetts',
        MI: 'Michigan',
        MN: 'Minnesota',
        MS: 'Mississippi',
        MO: 'Missouri',
        MT: 'Montana',
        NE: 'Nebraska',
        NV: 'Nevada',
        NH: 'New Hampshire',
        NJ: 'New Jersey',
        NM: 'New Mexico',
        NY: 'New York',
        NC: 'North Carolina',
        ND: 'North Dakota',
        OH: 'Ohio',
        OK: 'Oklahoma',
        OR: 'Oregon',
        PA: 'Pennsylvania',
        RI: 'Rhode Island',
        SC: 'South Carolina',
        SD: 'South Dakota',
        TN: 'Tennessee',
        TX: 'Texas',
        UT: 'Utah',
        VT: 'Vermont',
        VA: 'Virginia',
        WA: 'Washington',
        WV: 'West Virginia',
        WI: 'Wisconsin',
        WY: 'Wyoming'
        };
        var filt = data.filter(function(d){ 
            return (d['state'] != ''); 
        });
        var players = [...new Set(data.map(d => d.Player))];
        var statesCount = {};
        var playerDict = {};
        statesCount['Vermont'] = 0;
        d3.rollup(filt, 
            function (d) {
                playerDict[d[0].Player] = d[0].state;
            }
            , d => d.Player
        );
        players.forEach(function (p) {
            var state = playerDict[p]
            if (state in statesCount) {
                var curr = statesCount[state];
                statesCount[state] = curr + 1;
            }
            else {
                statesCount[state] = 1;
            }
        })
        var svg = d3.select("#plot4")
            .append("svg")
            .attr("width", width)
            .attr("height", height);
        var states = Object.keys(statesCount);
        var counts = Object.values(statesCount);
        let logScale = d3.scaleLog()
            .domain([d3.min(counts)+1, d3.max(counts)])
            .range([0, 1]);
        var logCountsArr = [];
        states.forEach((s) => logCountsArr.push(logScale(statesCount[s])));
        const projection1 = d3.geoAlbersUsa().scale(900,900); //chain translate and scale
        const pathgeo1 = d3.geoPath().projection(projection1); 
        const statesmap = d3.json('us-states.json');
        statesmap.then(function (map) {
            var myColor = d3.scaleSequential()
                .domain([d3.min(logCountsArr), d3.max(logCountsArr)])
                .interpolator(d3.interpolateYlGnBu);
            var tooltip = d3.select("#plot4")
                .append("div")
                .style("opacity", 0)
                .attr("class", "tooltip")
                .style("border", "solid")
                .style("border-width", "2px")
                .style("border-radius", "5px")
                .style("padding", "5px")
            var mouseover = function(e,d) {
                    tooltip
                      .style("opacity", 1)
                    d3.select(this)
                      .style("stroke", "black")
                      .style("stroke-width", 2)
                      .style("opacity", 0.8)
                  }
            var mousemove = function(e,d) {
                    var state = stateSym[d['properties']['name']];
                    var count = statesCount[state];
                    var coords = projection1(d.geometry.coordinates[0][0]);
                    if (count == 1) {
                        var string = "There is " + count + " NBA player from " + state + ".";
                    }
                    else {
                        var string = "There are " + count + " NBA players from " + state + ".";
                    }
                    tooltip
                      .attr("transform", "translate(50,50")
                      .html(string)
                      .style("opacity", 1)
                  }
            var mouseleave = function(e,d) {
                    tooltip
                      .style("opacity", 0)
                    d3.select(this)
                      .style("stroke", "black")
                      .style("stroke-width", 1)
                      .style("opacity", 1)
                  }
            svg.selectAll("path")
                .data(map.features)
                .enter().append("path").attr("d", pathgeo1)
                .attr("fill", function (d) {
                    var state = stateSym[d['properties']['name']];
                    var count = statesCount[state];
                    if (state == 'Vermont') {
                        return myColor(count)
                    }
                    var logged = logScale(count);
                    return myColor(logged);
                })
                .style("stroke","black")
                .style("stroke-width", 0.5)
            svg.selectAll("path")
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)
                ;
        });
        var myColor = d3.scaleSequential()
                .domain([d3.min(logCountsArr), d3.max(logCountsArr)])
                .interpolator(d3.interpolateYlGnBu);
        var legend = svg.selectAll('g.legendEntry')
            .data(myColor.ticks())
            .enter()
            .append('g').attr('class', 'legendEntry');

        legend.append('rect')
            .attr("x", 0)
            .attr("y", function(d, i) {
                return i * 20;
            })
            .attr("width", 10)
            .attr("height", 10)
            .style("stroke", "black")
            .style("stroke-width", 1)
            .style("fill", function(d){return myColor(d);}); 
        legend
            .append('text')
            .attr('font-size', 12)
            .attr("x", 15) 
            .attr("y", function(d, i) {
            return i * 20;
            })
            .attr("dy", "0.8em") 
            .text(function(d,i) {
                var curr = logScale.invert(d);
                if (i == 0) {
                    return Math.round(+0) + " - " + Math.round(+curr);
                }
                var prev = logScale.invert(myColor.ticks()[i-1]);
                return Math.round(prev) + " - " + Math.round(+curr);
            });
        
    });
}

    var plot5 = function(filePath){
        var rowConverter = function(d){
            return {
                player_cleaned: d.player_cleaned,
                PPG: parseFloat(d.PPG)
                }
        };
        d3.csv(filePath, rowConverter).then(function(data){
            var width = 1000;
            var height = 1000;
            var margin = {
                top: 50, bottom: 50, left: 50, right: 50
            }
            var center = height/2;
            var boxwidth = width/4;
            var svg = d3.select("#plot5")
                        .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom);
            var filt = data.filter(function(d){ 
                return d['player_cleaned'] == 'lebron james'; 
            });
            var data_sorted = d3.sort(filt, d=>d.PPG)
            var data_sorted = d3.map(data_sorted, d=>d.PPG);
            var q1 = d3.quantile(data_sorted, .25)
            var median = d3.quantile(data_sorted, .5)
            var q3 = d3.quantile(data_sorted, .75)
            var interQuantileRange = q3 - q1
            var min = q1 - 1.5 * interQuantileRange
            var max = q1 + 1.5 * interQuantileRange

            // Show the Y scale
            var y = d3.scaleLinear()
                .domain([d3.min(data_sorted), d3.max(data_sorted) + 1])
                .range([height-margin.top, margin.bottom]);
            var yAxis = d3.axisLeft().scale(y)
                    .tickValues(d3.range(d3.min(data_sorted), d3.max(data_sorted) + 1, 1));
            svg.append("g").call(yAxis)
                    .attr("class","yAxis")
                    .transition()
                    .attr('transform', 'translate(' + (margin.left) + ", 0)");

            // Show the main vertical line
            svg
            .append("line")
            .attr("x1", center)
            .attr("x2", center)
            .attr("y1", y(min) )
            .attr("y2", y(max) )
            .attr("stroke", "black")

            // Show the box
            svg
            .append("rect")
            .attr("x", center - boxwidth/2)
            .attr("y", y(q3) )
            .attr("height", (y(q1)-y(q3)) )
            .attr("width", boxwidth )
            .attr("stroke", "black")
            .style("fill", "#69b3a2")

            // show median, min and max horizontal lines
            svg
            .selectAll("toto")
            .data([min, median, max])
            .enter()
            .append("line")
            .attr("x1", center-boxwidth/2)
            .attr("x2", center+boxwidth/2)
            .attr("y1", function(d){ return(y(d))} )
            .attr("y2", function(d){ return(y(d))} )
            .attr("stroke", "black")
                    });
    }
    
