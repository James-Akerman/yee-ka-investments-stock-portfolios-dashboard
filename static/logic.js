
// Get the portfolio data
d3.json("/json_portfolios").then(function(data){
    console.log("Portfolio Data")
    console.log(data)
  });

// Get the stock history data
d3.json("/json_stock_history").then(function(data){
    console.log("Stock History Data")
    console.log(data)
  });
