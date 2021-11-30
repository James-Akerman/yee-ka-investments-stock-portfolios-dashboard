import time
from datetime import datetime
from splinter import Browser
from bs4 import BeautifulSoup as bs
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
import pandas as pd
import pymongo
import numpy as np

def financial_sheets_etl(ticker, sheet):   
    ##### Extract #####
    # Read the tables in the HTML page
    # Scrape the Data
    executable_path = {'executable_path': ChromeDriverManager().install()}
    browser = Browser('chrome', **executable_path, headless=False)

    stock = ticker
    url = f'https://au.finance.yahoo.com/quote/{stock}/{sheet}?p={stock}'
    browser.visit(url)

    time.sleep(1)

    html = browser.html
    soup = bs(html, "html.parser")

    # Get table headers
    financial_sheet_headers = soup.find_all('div', class_='D(tbr) C($primaryColor)')
    # Get table rows
    financial_sheet_rows = soup.find_all('div', class_='D(tbr) fi-row Bgc($hoverBgColor):h')
    
    # Quit the browser
    browser.quit()

    # Get the table headers
    table_headers_list = []
    for header in financial_sheet_headers:
        for span in header.find_all('span'):
            table_headers_list.append(span.text)

    # Get all the table rows
    table_rows = []
    row_list = []
    for rows in financial_sheet_rows:
        for fields in rows:
            row_list.append(fields.text)
        # Add row to table rows
        table_rows.append(row_list)
        # Reset the row list for the next row
        row_list = []
    
    # Convert the result into a DataFrame
    financial_table = pd.DataFrame(table_rows, columns=table_headers_list)
    ##### Extract #####

    ##### Transform #####
    financial_table_new = financial_table.replace('', np.NaN)
    financial_table_new = financial_table_new.dropna()
    financial_table_new = financial_table_new.replace('-',0)
    financial_table_new = financial_table_new.set_index('Breakdown')
    ##### Transform #####

    ##### Load #####
    stock_finance_reports = {}
    stock_dict = {}

    for column in financial_table_new.columns:
        fin_series = financial_table_new[[column]].to_dict()[column]
        stock_finance_reports[column] = fin_series

    stock_dict['stock'] = stock
    stock_dict['information'] = stock_finance_reports
    ##### Transform #####
    
    ##### Load #####
  
    conn = 'mongodb://localhost:27017'
    client = pymongo.MongoClient(conn)
    
    newvalues = { "$set": {'information':stock_dict['information']} }
    
    if(sheet=='balance-sheet'):
        
        client.shares.balance_sheets.update_one({'stock':stock}, newvalues, True)
    elif(sheet=='financials'):
        client.shares.income_statements.update_one({'stock':stock}, newvalues, True)
    else:
        client.shares.cash_flow_statements.update_one({'stock':stock}, newvalues, True)
    ##### Load #####
    
def summary_info(ticker): 
    ##### Extract #####
    # start web browser
    browser = webdriver.Chrome(ChromeDriverManager().install())

    stock = ticker

    # get source code
    browser.get(f"https://au.finance.yahoo.com/quote/{stock}?p={stock}")
    html = browser.page_source
    time.sleep(2)
    df = pd.read_html(html)

    # close web browser
    browser.close()

    # Get each table from the table list
    summary_table_1 = df[0]
    summary_table_2 = df[1]
    # Join the tables together
    total_summary_table = summary_table_1.append(summary_table_2)
    # Rename the columns
    total_summary_table = total_summary_table.rename(columns = {0:'Summary Metric', 1:'Value'})
    ##### Extract #####

    ##### Transform #####
    # Remove all the rows without values based on any of the financial year columns
    summary_table_new = total_summary_table[total_summary_table['Value']!=''].copy()

    # Replace all fields containing '-' with 0
    summary_table_new = summary_table_new.replace('-',0)

    # Set the index to Summary Metric
    summary_table_new = summary_table_new.set_index('Summary Metric')

    summary_table_stock_value = summary_table_new.copy()

    # Convert it to a dictionary
    summary_dict = summary_table_stock_value.to_dict()
    ##### Transform #####
    

    ##### Load #####
    conn = 'mongodb://localhost:27017'
    client = pymongo.MongoClient(conn)

    # Load into the database 
    stock_dict = {}
    stock_dict['stock'] = stock
    stock_dict['information'] = summary_dict['Value']
    
    newvalues = { "$set": {'information':stock_dict['information']} }
    
    client.shares.summary.update_one({'stock':stock}, newvalues, True)

    ##### Load #####
    
