// Get the portfolio data
d3.json("/json_portfolios").then(function(data){

    // A list of names from the portfolio data
    names_list = []
    for (key in data){
        names_list.push(key)
    }

    // FIND THE TOTAL CURRENT VALUE OF ALL THE ASSETS MANAGED
    // AND THE TOTAL CURRENT VALUE OF EACH CLIENT'S PORTFOLIO
    let portfolio_totals_dict = {}; // A dictionary of the total current value of all the assets managed by each client
    let portfolio_purchase_totals_dict = {};
    let total_assets_managed = 0;
    let stock_names = []
    // Get the unique names of all the stock in everyone's portfolio
    names_list.forEach(client => {
        // Reset this for each client
        total_portfolio_current_value = 0;
        total_portfolio_purchase_value = 0;
        //Total Assets Managed
        data[client].forEach(stock_purchased =>{
            if (stock_names.includes(stock_purchased["ticker"])){

            }
            else{
                stock_names.push(stock_purchased["ticker"])
            }
            total_portfolio_current_value += stock_purchased["current_value"]
            total_portfolio_purchase_value += stock_purchased["purchase_value"]
            total_assets_managed += stock_purchased["current_value"]
        });
        portfolio_totals_dict[client] = total_portfolio_current_value;
        portfolio_purchase_totals_dict[client] = total_portfolio_purchase_value
    });

    // Display the total assets managed
    var formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'AUD',
    });
    total_assets_managed_formatted = formatter.format(total_assets_managed);
    d3.select("#total_assets").html(total_assets_managed_formatted);

    // Get all the current values of every stock managed
    // Initalize portfolio dictionary
    stock_total_current_values = {}
    for(stock in stock_names){
        stock_total_current_values[stock_names[stock]] = 0;
    }
    // create an array of all the stock names
    stock_list= []
    names_list.forEach(client => {
        data[client].forEach(stock => {
            stock_list.push(stock.ticker)
        })
    });
    // create an array for all the current_values
    current_value_list = []
    names_list.forEach(client => {
        data[client].forEach(value => {
            current_value_list.push(value.current_value)
        })
    });

    var ticker_current_value = stock_list.map(function (value, index){
        return [value, current_value_list[index]]
     });

     for (Object.key in stock_total_current_values){
         let total = 0;
         for(i in ticker_current_value){
             if(Object.key = ticker_current_value[i][0]){
                 total += ticker_current_value[i][1]
                 stock_total_current_values[Object.key] = total;
             }
         }
     }

// CREATE THE VARIABLES FOR THE SORTED HORIZONTAL BARCHART
var sorted_portfolio_totals_array = Object.keys(portfolio_totals_dict).map(function(key) {
    return [key, portfolio_totals_dict[key]];
  });
  
// Sort the array based on the second element
  sorted_portfolio_totals_array.sort(function(first, second) {
    return first[1] - second[1];
  });

var sorted_portfolio_totals_dict_keys = []
var sorted_portfolio_totals_dict_values = [];


for (let i = 0; i < sorted_portfolio_totals_array.length; i++) {
    sorted_portfolio_totals_dict_keys.push(sorted_portfolio_totals_array[i][0])
    sorted_portfolio_totals_dict_values.push(sorted_portfolio_totals_array[i][1])
} 

var filtered_portfolio_keys = sorted_portfolio_totals_dict_keys
var filtered_portfolio_values = sorted_portfolio_totals_dict_values

// CREATE THE VARIABLES FOR THE STOCK TOTAL CURRENT VALUE PIE CHART
var stock_totals_dict_keys = Object.keys(stock_total_current_values);
var stock_totals_dict_values = Object.values(stock_total_current_values);

// Show the individual stock values for the porfolio of each client
var current_portfolios_values_dict = {};
names_list.forEach(client => {
    let stocks = []
    let current_values = []
    //Total Assets Managed
    data[client].forEach(stock_purchased =>{
        stocks.push(stock_purchased["ticker"]);
        current_values.push(stock_purchased["current_value"])
    });
    current_portfolios_values_dict[client] = [stocks, current_values]
});

