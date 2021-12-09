
// Get the portfolio data
d3.json("/json_portfolios").then(function(data){
    // console.log("Portfolio Data")
    // console.log(data)

    // Create a list of names from the portfolio
    names_list = []
    for (key in data){
        names_list.push(key)
    }

    // Show all information
    // names_list.forEach(element => {
        // console.log(`ticker: ${data[element][0]["ticker"]}`)
        // console.log(`change_in_value: ${data[element][0]["change_in_value"]}`)
        // console.log(`current_price: ${data[element][0]["current_price"]}`)
        // console.log(`current_value ${data[element][0]["current_value"]}`)
        // console.log(`owner: ${data[element][0]["owner"]}`)
        // console.log(`purchase_price: ${data[element][0]["purchase_price"]}`)
        // console.log(`purchase_value: ${data[element][0]["purchase_value"]}`)
        // console.log(`quantity: ${data[element][0]["quantity"]}`)
        // console.log("\n")
    // }); 

    // Calculate the total amount of stocks that Bill has
    // total = 0
    // for (let stock in data["Bill"]){
    //     total += data["Bill"][stock]["quantity"]
    // }
    // console.log(total)

    // //Calculate portfolio percentages for Bill
    // for (let i in data["Bill"]){
    //     portfolio_stock_percentage = (data["Bill"][i]["quantity"]/total)*100
    //     console.log(`stock ${data["Bill"][i]["ticker"]} is ${portfolio_stock_percentage}% of the amount of stock of Bill's portfolio`);
    // }


    let totals_dict = {}; // A dictionary of the total assets managed by each client
    let total_assets_managed = 0;
    let stock_names = []

    // Get the unique names of all the stock in everyone's portfolio
    names_list.forEach(client => {
        // Reset this for each client
        // total_portfolio_value = 0;
        // Total Assets Managed
        data[client].forEach(stock_purchased =>{
            // console.log(stock_purchased["ticker"])
            if (stock_names.includes(stock_purchased["ticker"])){

            }
            else{
                stock_names.push(stock_purchased["ticker"])
            }
            // total_portfolio_value += stock_purchased["current_value"]
            // total_assets_managed += stock_purchased["current_value"]
        });
        // totals_dict[client] = total_portfolio_value;
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
    // console.log(stock_list)
    // create an array for all the current_values
    current_value_list = []
    names_list.forEach(element2 => {
        data[element2].forEach(values2 => {
            current_value_list.push(values2.current_value)
        })
    });
    // console.log(current_value_list)

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
     console.log(portfolio_stock_dictionary)

     var totals_dict_keys1 = Object.keys(portfolio_stock_dictionary);
     var totals_dict_values1 = Object.values(portfolio_stock_dictionary);
     
     var filtered_keys1 = totals_dict_keys1
     var filtered_values1 = totals_dict_values1

    // names_list.forEach(client => {
    //     // Reset this for each client
    //     // total_portfolio_value = 0;
    //     // Total Assets Managed
    //     data[client].forEach(stock_purchased =>{
    //         // console.log(stock_purchased["ticker"])
    //         if (stock_names.includes(stock_purchased["ticker"])){

    //         }
    //         else{
    //             stock_names.push(stock_purchased["ticker"])
    //         }
    //         // total_portfolio_value += stock_purchased["current_value"]
    //         // total_assets_managed += stock_purchased["current_value"]
    //     });
    //     // totals_dict[client] = total_portfolio_value;
    // });


    
    

    // console.log(stock_names);

    var totals_dict_keys = Object.keys(totals_dict);
    var totals_dict_values = Object.values(totals_dict);
    
    var filtered_keys = totals_dict_keys
    var filtered_values = totals_dict_values
    

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
            // textinfo: "label+percent",
            textposition: "inside",
            automargin: true,
            name: 'Overall Stock Portfolio'
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
        
       
    };


    // Create our number formatter.
    var formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'AUD',
    });
    total_assets_managed_formatted = formatter.format(total_assets_managed);
    d3.select("#total_assets").html(total_assets_managed_formatted);


    // total = 0
    // for (let stock in data["Bill"]){
    //     total += data["Bill"][stock]["current_value"]
    // }
    // console.log(total)

    //Calculate portfolio percentages for Bill
    // for (let i in data["Bill"]){
    //     portfolio_value_percentage = (data["Bill"][i]["current_value"]/total)*100
    //     console.log(`stock ${data["Bill"][i]["ticker"]} is ${portfolio_value_percentage}% of the value of Bill's portfolio`);
    // }

    
});

// Get the stock history data
d3.json("/json_stock_history").then(function(data){
    // console.log("Stock History Data")
    // console.log(data)
    // Create a date list
    // date_list = []
    // for (let date in data[0]["information"]){
    //     date_list.push(date)
    // }
    // console.log(date_list);

    // Find the CBA.AX stock history
    // console.log((data[1]['stock']))
    // date_list.forEach(date => {
    //     console.log(`Open: ${data[1]['information'][date]["Open"]}`)
    //     console.log(`High: ${data[1]['information'][date]["High"]}`)
    //     console.log(`Close*: ${data[1]['information'][date]["Close*"]}`)
    //     console.log(`Adj. close**: ${data[1]['information'][date]["Adj. close**"]}`)
    //     console.log(`Volume: ${data[1]['information'][date]["Volume"]}`)
    // });

  });
