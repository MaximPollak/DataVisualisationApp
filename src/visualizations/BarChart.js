import * as d3 from 'd3';

export default class BarChart {
  constructor(data, config) {
    this.data = data;
    this.config = {
      parentElement: config?.parentElement || 'body',
      width: config?.width || 500,
      height: config?.height || 360,
      margin: config?.margin || { top: 24, right: 82, bottom: 76, left: 122 },
      xAxisLabel: config?.xAxisLabel || 'Value',
    };

    this.initViz();
  }

  initViz() {
    this.boundedWidth = this.config.width - this.config.margin.left - this.config.margin.right;
    this.boundedHeight = this.config.height - this.config.margin.top - this.config.margin.bottom;

    this.svg = d3.select(this.config.parentElement)
      .append('svg')
      .attr('width', this.config.width)
      .attr('height', this.config.height)
      .attr('viewBox', `0 0 ${this.config.width} ${this.config.height}`);

    this.bounds = this.svg.append('g')
      .attr('transform', `translate(${this.config.margin.left}, ${this.config.margin.top})`);

    this.xScale = d3.scaleLinear()
      .range([0, this.boundedWidth]);

    this.yScale = d3.scaleBand()
      .range([0, this.boundedHeight])
      .padding(0.28);

    this.xAxisG = this.bounds.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0, ${this.boundedHeight})`);

    this.yAxisG = this.bounds.append('g')
      .attr('class', 'axis y-axis');

    this.xAxisG.append('text')
      .attr('class', 'axis-title')
      .attr('x', this.boundedWidth / 2)
      .attr('y', 62)
      .attr('text-anchor', 'middle')
      .text(this.config.xAxisLabel);
  }

  updateViz() {
    this.xScale.domain([0, d3.max(this.data, d => d.value) || 1]).nice();
    this.yScale.domain(this.data.map(d => d.label));

    this.renderViz();
  }

  renderViz() {
    this.bounds.selectAll('.bar')
      .data(this.data, d => d.label)
      .join(
        enter => enter.append('rect')
          .attr('class', 'bar')
          .attr('x', 0)
          .attr('y', d => this.yScale(d.label))
          .attr('width', 0)
          .attr('height', this.yScale.bandwidth()),
        update => update,
        exit => exit.transition()
          .duration(200)
          .attr('width', 0)
          .remove()
      )
      .transition()
      .duration(550)
      .attr('x', 0)
      .attr('y', d => this.yScale(d.label))
      .attr('width', d => this.xScale(d.value))
      .attr('height', this.yScale.bandwidth());

    this.bounds.selectAll('.bar-label')
      .data(this.data, d => d.label)
      .join(
        enter => enter.append('text')
          .attr('class', 'bar-label')
          .attr('x', d => this.xScale(d.value) + 8)
          .attr('y', d => this.yScale(d.label) + this.yScale.bandwidth() / 2)
          .attr('dominant-baseline', 'middle')
          .style('opacity', 0),
        update => update,
        exit => exit.remove()
      )
      .transition()
      .duration(550)
      .attr('x', d => this.xScale(d.value) + 8)
      .attr('y', d => this.yScale(d.label) + this.yScale.bandwidth() / 2)
      .text(d => d3.format('.1f')(d.value))
      .style('opacity', 1);

    this.xAxisG.call(d3.axisBottom(this.xScale).ticks(5).tickSize(-this.boundedHeight));
    this.yAxisG.call(d3.axisLeft(this.yScale).tickSize(0));
    this.yAxisG.select('.domain').remove();
  }
}