// CREATE THE ORIGINAL CHARTS
// Create a horizontal barchart with Chart.js
var hor_bar_chart = new Chart("bar_chart", {
  type: "bar",
  data: {
  labels: filtered_portfolio_keys.reverse(),
  datasets: [{
    backgroundColor: "blue",
    data: filtered_portfolio_values.reverse()
  }],
},
options: {
    indexAxis: 'y',
    scales: {
        x: {
            ticks: {
                // Include a dollar sign in the ticks
                callback: function(value, index, values) {
                    return '$' + value;
                },
                font:{
                    size: 16,
                    family: 'Arial',
                    weight: 1,
                    },
            }
        },
        y: {
            ticks: {
                font:{
                    size: 16,
                    family: 'Arial',
                    weight: 1,
                    },
            }
        }
    },
    plugins: {
        legend: { display: false },
        title: {
            display: true,
            text: ["Total Current Value of", "All Client Portfolios in $AU"],
            font:{
                size: 20,
                family: 'Arial',
                weight: 1,
                },
            color: "black"
                },
            }
        }
    });
    // Create a pie chart
    var piedata = [{
            type: 'pie',
            labels: stock_totals_dict_keys,
            values: stock_totals_dict_values
          }];
    var pie_layout = {
        title: "All Client Portfolio Stocks in $AU and" + "<br>" 
        + "% of Total Current Value Managed",
        height: 550,
        width: 550
        };
    Plotly.newPlot('pie_chart', piedata, pie_layout);

    // Create Line chart
    createLineChart("default")

    // FILTER THE CHARTS
    var client_select = d3.select('#portfolio_filter');
    client_select.on("change", onSelectChange);

    // A function to filter the charts
    function onSelectChange(){
        var colors = ""
        var value = this.value;
        if (value != "reset"){
            // filter the values
            bar_keys = ["Total Purchase Value", "Total Current Value"]
            bar_values = [portfolio_totals_dict[value], portfolio_purchase_totals_dict[value]]
            pie_keys = current_portfolios_values_dict[value][0]
            pie_values = current_portfolios_values_dict[value][1]
            line_stocks = current_portfolios_values_dict[value][0]
            colors = ['orange', 'green',]
            createCharts(bar_keys, bar_values, pie_keys, pie_values, line_stocks, value, colors, hor_bar_chart)
        }
        else{
            // reset the values
            bar_keys = sorted_portfolio_totals_dict_keys
            bar_values = sorted_portfolio_totals_dict_values
            pie_keys = stock_totals_dict_keys
            pie_values = stock_totals_dict_values
            line_stocks = "default"
            colors = ['blue']
            createCharts(bar_keys, bar_values, pie_keys, pie_values, line_stocks, value, colors, hor_bar_chart)
        }
    }
    function createCharts (bar_k, bar_v, pie_k, pie_v, line_v, client_name, colors, oldbar){
        // Remove the old bar chart
        oldbar.destroy();
        // Create a horizontal bar chart
        hor_bar_chart = new Chart("bar_chart", {
            type: "bar",
            data: {
            labels: bar_k,
            datasets: [{
              backgroundColor: colors,
              data: bar_v
            }],
          },
          options: {
            responsive: true,
            indexAxis: 'y',
            scales: {
                x: {
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: function(value, index, values) {
                            return '$' + value;
                        },
                        font:{
                            size: 16,
                            family: 'Arial',
                            weight: 1,
                            },
                    }
                },
                y: {
                    ticks: {
                        font:{
                            size: 16,
                            family: 'Arial',
                            weight: 1,
                            },
                    }
                }
            },
            plugins: {
                  legend: { display: false },
                  title: {
                      display: true,
                      text: ["Total Purchase and Current Value of ", client_name +"'s Portfolio in $AU"],
                      font:{
                          size: 20,
                          family: 'Arial',
                          weight: 1,
                          },
                      color: "black"
                      },
                  }
              }
          });

        // Create a pie chart
        var piedata = [{
            type: 'pie',
            values: pie_v,
            labels: pie_k,
        }];
        var pie_layout = {
            title: "Stocks owned by " + client_name + "in $AU" + "<br>" + "and % of Total Current Portfolio Value",
            height: 550,
            width: 550
            };
        Plotly.newPlot('pie_chart', piedata, pie_layout);

    createLineChart(line_v, client_name)

    };

    function createLineChart(stocks, client_name){
        d3.json("/json_stock_history").then(function(data){
                // ---- GET THE LAST 5 DAYS OF CLOSING DATA FOR EACH STOCK AND DISPLAY THEM IN A LINE GRAPH ----
                // Get a list of all the dates in the stock history
                date_list = []
                for (let date in data[0]["information"]){
                    date_list.push(date)
                }
                // Get the last five days
                let last_week = date_list.slice(0,5);
                let chart_title = "";
                
                // Create an area of all the stock tickers
                if (stocks != "default"){
                    stock_list = stocks
                    chart_title = "Closing Price of all stocks in " + client_name + "'s portfolio from the last week"
                }else{
                    stock_list = []
                    for (let i = 0; i < data.length; i++) {
                        stock_list.push(data[i]['stock'])
                      }
                      chart_title = "Closing Price of all stocks managed from the last week"
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
                        x: last_five_days_dict[stock][0].reverse(),
                        y: last_five_days_dict[stock][1].reverse(),
                        type: 'line',
                        name: stock
                      };
                    chart_data.push(trace)
                }
                var line_layout = {
                    title: chart_title,
                    height: 800,
                    width: 1200,
                    xaxis: {
                        title: {
                          text: 'LAST WEEK',
                          font: {
                            family: 'Arial',
                            size: 20,
                            color: "black"
                          }
                        },
                        tickfont: {
                            family: 'Arial',
                            size: 16,
                            color: 'black'
                          },
                      },
                    yaxis: {
                        title: {
                          text: 'STOCK PRICE $AU',
                          font: {
                            family: 'Arial',
                            size: 20,
                            color: "black",
                          }
                        },
                        tickfont: {
                            family: 'Arial',
                            size: 16,
                            color: 'black'
                          },
                      },
                };
                // Create the chart
                Plotly.newPlot('line_chart', chart_data, line_layout);
        }); // end of json_stock_history
    }

}); // end of json_portfolios
