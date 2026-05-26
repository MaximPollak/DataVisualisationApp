import * as d3 from 'd3';

/*
    Scatterplot.js
    ==============
    A reusable D3 scatterplot chart class.
    Architecture:
    - initViz()   → One-time setup (SVG, scales, axes)
    - updateViz() → Update scale domains based on data
    - renderViz() → Data join and rendering
*/

export default class Scatterplot {
    constructor(data, config) {
        this.data = data;

        this.config = {
            parentElement: config?.parentElement || 'body',           // Conditional assignment with || operator
            colorScale: config?.colorScale,
            width: config?.width || 500,
            height: config?.height || 440,
            margin: config?.margin || { top: 30, right: 20, bottom: 45, left: 50 },
            xAxisLabel: config?.xAxisLabel || 'X',
            yAxisLabel: config?.yAxisLabel || 'Y',
            dataAccessor: config.dataAccessor,
            // tooltipHTML: config?.tooltipHTML || (d => JSON.stringify(d)),
        };

        this.initViz();
    }

    setData(data) {
        this.data = data;
    }

    /*
        Runs once in the constructor. It creates the svg, scales, (range only as domain is dynamic)
        Everything defined in here is static elments.
    */
    initViz() {
        // Margin convention: Calculate reduced width and height
        this.boundedWidth = this.config.width - this.config.margin.left - this.config.margin.right;
        this.boundedHeight = this.config.height - this.config.margin.top - this.config.margin.bottom;

        // Create the svg and the drawing area (group)
        this.svg = d3.select(this.config.parentElement) // d3.select('#scatterplot')
            .append('svg')
            .attr('width', this.config.width)
            .attr('height', this.config.height);

        // Create the smaller drawing area with margin convetion in mind
        this.bounds = this.svg.append('g')
            .attr('transform', `translate(
                ${this.config.margin.left},
                ${this.config.margin.top}    
            )`);

        // Define the scales or at least the range (because it doesn't change)
        this.xScale = d3.scaleLinear()
            .range([0, this.boundedWidth]);

        this.yScale = d3.scaleLinear()
            .range([this.boundedHeight, 0]);

        // Create the axes and grid lines
        this.yAxis = d3.axisLeft()
            .scale(this.yScale)
            .tickSize(-this.boundedWidth);          // Making grid lines

        this.xAxis = d3.axisBottom()
            .scale(this.xScale)
            .tickSize(-this.boundedHeight);

        // Add the axis to chart
        this.yAxisG = this.bounds.append('g')
            .attr('class', 'axis y-axis')

        this.xAxisG = this.bounds.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0, ${this.boundedHeight})`);

        // Add axis labels to chart
        this.xAxisG.append("text")
            .attr("class", "axis-title")
            .attr("x", this.boundedWidth / 2)
            .attr("y", 40)
            .attr("fill", "#000000")
            .text(this.config.xAxisLabel)

        this.yAxisG.append("text")
            .attr("class", "axis-title")
            .attr("transform", "rotate(-90)")
            .attr("x", -this.boundedHeight / 2)
            .attr("y", -35)
            .attr("text-anchor", "middle")
            .attr("fill", "#000000")
            .text(this.config.yAxisLabel)

    }

    /*
        Runs every time the data changes. It sets the domains of the scales based on the new data min and max.
        Then it calls renderViz() to do the actual drawing
    */
    updateViz() {
        this.xAccessor = (d) => d[this.config.dataAccessor.x];              // d.distance
        this.yAccessor = (d) => d[this.config.dataAccessor.y];              // d.time
        // this.colorAccessor = (d) => d[this.config.dataAccessor.color];      // d.difficulty

        // Define the domain based on the current data
        // this.xScale.domain([0, d3.max(this.data, this.xAccessor)]);
        // this.yScale.domain([0, d3.max(this.data, this.yAccessor)]);

        this.xScale.domain(d3.extent(this.data, this.xAccessor));
        this.yScale.domain(d3.extent(this.data, this.yAccessor));

        this.renderViz();
    }

    /*
        Here the data joins happen and the visualzation is drawn. It animates the elements...
    */
    renderViz() {
        // Render the circles in the scatterplot
        const circles = this.bounds.selectAll('circle')
            .data(this.data)
            .join(
                enter => enter.append('circle')
                    .attr('class', 'circle')
                    .attr('r', 0)
                    .attr('cx', d => this.xScale(this.xAccessor(d)))
                    .attr('cy', d => this.yScale(this.yAccessor(d))),

                update => update,

                exit => exit.transition()
                    .duration(200)
                    .attr('r', 0)
                    .remove()
            );

        // This applies now to all selections enter, update, exit
        circles.transition()
            .duration(500)
            .attr('r', 1)
            .attr('cx', d => this.xScale(this.xAccessor(d)))
            .attr('cy', d => this.yScale(this.yAccessor(d)))
            // .attr('fill', d => this.config.colorScale(this.colorAccessor(d)));
            .attr('fill', "#000000")
            .attr('opacity', .8);

        // Create the axis because we have the domain now
        this.xAxisG.call(this.xAxis);
        this.yAxisG.call(this.yAxis);

        // Grab the tooltip element
        // const tooltip = d3.select('#tooltip');

        // circles.on('mouseover', (event, d) => {
        //     tooltip.style('opacity', 1)
        //         .style('left', event.clientX + 'px')
        //         .style('top', event.clientY + 'px')
        //         .style("transform", "translate(-50%, calc(-100% - 12px))")
        //         .html(`${this.config.tooltipHTML(d)}`)
        // }).on('mouseleave', () => {
        //     tooltip.style('opacity', 0);
        // });
    }
}