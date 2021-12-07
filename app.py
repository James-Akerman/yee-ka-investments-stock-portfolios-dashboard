from flask import Flask, render_template, redirect
# from flask_pymongo import PyMongo
from yahoo_finance_etl_module_2 import stock_history
from flask import Flask, request, render_template
from pymongo import MongoClient
import json

# define the mongodb client
client = MongoClient(port=27017)

# define the databases and collections to use
dbPortfolio = client.Portfolios
stock_history_collection = client.Stocks.stock_history
client_collection = client.Clients.personal_information


# Create an instance of Flask
app = Flask(__name__)

# Route to render index.html template using data from Mongo
@app.route("/")
def home():
    # Populate the select boxes
    stocks = []
    for document in stock_history_collection.find():
        stocks.append(document['stock'])

    names = []
    for document in client_collection.find():
        names.append(document['name'])
    

    return render_template("index.html",stock_list=stocks, names_list = names)

# GET SAMPLE DATASET
@app.route('/sample_dataset', methods=["GET", "POST"])
def get_sample_dataset():

    # Insert Client Database data
    with open('Sample Dataset/Clients Database/personal_information.json') as file:
        file_data = json.load(file)
    client_collection.insert_many(file_data)

    # Insert Portfolio Database data
    with open('Sample Dataset/Portfolios Database/Bill.json') as file:
        file_data = json.load(file)
    dbPortfolio.Bill.insert_many(file_data)
    # Insert Portfolio Database data
    with open('Sample Dataset/Portfolios Database/Kate.json') as file:
        file_data = json.load(file)
    dbPortfolio.Kate.insert_many(file_data)
    # Insert Portfolio Database data
    with open('Sample Dataset/Portfolios Database/Sarah.json') as file:
        file_data = json.load(file)
    dbPortfolio.Sarah.insert_many(file_data)
    # Insert Portfolio Database data
    with open('Sample Dataset/Portfolios Database/Sam.json') as file:
        file_data = json.load(file)
    dbPortfolio.Sam.insert_many(file_data)

    # Insert Stock Database data
    with open('Sample Dataset/Stocks Database/stock_history.json') as file:
        file_data = json.load(file)
    stock_history_collection.insert_many(file_data)

  # Redirect back to home page
    return redirect("/")

# ADD A CIENT
@app.route('/client', methods=["GET", "POST"])
def personal_information():
    if request.method == "POST":
       client_collection.insert_one({'name': request.form['client-name']})

    return redirect("/")

# GET STOCKS
@app.route('/stock', methods=["GET", "POST"])
def get_stock_data():
    # Load the data
    stock_history(request.form['stock'])
    # Redirect back to home page
    return redirect("/")

# UPDATE ALL THE DATA
@app.route('/update_all_stocks', methods=["GET", "POST"])
def update_all_stock_data():
    # Load the data
    for document in stock_history_collection.find():
            stock_history(document['stock'])
    # Redirect back to home page
    return redirect("/")

# CREATE PORTFOLIO DATA
@app.route('/portfolio', methods=["GET", "POST"])
def data():
    if request.method == "POST":
        # Variables
        # name = request.form['name']
        name = request.form.get('name')
        ticker = request.form.get('ticker')
        quantity = int(request.form['quantity'])
        purchase_price = float(request.form['price'])

        purchase_value = round(purchase_price * quantity,3)
        last_stock_record = stock_history_collection.find({'stock': ticker})
        last_stock_price = list(last_stock_record[0]['information'].values())[0]['Close*']
        last_stock_price - float(last_stock_price)
        current_value = round(quantity * last_stock_price,3)
        value_change = round(current_value - purchase_value,3)

        newvalues = {"$set": {'quantity': quantity, 'purchase_price': purchase_price, 
                            'purchase_value': purchase_value, 'current_price':last_stock_price, 
                            'current_value': current_value, 'change_in_value': value_change, 'owner': name}}

        dbPortfolio[name].update_one({'ticker': ticker}, newvalues, True)

    return redirect("/")


if __name__ == "__main__":
    app.run(debug=True)
