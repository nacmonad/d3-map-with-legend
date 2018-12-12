var format = d3.format(",");


var margin = {top: 0, right: 0, bottom: 0, left: 0},
            width = 800 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

var color = d3.scaleThreshold()
    .domain([10000,100000,500000,1000000,5000000,10000000,50000000,100000000,500000000,1500000000])
    .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)","rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)","rgb(3,19,43)"]);

var path = d3.geoPath();

var svg = d3.select(".infographic")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append('g')
            .attr('class', 'map');

// western hemisphere
var projection = d3.geoMercator()
                   .scale(220)
                   .translate( [0.95*width , height/1.15 ]);

var path = d3.geoPath().projection(projection);

var validCountries = ["Canada", "Mexico", "Peru"]
//svg.call(tip);
var active = d3.select(null)
queue()
    .defer(d3.json, "/data/world_countries.json")
    .defer(d3.json, "/data/locations.json")
    .await(drawMap)
    //.await(drawLocations);





function clicked(d){

  if (active.node() === this) {
    d3.select('.legend').classed("hidden", true)
    return reset();
  }
  // //reset others
  reset();
  active.classed("active", false);
  active = d3.select(this).classed("active", true).attr("r", 7);
  //draw the legend here
  d3.select('.legend').classed("hidden", false)
  d3.select('.legend-header').html(d.name)
  d3.select('.legend-content').html(`<ul>
        ${d.notes.map(n=>{
          return `<li>${n}</li>`
        }).reduce((a,b)=>a+b)}
      </ul>`);

}
function reset() {
  active.classed("active", false)
    .transition()
    .duration(250)
    .attr("r", 5);
  active = d3.select(null);
}
function drawMap(error, data, locations) {
  if(!error) {

      svg.append("g")
          .attr("class", "countries")
        .selectAll("path")
          .data(data.features)
        .enter().append("path")
          .attr("d", path)
          //.style("fill", function(d) { return color(populationById[d.id]); })
          .style('stroke', 'white')
          .style('stroke-width', 1.5)
          .style("opacity",0.8)
          .style('fill', function(d){
            if(validCountries.find(vc=>vc===d.properties.name)) return '#1e51a4'
            return '#abaebe'
          })

      drawLocations(data,locations)
  } else {
    //errr
    console.log(error)
  }


}
function drawLocations(data, locations) {
    svg
        .append("g")
        .attr("class", "pins")
        .selectAll(".pins")
        .data(locations)
        .enter().append("circle", ".pins")
        .attr("class", "location-pin")
        .attr("z-index", 10)
        .attr("r", 5)
        .attr("transform", function(d) {
        return "translate(" + projection([
          d.location.longitude,
          d.location.latitude
        ]) + ")";
        })
        .attr("fill", function(d){
          if(d.type === 'Producing Asset') return 'white'
          return 'red'
        })
        .on('click', clicked)
        .on('mouseover',function(d){
          //tip.show(d);
          d3.select(this)
            .style("opacity", 1)
            //.style("pointer-events", "none")
          .transition()
            .duration(250)
            .attr("r", "7")

        })
        .on('mouseleave', function(d){
          //tip.hide(d);
          if(!this.getAttribute('class').includes('active')) {
            d3.select(this)
              .style("opacity", 0.8)
              .transition()
                .duration(250)
                .attr("r", "5");
          }

        });
        // .on('mouseover', tip.show)
        // .on('click', tip.hide);

}
