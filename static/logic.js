
// Get the portfolio data
d3.json("/json_portfolios").then(function(data){
    // console.log("Portfolio Data")
    console.log(data)

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

    total = 0
    for (let stock in data["Bill"]){
        total += data["Bill"][stock]["current_value"]
    }
    console.log(total)

    //Calculate portfolio percentages for Bill
    for (let i in data["Bill"]){
        portfolio_value_percentage = (data["Bill"][i]["current_value"]/total)*100
        console.log(`stock ${data["Bill"][i]["ticker"]} is ${portfolio_value_percentage}% of the value of Bill's portfolio`);
    }




});

// Get the stock history data
d3.json("/json_stock_history").then(function(data){
    // console.log("Stock History Data")
    // console.log(data)
    // Create a date list
    date_list = []
    for (let date in data[0]["information"]){
        date_list.push(date)
    }
    console.log(date_list);

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
