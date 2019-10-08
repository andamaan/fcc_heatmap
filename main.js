import * as d3 from 'd3'

const svg = d3.select('svg')
const div = d3.select('div')

const width = +svg.attr('width')
const height = +svg.attr('height')

const render = (data, dataArr) => {
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
    const itemSize = 22
    const cellSize = itemSize - 1
    const colors = ["#a50026","#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4","#313695"].reverse()


    const margin = {top: 25,right: 25,bottom: 175,left: 115 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    //DATA VALUES
    const xValue = dataArr.map(d => d.year)
    const xAxisLabel = 'Year'
    const yValue = d => dataArr.map(d => d.month)
    const yAxisLabel = 'Months'

    //SCALES

    const xScale = d3.scaleLinear()
    .domain([d3.min(dataArr, d => d.year -1 ), d3.max(dataArr, d => d.year +1)])
    .range([0, innerWidth])

    const yScale = d3.scaleBand()
        .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
        .range([0, innerHeight])
        .padding( [0] )


    //CONST for colorScale
    const variance = dataArr.map(val => val.variance)
    const minTemp = data.baseTemperature + d3.min(dataArr, d => d.variance)
    const maxTemp = data.baseTemperature + d3.max(dataArr, d => d.variance)

    const colorFunction = (min, max, count) => {
        let array = []
        const step = (max-min)/ count
        const base = min
        for (let i = 1; i < count; i++){
            array.push(base + i*step)
        }
        return array
    }

    const colorScale = d3.scaleThreshold()
        .domain(colorFunction(minTemp, maxTemp, colors.length))
        //.domain([d3.min(dataArr, d => data.baseTemperature + d.variance ), d3.max(dataArr, d => data.baseTemperature + d.variance)])
        .range(colors);

    //AXIS
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format("d"))


    const yAxis = d3.axisLeft(yScale)
        .tickFormat((val) => d3.timeFormat("%B")(new Date(1970, val - 1, 1)) )
        .tickSize(10,1)
        .tickSizeOuter(0)


    svg.append('g')
        .attr('transform', `translate(${margin.left},${innerHeight + margin.top})`)
        .call(xAxis)
        .attr('id', 'x-axis')

     // x-axis label
    svg.append("text")
        .text(xAxisLabel)
        .attr("text-anchor", "middle" )
        .attr("x", innerWidth + 90)
        .attr("y", innerHeight + 75)
        .attr('fill', 'black')
        .style('font-size', '18px')


    svg.append('g')
        .attr('transform', `translate(${margin.left},${ margin.top})`)
        .call(yAxis)
        .attr('id', 'y-axis')

    //y-axis label
    svg.append("text")
    .text(yAxisLabel)
    .attr("text-anchor", "middle" )
    .attr("x", 30)
    .attr("y", 60)
    .attr("transform", "rotate(-90, " + 30 + ", " + 60 + ")" )
    .attr('fill', 'black')
    .style('font-size', '18px')

    //Preparing tooltip
    const div = d3.select("body").append("div")
    .attr("id", "tooltip")
    .style("opacity", 0)



    //MAP
    svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)
        .selectAll('rect')
            .data(data.monthlyVariance)
            .enter().append('rect')
                .attr('class', 'cell')
                .attr('data-month', d => d.month - 1)
                .attr('data-year', d => d.year)
                .attr('data-temp', d => data.baseTemperature + d.variance)
                .attr('width', 4.3)
                .attr('height', yScale.bandwidth() )
                .attr('x', d =>  xScale(d.year)-1.5)
                .attr('y', d =>  yScale(d.month))
                .attr('fill', d => colorScale(data.baseTemperature + d.variance))
                .on("mouseover", function(d) {
                    div.attr('data-year', d.year)
                    .html(d3.timeFormat("%B %Y")(new Date(d.year, d.month - 1, 1)) + "<br/>" + (data.baseTemperature + d.variance) + "°C")
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px")
                        .style("opacity", 1)

                    })
                .on("mouseout", function(d) {
                    div.style("opacity", 0);
                    });
    //Legend

    const colorLegendArr = (min, max, count) => {
        let array = []
        const step = (max-min)/ count
        const base = min
        for (let i = 1; i < count; i++){
            array.push(`${(base + i*step).toFixed(2)} °C`)
        }
        console.log(array)
        return array
    }

    const legendXScale = d3.scaleBand()
        .domain(colorLegendArr(minTemp, maxTemp, colors.length))
        .range([0, 500])
        .padding([0])

    const legendXAxis = d3.axisBottom(legendXScale)
        .tickSizeOuter(0)

    svg.append('g')
        .attr('transform', `translate(250,425)`)
        .call(legendXAxis)

    svg.append('g')
        .attr('transform', `translate(250,400)`)
        .attr('id', 'legend')
        .selectAll('rect')
        .data(legendXScale.domain())
        .enter().append('rect')
            .attr('width', legendXScale.bandwidth() )
            .attr('height', 25)  
            //.attr('x', d => colorScale(d))
            .style('fill', d => colorScale(d[0]))

}

d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
  .then(data => {
      const dataArr = data.monthlyVariance
        dataArr.forEach(d => {
            d.year = +d.year
            //d.variance = +d.variance
        });
    render(data, dataArr);
  });