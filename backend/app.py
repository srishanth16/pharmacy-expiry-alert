from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
import pymongo
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv
import os

# Load .env
load_dotenv()

EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

app = Flask(__name__)
app.secret_key = 'your_secret_key'

CORS(app, supports_credentials=True)
login_manager = LoginManager()
login_manager.init_app(app)

# MongoDB
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["pharmacy"]
medicines_collection = db["medicines"]

# Hardcoded user
users = {'admin': {'password': 'admin123'}}

class User(UserMixin):
    def __init__(self, id):
        self.id = id

@login_manager.user_loader
def load_user(user_id):
    return User(user_id)

@app.route('/')
def home():
    return "Backend running fine 🚀"

@app.route('/check-auth', methods=['GET'])
def check_auth():
    return jsonify({"authenticated": current_user.is_authenticated}), 200 if current_user.is_authenticated else 401

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = users.get(data.get('username'))
    if user and user['password'] == data.get('password'):
        login_user(User(data['username']))
        return jsonify({"message": "Login successful"}), 200
    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/get-medicines', methods=['GET'])
@login_required
def get_medicines():
    meds = list(medicines_collection.find({}, {'_id': 0}))
    return jsonify(meds), 200

@app.route('/get-near-expiry', methods=['GET'])
@login_required
def get_near_expiry():
    today = datetime.today()
    next30 = today + timedelta(days=30)
    near = []
    for med in medicines_collection.find({}, {'_id': 0}):
        try:
            qty = int(med['quantity'])
            exp = datetime.strptime(med['expiry_date'], '%Y-%m-%d')
            if today <= exp <= next30:
                near.append(med)
        except Exception as e:
            print("Parsing error:", e)
    return jsonify(near), 200

@app.route('/add-medicine', methods=['POST'])
@login_required
def add_medicine():
    data = request.json
    if not all(k in data and data[k] for k in ('name','expiry_date','quantity','manufacturer')):
        return jsonify({"error":"Missing fields"}), 400
    try:
        qty = int(data['quantity'])
    except:
        return jsonify({"error":"Quantity must be numeric"}), 400

    medicines_collection.insert_one({
        "name": data['name'],
        "expiry_date": data['expiry_date'],
        "quantity": qty,
        "manufacturer": data['manufacturer']
    })
    return jsonify({"message":"Medicine added"}), 201

@app.route('/dashboard-data', methods=['GET'])
@login_required
def dashboard_data():
    today = datetime.today()
    next30 = today + timedelta(days=30)
    tenDaysAgo = today - timedelta(days=10)

    total = medicines_collection.count_documents({})
    nearC = expiredC = lowStock = 0

    for med in medicines_collection.find():
        try:
            exp = datetime.strptime(med['expiry_date'], '%Y-%m-%d')
            qty = int(med['quantity'])
            if exp < today:
                expiredC += 1
            elif today <= exp <= next30:
                nearC += 1
            if qty <= 5:
                lowStock += 1
        except Exception as e:
            print("Dash parse error:", e)

    # auto-delete >10-day expired
    delRes = medicines_collection.delete_many({
        "expiry_date": {"$lte": tenDaysAgo.strftime('%Y-%m-%d')}
    })
    print(f"Deleted {delRes.deleted_count} old expired meds")

    return jsonify({
        "total_medicines": total,
        "near_expiry_medicines": nearC,
        "expired_medicines": expiredC,
        "low_stock_medicines": lowStock
    }), 200

def send_email_alert():
    today = datetime.today()
    next30 = today + timedelta(days=30)
    listExp = []

    for med in medicines_collection.find():
        try:
            exp = datetime.strptime(med['expiry_date'], '%Y-%m-%d')
            if today <= exp <= next30:
                listExp.append(f"{med['name']} (Exp:{med['expiry_date']}) Qty:{med['quantity']}")
        except:
            continue

    if not listExp:
        return

    body = "Dear Pharmacist,\n\nNear-expiry medicines:\n" + "\n".join(listExp)
    msg = MIMEText(body)
    msg['Subject'] = "⚠️ Near Expiry Alert"
    msg['From'] = "srishanth412@gmail.com"
    msg['To'] = "tonystank1762@gmail.com"  # or a list of recipients

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as s:
            s.login("srishanth412@gmail.com", "ddbl zoku cths gezb")
            s.send_message(msg)
        print("✅ Daily email sent")
    except Exception as e:
        print("❌ Error sending email:", e)

# schedule email & cleanup daily
sched = BackgroundScheduler()
sched.add_job(send_email_alert, 'cron', hour=00,minute=40)
sched.start()

if __name__=='__main__':
    app.run(debug=True)
