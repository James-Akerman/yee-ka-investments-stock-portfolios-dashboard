from flask import Flask, render_template, redirect
# from flask_pymongo import PyMongo
from yahoo_finance_etl_module_2 import stock_history
from flask import Flask, request, render_template
from pymongo import MongoClient
# define the mongodb client
client = MongoClient(port=27017)

# define the database to use
db = client.Portfolios

# Create an instance of Flask
app = Flask(__name__)



# Route to render index.html template using data from Mongo
@app.route("/")
def home():
    # Return template and data
    return render_template("index.html")

# route to get data from html form and insert data into database
@app.route('/portfolio', methods=["GET", "POST"])
def data():
    data = {}
    if request.method == "POST":
        # data['name'] = request.form['name']
        data['ticker'] = request.form['ticker']
        data['quantity'] = request.form['quantity']
        data['price'] = request.form['price']
        db[request.form['name']].insert_one(data)


    return render_template("index.html")


# Route that will trigger the scrape function
@app.route('/stock', methods=["GET", "POST"])
def get_stock_data():
    # Load the data
    stock_history(request.form['stock'])
    # Redirect back to home page
    return redirect("/")


if __name__ == "__main__":
    app.run(debug=True)