def stock_history_average(ticker):
    ##### Extract #####
    d = datetime.today()
    unixtime = time.mktime(d.timetuple())
    starting_date = round(time.mktime(datetime.strptime("01/10/1991", "%d/%m/%Y").timetuple()))
    current_time = round(unixtime)
    stock = ticker

    ##### Web scrapper for infinite scrolling page #####
    driver = webdriver.Chrome(ChromeDriverManager().install())
    driver.get(f"https://au.finance.yahoo.com/quote/{stock}/history?period1={starting_date}&period2={current_time}&interval=1d&filter=history&frequency=1d&includeAdjustedClose=true")

    time.sleep(2)  # Allow 2 seconds for the web page to open

    #Scroll until you reach the bottom of the page
    for x in range(1000):
        driver.execute_script("window.scrollBy(0, 1000);")
    
    soup = bs(driver.page_source, "html.parser")

    # Quit the browser
    driver.quit()

    # Get the table headers
    table_headers_list = []
    for header in soup.find_all('tr', class_="C($tertiaryColor) Fz(xs) Ta(end)"):
        for span in header.find_all('span'):
            table_headers_list.append(span.text)

    # Get all the table rows
    table_rows = []
    row_list = []
    for row in soup.find_all('tr', class_="BdT Bdc($seperatorColor) Ta(end) Fz(s) Whs(nw)"):
        for fields in row:
            row_list.append(fields.text)
        # Add row to table rows
        table_rows.append(row_list)
        # Reset the row list for the next row
        row_list = []
    
    # Convert the result into a DataFrame
    stock_history = pd.DataFrame(table_rows, columns=table_headers_list)
    ##### Extract #####
    
    ##### Transform #####
    df = stock_history.copy()
    # Get the dates and the year of each record
    df['Month']= df['Date'].str.slice(start=3,stop=6)
    df['Year']= df['Date'].str.slice(start=7,stop=12)

    # Remove all the null values
    df = df.dropna()
    # Replace '-' abd ',' characters
    df_new = df.replace('-','0')
    df_new['Volume'] = df_new['Volume'].str.replace(',','')
    #convert strings to floats
    df_new[['Open', 'High', 'Low', 'Close*','Adj. close**','Volume']] = df_new[['Open', 'High', 'Low', 'Close*', 'Adj. close**','Volume']].astype(dtype='float64')
    # Get the average 'Open', 'High', 'Low', 'Close', 'Adj Close', and 'Volume' of each month for each year
    df_average = df_new.groupby(['Year','Month']).mean().round(2)
    # Round the average 'Volume' to 0 decimal places
    df_average['Volume'] = df_average['Volume'].round()

    # Create a new index called 'Year-Month-Average'
    df_average = df_average.reset_index()
    df_average['Year-Month-Average'] = df_average['Year'] + '-' + df_average['Month']
    df_average = df_average.drop(['Year','Month'],axis=1)
    df_average = df_average.set_index('Year-Month-Average')

    # Transpose the columns
    df_average_tran = df_average.copy().T
    #Convert to a dictionary
    df_dict = df_average_tran.to_dict()
    
    stock_dict = {}
    stock_dict['stock'] = stock
    stock_dict['information'] = df_dict
    ##### Transform #####
    
    ##### Load #####
    # Load Into Mongodb
    conn = 'mongodb://localhost:27017'
    client = pymongo.MongoClient(conn)
    # Update the information in the document if the stock is found, else insert a new document for the stock
    newvalues = { "$set": {'information':stock_dict['information']} }
    client.shares.stock_history_average.update_one({'stock':stock}, newvalues, True)
    
