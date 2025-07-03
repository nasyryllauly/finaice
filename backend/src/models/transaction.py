from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from src.models.user import db

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    icon = db.Column(db.String(50), nullable=False)
    color = db.Column(db.String(7), nullable=False)  # HEX color
    type = db.Column(db.String(20), nullable=False)  # 'income' or 'expense'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    transactions = db.relationship('Transaction', backref='category', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'icon': self.icon,
            'color': self.color,
            'type': self.type,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Account(db.Model):
    __tablename__ = 'accounts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # 'cash', 'card', 'bank', 'crypto'
    currency = db.Column(db.String(3), default='RUB')
    balance = db.Column(db.Float, default=0.0)
    icon = db.Column(db.String(50), nullable=False)
    color = db.Column(db.String(7), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    transactions = db.relationship('Transaction', backref='account', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'type': self.type,
            'currency': self.currency,
            'balance': self.balance,
            'icon': self.icon,
            'color': self.color,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(255))
    type = db.Column(db.String(20), nullable=False)  # 'income' or 'expense'
    date = db.Column(db.DateTime, default=datetime.utcnow)
    location = db.Column(db.String(255))  # Optional location data
    tags = db.Column(db.Text)  # JSON string of tags
    receipt_url = db.Column(db.String(255))  # URL to receipt image
    is_recurring = db.Column(db.Boolean, default=False)
    recurring_period = db.Column(db.String(20))  # 'daily', 'weekly', 'monthly', 'yearly'
    ai_suggested = db.Column(db.Boolean, default=False)  # Was this suggested by AI
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'account_id': self.account_id,
            'category_id': self.category_id,
            'amount': self.amount,
            'description': self.description,
            'type': self.type,
            'date': self.date.isoformat() if self.date else None,
            'location': self.location,
            'tags': self.tags,
            'receipt_url': self.receipt_url,
            'is_recurring': self.is_recurring,
            'recurring_period': self.recurring_period,
            'ai_suggested': self.ai_suggested,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'category': self.category.to_dict() if self.category else None,
            'account': self.account.to_dict() if self.account else None
        }

class Budget(db.Model):
    __tablename__ = 'budgets'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    period = db.Column(db.String(20), nullable=False)  # 'weekly', 'monthly', 'yearly'
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'category_id': self.category_id,
            'amount': self.amount,
            'period': self.period,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'category': self.category.to_dict() if self.category else None
        }

class AIInsight(db.Model):
    __tablename__ = 'ai_insights'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # 'spending_alert', 'budget_recommendation', 'saving_tip'
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    priority = db.Column(db.String(20), default='medium')  # 'low', 'medium', 'high'
    is_read = db.Column(db.Boolean, default=False)
    action_taken = db.Column(db.Boolean, default=False)
    metadata_json = db.Column(db.Text)  # JSON string with additional data
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime)  # When this insight becomes irrelevant
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'type': self.type,
            'title': self.title,
            'message': self.message,
            'priority': self.priority,
            'is_read': self.is_read,
            'action_taken': self.action_taken,
            'metadata_json': self.metadata_json,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None
        }

