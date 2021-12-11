// Get the portfolio data
d3.json("/json_portfolios").then(function(data){

    // Create a list of names from the portfolio
    names_list = []
    for (key in data){
        names_list.push(key)
    }

    let totals_dict = {}; // A dictionary of the total assets managed by each client
    let total_assets_managed = 0;
    let stock_names = []

    // Get the unique names of all the stock in everyone's portfolio
    names_list.forEach(client => {
        // Reset this for each client
        total_portfolio_value = 0;
        //Total Assets Managed
        data[client].forEach(stock_purchased =>{
            if (stock_names.includes(stock_purchased["ticker"])){

            }
            else{
                stock_names.push(stock_purchased["ticker"])
            }
            total_portfolio_value += stock_purchased["current_value"]
            total_assets_managed += stock_purchased["current_value"]
        });
        totals_dict[client] = total_portfolio_value;
    });

    // Get all the current values of every stock managed
    // Initalize portfolio dictionary
    portfolio_stock_dictionary = {}
    for(i in stock_names){
        portfolio_stock_dictionary[stock_names[i]] = 0;
    }

    stock_list= []
    names_list.forEach(element1 => {
        data[element1].forEach(values1 => {
            stock_list.push(values1.ticker)
        })
    });
    // create an array for all the current_values
    current_value_list = []
    names_list.forEach(element2 => {
        data[element2].forEach(values2 => {
            current_value_list.push(values2.current_value)
        })
    });

    var ticker_current_value = stock_list.map(function (value, index){
        return [value, current_value_list[index]]
     });
     for (Object.key in portfolio_stock_dictionary){
         let total = 0;
         for(i in ticker_current_value){
             if(Object.key = ticker_current_value[i][0]){
                 total += ticker_current_value[i][1]
                portfolio_stock_dictionary[Object.key] = total;
             }
         }
     }


    var totals_dict_keys = Object.keys(totals_dict);
    var totals_dict_values = Object.values(totals_dict);

// Create items array
var sorted_totals_array = Object.keys(totals_dict).map(function(key) {
    return [key, totals_dict[key]];
  });
  
  // Sort the array based on the second element
  sorted_totals_array.sort(function(first, second) {
    return first[1] - second[1];
  });

var sorted_totals_dict_keys = []
var sorted_totals_dict_values = [];


for (let i = 0; i < sorted_totals_array.length; i++) {
    sorted_totals_dict_keys.push(sorted_totals_array[i][0])
    sorted_totals_dict_values.push(sorted_totals_array[i][1])
} 

  var filtered_keys = sorted_totals_dict_keys
  var filtered_values = sorted_totals_dict_values


// PIE CHART for stock percentage
    // Initalize portfolio dictionary
    portfolio_stock_dictionary1 = {}
    for(i in stock_names){
        portfolio_stock_dictionary1[stock_names[i]] = 0;
    }

    stock_list1= []
    names_list.forEach(element1 => {
        data[element1].forEach(values1 => {
            stock_list1.push(values1.ticker)
        })
    });
    // create an array for all the current_values
    current_value_list = []
    names_list.forEach(element2 => {
        data[element2].forEach(values2 => {
            current_value_list.push(values2.current_value)
        })
    });

    var ticker_current_value = stock_list.map(function (value, index){
        return [value, current_value_list[index]]
     });

     for (Object.key in portfolio_stock_dictionary1){
         let total = 0;
         for(i in ticker_current_value){
             if(Object.key = ticker_current_value[i][0]){
                 total += ticker_current_value[i][1]
                portfolio_stock_dictionary1[Object.key] = total;
             }
         }
     }
     console.log(portfolio_stock_dictionary1);

     var totals_dict_keys1 = Object.keys(portfolio_stock_dictionary1);
     var totals_dict_values1 = Object.values(portfolio_stock_dictionary1);




// CREATE THE ORIGINAL CHARTS
    // Create a horizontal barchart
    var bardata = [{
        type: 'bar',
        x: filtered_values,
        y: filtered_keys,
        orientation: 'h'
      }];
    Plotly.newPlot('bar_chart', bardata);

    // Create a pie chart
    var piedata = [{
            type: 'pie',
            values: totals_dict_values1,
            labels: totals_dict_keys1,
          }];
    var layout = {
            height: 400,
            width: 500
        };
    Plotly.newPlot('pie_chart', piedata, layout);

    // FILTER THE CHARTS
    var client_select = d3.select('#portfolio_filter');
    client_select.on("change", onSelectChange);

    function onSelectChange(){
        var value = this.value;
        if (value != "reset"){
            // filter the values
            filtered_keys = [value]
            filtered_values = [totals_dict[value]]
            createCharts(filtered_keys,filtered_values)
        }
        else{
            // reset the values
            filtered_keys = totals_dict_keys
            filtered_values = totals_dict_values
            createCharts(filtered_keys,filtered_values)
        }
    }
    function createCharts (k,v){
        // Create a horizontal bar chart
        var bardata = [{
            type: 'bar',
            x: v,
            y: k,
            orientation: 'h'
          }];
        Plotly.newPlot('bar_chart', bardata);
        
        // Create a pie chart
        var piedata = [{
            type: 'pie',
            values: v,
            labels: k,
        }];
        var layout = {
            height: 400,
            width: 500
        };
    Plotly.newPlot('pie_chart', piedata, layout);
    };


    // Create our number formatter.
    var formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'AUD',
    });
    total_assets_managed_formatted = formatter.format(total_assets_managed);
    d3.select("#total_assets").html(total_assets_managed_formatted);



});

// Get the stock history data
d3.json("/json_stock_history").then(function(data){

    // ---- GET THE LAST 5 DAYS OF CLOSING DATA FOR EACH STOCK AND DISPLAY THEM IN A LINE GRAPH ----
    // Get a list of all the dates in the stock history
    date_list = []
    for (let date in data[0]["information"]){
        date_list.push(date)
    }
    // Get the last five days
    let last_week = date_list.slice(0,5)
    
    // Create an area of all the stock tickers
    stock_list = []
    for (let i = 0; i < data.length; i++) {
        stock_list.push(data[i]['stock'])
      } 

    // Create an array containing the last five days of closing prices for each stock
    array1 = []
    for (let i = 0; i < data.length; i++) {
        last_week.forEach(date => {
            array1.push([data[i]["stock"],date, data[i]['information'][date]["Close*"]])
        })
    }
    // Create an object from this array with the stock names as the keys and the 
    // values being the dates and closing prices as two seperate arrays
    last_five_days_dict = {}
    for (let i = 0; i < stock_list.length; i++) {
        last_five_days_dict[stock_list[i]] = [[],[]]
    }

    for (stock in last_five_days_dict) {
        for (let i=0; i<array1.length; i++){
            if(array1[i][0] == stock){
                last_five_days_dict[stock][0].push(array1[i][1])
                last_five_days_dict[stock][1].push(array1[i][2])
            }
        }
    }

    // Create a chart from each stock object and add it to an array of chart data
     var trace = ""
     var chart_data = []
    for (stock in last_five_days_dict) {
        trace = {
            x: last_five_days_dict[stock][0],
            y: last_five_days_dict[stock][1],
            type: 'line',
            name: stock
          };
        chart_data.push(trace)
    }
    // Create the chart
    Plotly.newPlot('myDiv', chart_data);

  });
