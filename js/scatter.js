$(function(){

  $("#play-music").prop('disabled', true);
  $("#pause-music").prop('disabled', true);

  //set margins
  var margin = {top: 20, right: 20, bottom: 30, left: 15},
      width = 960 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;

  var svg = d3.select("#chart1").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //zoom is really buggy, working on it
    //   .call(d3.behavior.zoom().scaleExtent([1, 3]).on("zoom", zoom))
    // .append("g");

    // function zoom() {
    //   svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    //   svg.selectAll(".point").attr("r", 3/d3.event.scale);
    // }


  var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return(d.title + "<br>" + d.artist +
      "<br>Danceability: " + d.danceability +
      "<br>Energy: " + d.energy +
      "<br>Tempo: " + d.tempo +
      "<br>Artist Hotness: " + d.artistHotness +
      "<br>Song Hotness: " + d.songHotness
    );
  })

  //apply tooltips
  svg.call(tip);


	d3.json("data/dump.json", function(err, data) {
    if (err) { return 0 };

    //regular 0 to 1 scales for 0 to 1 vars, set axes
    var xScale = d3.scale.linear().range([0, width]).domain([0, 1]),
        xAxis = d3.svg.axis().scale(xScale).orient("bottom");

    var yScale = d3.scale.linear().range([height, 0]).domain([0, 1]),
        yAxis = d3.svg.axis().scale(yScale).orient("left");

    //get domain of tempo var, set scale
    minTempo = _.min(_.pluck(data, 'tempo'));
    maxTempo = _.max(_.pluck(data, 'tempo'))
    var tempoScale = d3.scale.linear().range([height, 0]).domain([minTempo, maxTempo]);
        tempoAxis = d3.svg.axis().scale(tempoScale).orient("left");

    var colorScale = d3.scale.linear()
      .range(["#2B44D9", "#2D77E3", "#3399CC", "#2DD6E3", "#2BD9B5"])
      .domain([0.0, 0.2, 0.6, 0.8, 1.0]);

    var xAxisSvg = svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Danceability");

    var yAxisSvg = svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Energy");

    /*make snd object available to global scope,
      use the same instance for each play*/
    snd = new Audio();

    //instantiate initial points
    //default party vs. dull profile
    var points = svg.selectAll(".point")
        .data(data)
        .enter().append("circle")
        .attr("class", "point")
        .attr("r", 3)
        .attr("cx", function(d) { return xScale(d.danceability) })
        .attr("cy", function(d) { return yScale(d.energy) })
        //darker blue: lower danceability; lighter blue: higher danceability
        .attr("fill", function(d) { return colorScale(d.danceability) })
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        .on("click", function(d) {
          //bring point to front
          this.parentNode.appendChild(this);
          //mark/unmark point
          if (d3.select(this).style("fill") == 'rgb(255, 0, 0)') {
            d3.select(this).transition().duration(250).attr("fill", function() {
              return colorScale(d.danceability);
            });
          } else {
            d3.select(this).transition().duration(250).attr("fill", "red");
          }
          //pause currently playing song
          snd.pause();
          //toggle play/pause buttons
          $("#pause-music").prop('disabled', false);
          $("#play-music").prop('disabled', true);
          //build file path to local music file, play music
          var file_path = d.path.split("Media/Music/")[1];
          var amended_path = "http://localhost:8090/" + file_path;
          snd = new Audio(amended_path);
          snd.play();

          $("#now-playing").html("Now Playing: " + d.title + " -- " + d.artist);
        });

    //Chill vs. Hype Profile
    //X by Y: energy by tempo
    //Color encoding: danceability
    $("#chill").click(function() {
        points
          .transition()
          .duration(5000)
          .ease("quad")
          .attr("cx", function(d) { return xScale(d.energy) })
          .attr("cy", function(d) { return tempoScale(d.tempo) })

        xAxisSvg
          .text("Energy");

        yAxisSvg
          .text("Tempo");
    });

    //Party vs. Dull Profile
    //X by Y: danceability by energy
    //Color encoding: danceability
    $("#party").click(function() {
      points
        .transition()
        .duration(5000)
        .ease("quad")
        .attr("cx", function(d) { return xScale(d.danceability)} )
        .attr("cy", function(d) { return yScale(d.energy) })

        xAxisSvg
          .text("Danceability");

        yAxisSvg
          .text("Energy")
          .call(tempoAxis);
    });

    //Hot vs. Cold Profile
    //X by Y: artist hotness by song hotness
    //Color encoding: danceability
    $("#hotness").click(function() {
      points
        .transition()
        .duration(5000)
        .ease("quad")
        .attr("cx", function(d) { return xScale(d.artistHotness) })
        .attr("cy", function(d) { return yScale(d.songHotness) })

      xAxisSvg
        .text("Artist Hotness");

      yAxisSvg
        .text("Song Hotness");
    });

    $("#pause-music").click(function() {
      snd.pause();
      $("#play-music").prop('disabled', false);
      $("#pause-music").prop('disabled', true);
    });

    $("#play-music").click(function() {
      snd.play();
      $("#pause-music").prop('disabled', false);
      $("#play-music").prop('disabled', true);
    });

    //jump ahead in the currently playing song
    $("#jump").click(function() {
      snd.currentTime = snd.currentTime + 5;
    });

    // $("#zoom-out").click(function() {
    //   svg.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    //   svg.selectAll(".point").attr("r", 3);
    // });

  });
});
