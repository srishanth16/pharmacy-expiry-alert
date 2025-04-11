from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timedelta
import os

# Load .env variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# MongoDB connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client.pharmacy
medicines = db.medicines

# Routes
@app.route('/')
def home():
    return "✅ Pharmacy Backend is Running"

@app.route('/add-medicine', methods=['POST'])
def add_medicine():
    data = request.get_json()
    medicine = {
        'name': data['name'],
        'expiry_date': data['expiry_date'],
        'quantity': data['quantity'],
        'manufacturer': data['manufacturer']
    }
    medicines.insert_one(medicine)
    return jsonify({'message': 'Medicine added successfully'}), 201

@app.route('/get-medicines')
def get_medicines():
    meds_cursor = medicines.find()
    sorted_meds = sorted(meds_cursor, key=lambda x: datetime.strptime(x['expiry_date'], "%Y-%m-%d"))
    result = []
    for med in sorted_meds:
        result.append({
            'name': med['name'],
            'expiry_date': med['expiry_date'],
            'quantity': med['quantity'],
            'manufacturer': med['manufacturer']
        })
    return jsonify(result)

@app.route('/get-near-expiry')
def get_near_expiry():
    today = datetime.today()
    near_expiry = today + timedelta(days=30)

    meds_cursor = medicines.find()
    result = []

    for med in meds_cursor:
        expiry = datetime.strptime(med['expiry_date'], "%Y-%m-%d")
        if today <= expiry <= near_expiry:
            result.append({
                'name': med['name'],
                'expiry_date': med['expiry_date'],
                'quantity': med['quantity'],
                'manufacturer': med['manufacturer']
            })
    return jsonify(result)

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
