window.onload = function() {

  var data;
  var newData = [];
  var d3 = window.d3;
  var w = 1200;
  var h = 600;

  var key = function(d) {
    return d.key;
  }

  var padding = 20;
  var margin = {
    top: 30,
    bottom:80,
    left: 100,
    right: 70
  };

  var width = w - margin.left - margin.right;
  var height = h - margin.top - margin.bottom;
  var controls = d3.select(".sort").append("div")
                   .attr("id", "controls");

  var sortButton = controls.append("button").html("Sort data: ascending").attr("class", "btn btn-secondary btn-sm sort border-2")
                           .attr("state", 0);
  var formatDecimalComma = d3.format(",.2f")
  var formatMoney = function(d)  {
    return "$" + formatDecimalComma(d);
  };

  var rowParser = function(d) {
    return {
      name: d.name,
      company: d.company,
      year: parseInt(d.year),
      compensation: parseInt(d.compensation.replace(/[^0-9\.-]+/g,"")),
      industry: d.industry,
      code: d.code,
      key: parseInt(d.key)
    }
  }

  var svg = d3.select(".svg").append("svg").attr("width", w).attr("height", h);
  var tooltip = d3.select("body").append("div").attr("class", "toolTip");
  var chart = svg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



  d3.csv("ceo-data.csv", rowParser, function(dataset) {
    data = dataset;
    console.log(data);
    data.sort(function(a, b) {
      return a.comepensation - b.compensation;
    });
    graph()
  });


  function drawAxis() {

      var xScale = d3.scaleLinear().domain([0, d3.max(data, function(d) {
        return d.compensation;
      })]).range([0, width]);

      var yScale = d3.scaleBand().domain(data.map(function(d) {
        return d.name;
      })).padding(0.3).range([height, 0]);


      var xAxis = d3.axisBottom().scale(xScale).ticks(8).tickFormat(function(d) {
        return formatMoney(d);
      }).tickSizeInner([-height]);

      var yAxis = d3.axisLeft().scale(yScale);


      chart.append("g")
           .attr("class", "x axis")
           .attr("transform", "translate(0," + height + ")")
            .transition()
            .duration(500)
            .delay(100)
            .call(xAxis);

      chart.append("g")
          .attr("class", "y axis")
          .transition()
          .duration(500)
          .delay(100)
          .call(yAxis);
        }


  function graph() {

      var xScale = d3.scaleLinear().domain([0, d3.max(data, function(d) {
        return d.compensation;
      })]).range([0, width]);

      var yScale = d3.scaleBand().domain(data.map(function(d) {
        return d.name;
      })).padding(0.2).range([height, 0]);


      drawAxis();
      //enter()
      chart.selectAll(".bar")
           .data(data)
           .enter()
           .append("rect")
           .attr("class", "bar")
           .on("mouseover", function(d) {
              tooltip.style("left", d3.event.pageX + 20 + "px")
                     .style("top", d3.event.pageY - 20 + "px")
                     .style("fill", "red")
                     .style("display", "inline-block")
                     .html((d.name) + "<br>" + "$" + (d.compensation.toFixed(2)) + "<br>" + (d.company) + "<br>" + (d.industry.toUpperCase()) + "<br>" + (d.year))

            })
            .on("mouseout", function(d){ tooltip.style("display", "none");});


      //update()
      chart.selectAll(".bar")
           .transition()
           .duration(500)
           .delay(100)
           .attr("x", 0)
           .attr("height", yScale.bandwidth())
           .attr("y", function(d) {
             return yScale(d.name);
           })
           .attr("width", function(d) {
             return xScale(d.compensation);
           })

      //exit()
      chart.selectAll(".bar")
           .data(data)
           .exit()
           .remove()

      }
        sortButton.on("click", function() {


          var self = d3.select(this);
          var ascending = function(a,b) {
            return a.compensation - b.compensation;
          };

          var descending = function(a,b) {
            return b.compensation - a.compensation;
          }

          var state = +self.attr("state");
          var text = "Sort data: ";
          if(state === 0) {
            data.sort(ascending);
            state = 1;
            text += "descending";
          } else if(state === 1) {
            data.sort(descending);
            state = 0;
            text += "ascending";
          }
          console.log(data);

          self.attr("state", state);
          self.html(text);

          graph();

        })



        d3.select("#filterselect").on("change", function() {
            var threshold = d3.select(this).node().value;
            newData = data.filter(function(d) {
              if(threshold !== "all") {
                return d.code === threshold;
              } else {
                return newData = d;
              }
            })
            var bars = chart.selectAll(".bar")
                            .remove()
                            .exit()
                            .data(data)

            var xScale = d3.scaleLinear().domain([0, d3.max(newData, function(d) {
              return d.compensation;
            })]).range([0, width]);

            var yScale = d3.scaleBand().domain(newData.map(function(d) {
              return d.name;
            })).padding(0.2).range([height, 0]);


            var xAxis = d3.axisBottom().scale(xScale).ticks(8).tickFormat(function(d) {
              return formatMoney(d);
            }).tickSizeInner([-height]);

            var yAxis = d3.axisLeft().scale(yScale);

            chart.select(".x.axis")
                  .transition()
                  .duration(500)
                  .call(xAxis);

           chart.select(".y.axis")
             .transition()
             .duration(500)
             .call(yAxis);

           chart.selectAll(".bar")
             .data(newData)
             .transition()
             .duration(500)
             .attr("x", 0)
             .attr("height", yScale.bandwidth())
             .attr("y", function(d) {
               return yScale(d.name);
             })
             .attr("width", function(d) {
               return xScale(d.compensation);
             })

          chart.selectAll(".bar")
               .data(newData)
               .enter()
               .append("rect")
               .attr("class", "bar")
               .on("mouseover", function(d) {
                  tooltip.style("left", d3.event.pageX + 20 + "px")
                         .style("top", d3.event.pageY - 20 + "px")
                         .style("fill", "red")
                         .style("display", "inline-block")
                         .html((d.name) + "<br>" + "$" + (d.compensation.toFixed(2)) + "<br>" + (d.company) + "<br>" + (d.year))

                })
                .on("mouseout", function(d){ tooltip.style("display", "none");});




          chart.selectAll(".bar")
               .transition()
               .duration(500)
               .delay(100)
               .attr("x", 0)
               .attr("height", yScale.bandwidth())
               .attr("y", function(d) {
                 return yScale(d.name);
               })
               .attr("width", function(d) {
                 return xScale(d.compensation);
               })

          });


}
