var vowels = "aeiouy";
var consonants = "bcdfghjklmnpqrstvwxyz";
var punctuation = ".!?,;:";
var enteredText;

function submitText() {

    enteredText = document.getElementById("wordbox").value.toLowerCase();


    var characterCounts = {
        vowels: 0,
        consonants: 0,
        punctuation: 0
    };

    for (var i = 0; i < enteredText.length; i++) {
        var char = enteredText[i];
        if (vowels.includes(char)) {
            characterCounts.vowels++;
        } else if (consonants.includes(char)) {
            characterCounts.consonants++;
        } else if (punctuation.includes(char)) {
            characterCounts.punctuation++;
        }
    }

    var dataset = [
        { label: 'Vowels', count: characterCounts.vowels },
        { label: 'Consonants', count: characterCounts.consonants },
        { label: 'Punctuation', count: characterCounts.punctuation }
    ];


    d3.select("#pie_svg").selectAll("*").remove();

    var width = 580;
    var height = 400;
    var radius = Math.min(width, height) / 2;
    var donutWidth = 75;

    var color = d3.scaleOrdinal(d3.schemeSet3);

    var svg = d3.select('#pie_svg')
        .attr('width', width)
        .attr('height', height)
        .attr('stroke-width', 1)
        .append('g')
        .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

    var arc = d3.arc()
        .innerRadius(radius - donutWidth)
        .outerRadius(radius);

    var pie = d3.pie()
        .value(function (d) { return d.count; })
        .sort(null);

    var path = svg.selectAll('path')
        .data(pie(dataset))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function (d, i) { return color(i); })
        .attr('stroke', 'black')
        .attr('stroke-width', '1')
        .on('mouseover', function (d) {
            var text = d.currentTarget.__data__.data.label + ': ' + d.currentTarget.__data__.data.count;

            d.currentTarget.attributes['stroke-width'].nodeValue = '3';
            svg.append('text')
                .attr('id', 'inside-text')
                .attr('text-anchor', 'middle')
                .attr('dy', '.3em')
                .text(text);
        })
        .on('mouseout', function (d) {
            d.currentTarget.attributes['stroke-width'].nodeValue = '1';
            d3.select("#inside-text").remove();
        })
        .on('click', function (d) {
            var selectedColor = d.currentTarget.attributes.fill.nodeValue;
            createBarChart(d.currentTarget.__data__.data.label, selectedColor);
        });
}

function createBarChart(selectedType, color) {
    d3.select("#bar_svg").selectAll("*").remove();
    var barChart = d3.select("#bar_svg");
    var width = +barChart.style('width').replace('px', '');
    var height = +barChart.style('height').replace('px', '');
    var margin = {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20
    };

    let charMap = {};
    var tp;
    if (selectedType == 'Vowels') {
        tp = vowels;
    }
    else if (selectedType == 'Consonants') {
        tp = consonants;
    }
    else {
        tp = punctuation;
    }
    for (let i = 0; i < tp.length; i++) {
        charMap[tp[i]] = 0;

    }
    for (let i = 0; i < enteredText.length; i++) {
        if (tp.includes(enteredText[i])) {
            charMap[enteredText[i]]++;
        }

    }

    let data = Object.entries(charMap).map(([letter, count]) => ({ letter, count }));

    const xScale = d3.scaleBand()
        .domain(data.map(d => d.letter))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .range([height - margin.bottom, margin.top]);

    var svg = d3.select("#bar_svg")
        .attr("width", width)
        .attr("height", height);

    var bars = svg.selectAll("rect")
        .data(data);

    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    bars.enter().append("rect")
        .attr("class", "bar")
        .merge(bars)
        .attr("x", d => xScale(d.letter))
        .attr("y", d => yScale(d.count))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - margin.bottom - yScale(d.count))
        .attr("fill", color)
        .on('mouseover', function (d, i) {
            tooltip.transition()
                .duration(0)
                .style("display", "block")
                .style("opacity", 0.9)
            tooltip.html("Letter: " + i.letter + "<br>" + "Count: " + i.count)
                .style("left", (d.pageX) + "px")
                .style("top", (d.pageY) + "px");
            textSelection(i.letter,i.count);
        })
        .on('mousemove', function (d,i) {
            tooltip.transition()
                .duration(0)
                .style("display", "block")
                .style("opacity", 0.9)
                .style("left", (d.pageX) + "px")
                .style("top", (d.pageY) + "px");
            textSelection(i.letter,i.count);
        })
        .on('mouseout', function (d) {
            tooltip.transition()
                .duration(500)
                .style("display", "none");
            document.getElementById("character-name").textContent = "No character is selected....";
        });

    bars.exit().remove();


    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));
}


function textSelection(c,i) {

    document.getElementById("character-name").textContent = "Count for " +  c  + " is " + i;
}
