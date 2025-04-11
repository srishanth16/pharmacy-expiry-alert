from datetime import datetime, timedelta

def is_expired(expiry_date):
    today = datetime.today()
    expiry = datetime.strptime(expiry_date, "%Y-%m-%d")
    return expiry < today

def is_near_expiry(expiry_date, days=30):
    today = datetime.today()
    expiry = datetime.strptime(expiry_date, "%Y-%m-%d")
    return 0 <= (expiry - today).days <= days
