import * as d3 from 'd3'
import { legendColor } from 'd3-svg-legend'

const width = document.body.clientWidth - 50
const height = document.body.clientHeight - 125

const svg = d3.select('svg')
    .attr('width', width)
    .attr('height', height)
const div = d3.select('div')


const render = (data, dataArr) => {
    const itemSize = 22
    const colors = ["#a50026","#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4","#313695"].reverse()

    const margin = {top: 25,right: 25,bottom: 125,left: 115 }
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
    const baseTemp = data.baseTemperature
    const minTemp = baseTemp + d3.min(dataArr, d => d.variance)
    const maxTemp = baseTemp + d3.max(dataArr, d => d.variance)

    const colorFunction = (min, max, count) => {
        let array = []
        const step = (max-min)/ count
        const base = min
        for (let i = 1; i < count; i++){
            array.push(base + i*step)
        }
        console.log(array)
        return array
    }

    const colorScale = d3.scaleThreshold()
        .domain(colorFunction(minTemp, maxTemp, colors.length))
        .range(colors);

    //AXIS
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format("d"))
        .tickSizeOuter(0)



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
                    .html(d3.timeFormat("%B %Y")(new Date(d.year, d.month - 1, 1)) + "<br/>" + (data.baseTemperature + d.variance).toFixed(2) + "°C")
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px")
                        .style("opacity", 1)

                    })
                .on("mouseout", function(d) {
                    div.style("opacity", 0);
                    });

    //Legend
const legendPlaceHolder = svg
    .selectAll('.legendPH')
    .data([null])
    .enter().append('g')
        .attr('class', 'legendPH')
        .attr('id', 'legendPH')
        .attr('x', width /2)
        .attr('y', height - 30)
        .attr('transform', `translate(${width/2 - 250},${height-70})`)



const legendLabelArr = function() {
    let arr = []
    for (let i = 0; i < 10 ; i ++ ) {
        arr.push("");
    }
    arr[0] = minTemp.toFixed(2) + "°C";
    arr.push(maxTemp.toFixed(2)  + "°C" );
    
    let pivotPercentage =  (baseTemp - minTemp) / (maxTemp - minTemp)
    let legendPivotIndex = Math.round( pivotPercentage * 10 ) - 1

    arr[legendPivotIndex] = baseTemp + "°C"
    console.log(arr)
    return arr
}

const legend = legendColor()
    .shapeWidth( 50 ) 
    .shapeHeight( yScale.bandwidth() / 3 )
    .shapePadding( 0 )
    .cells( 10 ) 
    .orient("horizontal") 
    .scale( colorScale )
    .labels( legendLabelArr() )

    legendPlaceHolder
        .call(legend)



    /*console.log(minTemp)
    console.log(maxTemp)

    console.log(colorScale.domain())

    const legend = svg
    .selectAll('.legend')
    .data([null])
    .enter().append('g')
        .attr('class', 'legend')
        .attr('id', 'legend')
        .attr('x', width /2)
        .attr('y', height - 30)
        .attr('transform', `translate(${width/2 - 250},${height-70})`)

    const legendTicks = legend.selectAll('.tick')
        .data(colorScale.domain());
    const ticks = legendTicks
        .enter().append('g')
        .attr('class', 'tick');
    ticks
        .attr('transform', (d, i) =>  `translate(${i * 50}, 0)`)      
    ticks.append('rect')
        .attr('width', 50)
        .attr('height', 25)
        .attr('fill', colorScale);

    const legendXScale = d3.scaleLinear()
    .domain([minTemp, maxTemp])
    .range([0, 500])

    const legendXAxis = d3.axisBottom(legendXScale)
        .tickSizeOuter(0)

    legend.append('g')
        .attr('transform', `translate(0, 25)`)      
        .call(legendXAxis)*/

    /*
    const colorLegendArr = (min, max, count) => {
        let array = []
        const step = (max-min)/ count
        const base = min
        for (let i = 1; i < count; i++){
            array.push((base + i*step).toFixed(2))
        }
        console.log(array)
        return array
    }

    const legendXScale = d3.scaleBand()
        .domain(colorLegendArr(minTemp, maxTemp, colors.length))
        .range([0, 500])
        .padding([0])

    const legendX = () => {
        let array = [0]
        const step = 50
        const base = 0
        for (let i = 1; i < 10; i++){
            array.push(base + i*step)
        }
        return array
    }

    const count = () => {
        let array = [0]
        const step = 1
        const base = 0
        for (let i = 1; i<10; i++){
            array.push(base+ i*step)
        }
        return array
    }
    
    const legendXAxis = d3.axisBottom(legendXScale)
        .tickSizeOuter(0)

    const legend = svg
        .selectAll('.legend')
        .data([null])
        .enter().append('g')
            .attr('class', 'legend')
            .attr('id', 'legend')
            .attr('x', width /2)
            .attr('y', height - 30)
            .attr('transform', `translate(${width/2 - 250},${height-75})`)

    legend.append('g')
        .call(legendXAxis)

    legend.append('g')
        .attr('transform', `translate(0,-25)`)
        .attr('id', 'legend')
        .selectAll('rect')
        .data(legendXScale.domain())
        .enter().append('rect')
            .attr('width', legendXScale.bandwidth() )
            .attr('height', 25)  
            .attr('x', (d,i) => legendX(d)[count()[i]])
            .style('fill', (d,i) => colorScale(d[0]))*/

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