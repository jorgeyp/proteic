import Component from './Component';
import XAxis from './XAxis';
import YAxis from './YAxis';
import Globals from '../../Globals';
import { area, nest, CurveFactory, Area, easeLinear } from 'd3';


class ConfidenceBand extends Component {

    private x: XAxis;
    private y: YAxis;
    private areaGenerator: Area<any>;
    private confidenceBandConfig: ConfidenceBandConfig;
    private id: number;

    constructor(x: XAxis, y: YAxis) {
        super();
        this.x = x;
        this.y = y;
        this.confidenceBandConfig = new ConfidenceBandConfig();
        this.id = 0;
    }

    public render() {
        this.svg.select('g.statistics')
                .append('g')
                .attr('class', 'confidenceSet');
    }

    public update(data: [any]) {
        this.confidenceBandConfig.put(this.config.get('confidenceBandConfig'));
        let confidenceModifier: Function = this.confidenceBandConfig.modifier,
            confidence = this.confidenceBandConfig.confidence,
            variable: string = this.confidenceBandConfig.variable;

        let propertyX = this.config.get('propertyX'),
            propertyY = this.config.get('propertyY'),
            curve: CurveFactory = this.config.get('curve');

        this.areaGenerator = area()
            .curve(curve)
            .x((d: any) => this.x.xAxis.scale()(d[propertyX]))
            .y0((d: any) => this.y.yAxis.scale()(d[propertyY] - confidenceModifier(d[confidence])))
            .y1((d: any) => this.y.yAxis.scale()(d[propertyY] + confidenceModifier(d[confidence])));


        let propertyKey = this.config.get('propertyKey'),
            colorScale = this.config.get('colorScale'),
            confidenceBandOpacity = this.config.get('confidenceBandOpacity');

        let eventData = data.filter((d: any) => d[propertyKey] == variable || d[variable] !== undefined);

        let dataSeries = nest().key((d: any) => d[propertyKey] ).entries(eventData),
            series = this.svg.select('g.confidenceSet').selectAll('.confidenceSeries'),
            confidences = series.data(dataSeries, (d: any) => d[propertyKey]);

        this.elementEnter = confidences.enter()
            .append('g')
            .attr('class', 'confidenceSeries')
            .attr(Globals.COMPONENT_DATA_KEY_ATTRIBUTE, (d: any) => d[propertyKey])
            .append('svg:path')
            .attr('class', 'confidence')
            .style('fill', (d: any) => colorScale(d[propertyKey]))
            .style('fill-opacity', confidenceBandOpacity)
            .attr('d', (d: any) => this.areaGenerator(d.values));

        this.elementExit = confidences.exit().remove();

        this.elementUpdate = this.svg.selectAll('.confidence')
            .data(dataSeries, (d: any) => d[propertyKey])
            .attr('d', (d: any) => this.areaGenerator(d.values));
    }

    public transition() {
        this.elementUpdate
            .transition()
            .duration(Globals.COMPONENT_TRANSITION_TIME)
            .ease(easeLinear);

        this.elementEnter
            .transition()
            .duration(Globals.COMPONENT_TRANSITION_TIME);

        this.elementExit
            .transition()
            .duration(Globals.COMPONENT_TRANSITION_TIME);
    }

    public clear() {
        this.svg.selectAll(`*[data-proteic-element='confidence']`).remove();
    }

}

class ConfidenceBandConfig {
    variable: string;
    confidence: string | number;
    modifier: Function;

    constructor() {
        this.modifier = (confidence: number) => confidence;
    }

    public put(config: any) {
        this.variable = config.variable;
        this.confidence = config.confidence;

        if ('modifier' in config) {
            this.modifier = config.modifier;
        }
    }
}

export default ConfidenceBand;
