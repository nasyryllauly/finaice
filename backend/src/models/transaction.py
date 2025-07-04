from src.models.user import db
from datetime import datetime

class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    date = db.Column(db.DateTime, default=datetime.utcnow)
    type = db.Column(db.String(20), nullable=False)  # 'income' or 'expense'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # ИИ-поля
    ai_category_confidence = db.Column(db.Float, default=0.0)  # Уверенность ИИ в категории
    ai_suggested = db.Column(db.Boolean, default=False)  # Предложено ли ИИ
    
    def to_dict(self):
        return {
            'id': self.id,
            'amount': self.amount,
            'category': self.category,
            'description': self.description,
            'date': self.date.isoformat() if self.date else None,
            'type': self.type,
            'user_id': self.user_id,
            'ai_category_confidence': self.ai_category_confidence,
            'ai_suggested': self.ai_suggested
        }

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    icon = db.Column(db.String(10), nullable=False)  # Эмодзи
    color = db.Column(db.String(20), nullable=False)  # CSS класс цвета
    type = db.Column(db.String(20), nullable=False)  # 'income' or 'expense'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'icon': self.icon,
            'color': self.color,
            'type': self.type
        }

class AIInsight(db.Model):
    __tablename__ = 'ai_insights'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    insight_type = db.Column(db.String(50), nullable=False)  # 'tip', 'warning', 'prediction'
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    priority = db.Column(db.Integer, default=1)  # 1-5, где 5 - самый важный
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'insight_type': self.insight_type,
            'title': self.title,
            'message': self.message,
            'priority': self.priority,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_read': self.is_read
        }

