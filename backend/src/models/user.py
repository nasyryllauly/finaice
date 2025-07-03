from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=True)
    last_name = db.Column(db.String(50), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    avatar_url = db.Column(db.String(255), nullable=True)
    currency = db.Column(db.String(3), default='RUB', nullable=False)
    timezone = db.Column(db.String(50), default='Europe/Moscow', nullable=False)
    language = db.Column(db.String(5), default='ru', nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    email_verified = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Настройки уведомлений
    notifications_enabled = db.Column(db.Boolean, default=True, nullable=False)
    email_notifications = db.Column(db.Boolean, default=True, nullable=False)
    push_notifications = db.Column(db.Boolean, default=True, nullable=False)
    
    # Настройки приватности
    balance_visible = db.Column(db.Boolean, default=True, nullable=False)
    
    # Связи с другими таблицами
    accounts = db.relationship('Account', backref='user', lazy=True, cascade='all, delete-orphan')
    transactions = db.relationship('Transaction', backref='user', lazy=True, cascade='all, delete-orphan')
    budgets = db.relationship('Budget', backref='user', lazy=True, cascade='all, delete-orphan')
    ai_insights = db.relationship('AIInsight', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone,
            'avatar_url': self.avatar_url,
            'currency': self.currency,
            'timezone': self.timezone,
            'language': self.language,
            'is_active': self.is_active,
            'email_verified': self.email_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'notifications_enabled': self.notifications_enabled,
            'email_notifications': self.email_notifications,
            'push_notifications': self.push_notifications,
            'balance_visible': self.balance_visible
        }
    
    @classmethod
    def create_default_user(cls):
        """Создает пользователя по умолчанию для демо"""
        user = cls(
            username='demo_user',
            email='demo@finaice.app',
            password_hash='demo_password_hash',
            first_name='Демо',
            last_name='Пользователь',
            currency='RUB',
            timezone='Europe/Moscow',
            language='ru',
            is_active=True,
            email_verified=True
        )
        return user

