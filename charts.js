function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);

}

// Demographics Panel
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];

    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array.
    var sampleData = data.samples;

    // 4. Create a variable that filters the samples for the object with the desired sample number.
    //filteredSamples = data.filter()
    filteredSamples = sampleData.filter(sampleObj => sampleObj.id == sample);

    //  5. Create a variable that holds the first sample in the array.
    var result = filteredSamples[0];

    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otuID = result.otu_ids;
    var otuLabel = result.otu_labels;
    var sampleValue = result.sample_values;

    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order
    //  so the otu_ids with the most bacteria are last.
    var bacteria = [];

    for (var i = 0; i < sampleValue.length; i++) {
      bacteria.push({
        id: otuID[i],
        label: otuLabel[i],
        value: sampleValue[i],
      });
    }


    var sorted = bacteria.sort((a,b) => b.value - a.value);

    var top10 = sorted.slice(0, 10);

    var reversed = top10.reverse();


    // 8. Create the trace for the bar chart.
    var barData = [{
      x: reversed.map(row => row.value),
      y: reversed.map(row => `OTU ${row.id}`),
      type: 'bar',
      text: reversed.map(row => row.label),
      orientation: 'h',
    }];


    // 9. Create the layout for the bar chart.
    var barLayout = {
      title: "Top 10 Bacteria Cultures Found",
    };
    // 10. Use Plotly to plot the data with the layout.
    Plotly.newPlot("bar", barData, barLayout);

    //CREATE BUBBLE CHART
    // 1. Create the trace for the bubble chart.
    var sortedIDs = sorted.map(row => row.id);

    var colorScale = d3.scaleSequential().domain(sortedIDs)
    .interpolator(d3.interpolateCool);

    var bubbleData = [{
      x: sorted.map(row => row.id),
      y: sorted.map(row => row.value),
      text: sorted.map(row => row.label),
      mode: 'markers',
      marker: {
        color: sortedIDs.map(id => colorScale(id)),
        size: sorted.map(row => row.value),
      }
    }];

    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      title: 'Bacteria Cultures Per Sample',
      xaxis: {title: 'OTU IDs'},
    };

    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout);

    //CREATE GAUGE CHART
    // 1. Create a variable that filters the metadata array for the object with the desired sample number.
    // Create a variable that holds the first sample in the array.
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);

    // 2. Create a variable that holds the first sample in the metadata array.
    var result = resultArray[0];

    // 3. Create a variable that holds the washing frequency.
    var wfreq = result.wfreq;

    // 4. Create the trace for the gauge chart.
    var gaugeData = [{
      domain: { x: [0, 1], y: [0, 1]},
      value: wfreq,
      title: {text: "<b>Belly Button Washing Frequency</b><br>Scrubs per Week"},
      type: 'indicator',
      mode: 'gauge+number',
      gauge: {
        axis: { range: [null, 10]},
        bar: {color: 'black'},
        steps: [
          {range: [0, 2], color: 'red'},
          {range: [2, 4], color: 'orange'},
          {range: [4, 6], color: 'yellow'},
          {range: [6, 8], color: 'lightgreen'},
          {range: [8, 10], color: 'green'},
        ]
      }
    }];

    // 5. Create the layout for the gauge chart.
    var gaugeLayout = {
      margin: {t: 0, b: 0}
    };

    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot('gauge', gaugeData, gaugeLayout);

  });
}