def stock_history(ticker):   
    ##### Extract #####
    d = datetime.today()
    unixtime = time.mktime(d.timetuple())
    starting_date = round(time.mktime(datetime.strptime("01/10/1991", "%d/%m/%Y").timetuple()))
    current_time = round(unixtime)
    stock = ticker

    ##### Web scrapper for infinite scrolling page #####
    driver = webdriver.Chrome(ChromeDriverManager().install())
    driver.get(f"https://au.finance.yahoo.com/quote/{stock}/history?period1={starting_date}&period2={current_time}&interval=1d&filter=history&frequency=1d&includeAdjustedClose=true")

    time.sleep(2)  # Allow 2 seconds for the web page to open

    #Scroll until you reach the bottom of the page
    for x in range(1000):
        driver.execute_script("window.scrollBy(0, 1000);")
    
    soup = bs(driver.page_source, "html.parser")

    # Quit the browser
    driver.quit()

    # Get the table headers
    table_headers_list = []
    for header in soup.find_all('tr', class_="C($tertiaryColor) Fz(xs) Ta(end)"):
        for span in header.find_all('span'):
            table_headers_list.append(span.text)

    # Get all the table rows
    table_rows = []
    row_list = []
    for row in soup.find_all('tr', class_="BdT Bdc($seperatorColor) Ta(end) Fz(s) Whs(nw)"):
        for fields in row:
            row_list.append(fields.text)
        # Add row to table rows
        table_rows.append(row_list)
        # Reset the row list for the next row
        row_list = []
    
    # Convert the result into a DataFrame
    stock_history = pd.DataFrame(table_rows, columns=table_headers_list)
    ##### Extract #####
    
    ##### Transform #####
    df = stock_history.copy()
    # Remove all the null values
    df = df.dropna()
    # Replace '-' abd ',' characters
    df_new = df.replace('-','0')
    df_new['Volume'] = df_new['Volume'].str.replace(',','')
    #convert strings to floats
    df_new[['Open', 'High', 'Low', 'Close*','Adj. close**','Volume']] = df_new[['Open', 'High', 'Low', 'Close*', 'Adj. close**','Volume']].astype(dtype='float64')
    # Get the average 'Open', 'High', 'Low', 'Close', 'Adj Close', and 'Volume' of each month for each year
    df_new = df_new.set_index('Date')

    # Transpose the columns
    df_new_tran = df_new.copy().T
    #Convert to a dictionary
    df_dict = df_new_tran.to_dict()
    
    stock_dict = {}
    stock_dict['stock'] = stock
    stock_dict['information'] = df_dict
    ##### Transform #####
    
    ##### Load #####
    # Load Into Mongodb
    conn = 'mongodb://localhost:27017'
    client = pymongo.MongoClient(conn)
    # Update the information in the document if the stock is found, else insert a new document for the stock
    newvalues = { "$set": {'information':stock_dict['information']} }
    client.shares.stock_history.update_one({'stock':stock}, newvalues, True)
    
def statistics(ticker):    
    ##### Extract #####
    # start web browser
    browser = webdriver.Chrome(ChromeDriverManager().install())
    
    stock = ticker
    
    # get source code
    browser.get(f"https://au.finance.yahoo.com/quote/{stock}/key-statistics?p={stock}")
    html = browser.page_source
    time.sleep(2)

    # Get the table labels
    soup = bs(browser.page_source, "html.parser")

    h2_headings = soup.find_all('h2', class_="Pt(20px)")
    h2_list = [heading.span.text for heading in h2_headings]

    h3_headings = soup.find_all('h3', class_="Mt(20px)")
    h3_list = [heading.span.text for heading in h3_headings] 

    # Get the tables
    df = pd.read_html(html)

    # Create a combined list
    h2_list.pop()
    headings_list = h2_list + h3_list
    headings_list

    # close web browser
    browser.close()

    ##### Transform #####
    new_table_list = [table.dropna().rename(columns={0:'Metric',1:'Value'}).set_index('Metric') for table in df]
    table_dict = {}
    for i in range(len(headings_list)):
        table_dict[headings_list[i]] = new_table_list[i].to_dict()['Value']

    stock_dict = {}
    stock_dict['stock'] = stock
    stock_dict['information'] = table_dict
    ##### Transform #####

    ##### Load #####
    conn = 'mongodb://localhost:27017'
    client = pymongo.MongoClient(conn)
    newvalues = { "$set": {'information':stock_dict['information']} }
    client.shares.statistics.update_one({'stock':stock}, newvalues, True)
    
def holders(ticker):
    ##### Extract #####
    # start web browser
    browser = webdriver.Chrome(ChromeDriverManager().install())

    stock = ticker

    # get source code
    browser.get(f"https://au.finance.yahoo.com/quote/{stock}/holders?p={stock}")
    html = browser.page_source
    time.sleep(2)

    # Get the tables
    df = pd.read_html(html)

    # Get the table labels
    soup = bs(browser.page_source, "html.parser")

    heading_1 = soup.find('h3',class_="D(ib)").span.text
    heading_2 = soup.find('h3',class_="Mb(10px)").span.text

    # close web browser
    browser.close()
    ##### Extract #####

    ##### Transform #####
    table_1 = df[0].rename(columns={1:'Metric',0:'Value'}).set_index('Metric').to_dict()['Value']
    table_2 = df[1].set_index('Holder').T.to_dict()

    table_dict = {heading_1:table_1, heading_2:table_2}

    stock_dict = {}
    stock_dict['stock'] = ticker
    stock_dict['information'] = table_dict
    # ##### Transform #####

    ##### Load #####
    conn = 'mongodb://localhost:27017'
    client = pymongo.MongoClient(conn)
  
    newvalues = { "$set": {'information':stock_dict['information']} }  
    client.shares.holders.update_one({'stock':stock}, newvalues, True)
    ##### Load #####


def yahoo_finance_etl(stock_list): 
    for stock in stock_list:
        # financial reports
        for report in ['balance-sheet','financials','cash-flow']:
            financial_sheets_etl(stock,report)
        #summary table
        summary_info(stock)
        # average stock history
        stock_history_average(stock)
        # all stock history
        stock_history(stock)
        # stock statistics
        statistics(stock)
        # holder information
        holders(stock)




