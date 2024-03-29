# Yee Ka Investments Stock Porfolios Dashboard
## Overview of the Project
This web interactive dashboard is designed to help a potential fund manager to review the progress of the clients’ share portfolios using the latest data scraped from yahoo fiance using a custom python [module](yahoo_finance_etl_module_2.py).
![yahoo-finance](images/stock-price-history.PNG)

<br>

It enables a high level overview of activity across all portfolios including
- the total current value of all client portfolios in $AU.
- what percentage each stock managed contributes to the total funds managed.
- the closing stock prices of all the stocks, which available in the database, from the last week.
![All Portfolios](images/all-portfolios.PNG)

<br>

And within each porfolio including
- a comparison the the total current value of a client's portfolio vs its original purchase value.
- what percentage each stock managed contributes to the total funds managed for the client.
- the closing stock prices of all the stocks in the client's portfolio from the last week.
![Individual Portfolio](images/individual-portfolio.PNG)

It also allows for insertion, updating, and deletion of stock, portfolio, and client data.

<br>

## Tools/Packages used
- Python
  - Pandas
  - Pymongo
  - Flask
  - splinter
  - BeatuifulSoup
  - Selenium
  - numpy
  - datetime
  - time
  - bson
  - jinja
- Javascript
  - Bootstrap
  - D3
  - Plotly.js
  - Google Charts
  - Charts.js
- MongoDB
- HTML

<br>

## How to use
1) Download the directory
2) Open Git in the directory and type ``` python app.py ```
3) Go to web address specified, usually `https://127.0.0.1:5000/`
