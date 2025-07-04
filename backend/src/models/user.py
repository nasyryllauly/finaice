from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Связи
    transactions = db.relationship('Transaction', backref='user', lazy=True, cascade='all, delete-orphan')
    ai_insights = db.relationship('AIInsight', backref='user', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def get_balance(self):
        """Получить текущий баланс пользователя"""
        total_income = sum(t.amount for t in self.transactions if t.type == 'income')
        total_expense = sum(t.amount for t in self.transactions if t.type == 'expense')
        return total_income - total_expense
    
    def get_monthly_stats(self, year=None, month=None):
        """Получить статистику за месяц"""
        if not year or not month:
            now = datetime.utcnow()
            year, month = now.year, now.month
            
        monthly_transactions = [
            t for t in self.transactions 
            if t.date and t.date.year == year and t.date.month == month
        ]
        
        income = sum(t.amount for t in monthly_transactions if t.type == 'income')
        expense = sum(t.amount for t in monthly_transactions if t.type == 'expense')
        
        return {
            'income': income,
            'expense': expense,
            'balance': income - expense,
            'transactions_count': len(monthly_transactions)
        }
