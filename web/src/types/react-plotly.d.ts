declare module 'react-plotly.js' {
	import { Component } from 'react';
	import { PlotParams } from 'plotly.js';

	export default class Plot extends Component<PlotParams> {}
}

declare module 'plotly.js-basic-dist';
