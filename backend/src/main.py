import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.models.transaction import Category, Account, Transaction, Budget, AIInsight
from src.routes.user import user_bp
from src.routes.transactions import transactions_bp
from src.routes.ai_assistant import ai_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'finaice_secret_key_2024'

# Включаем CORS для всех доменов
CORS(app, origins="*")

# Регистрируем blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(transactions_bp, url_prefix='/api')
app.register_blueprint(ai_bp, url_prefix='/api')

# Настройка базы данных
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def init_test_data():
    """Инициализация тестовых данных"""
    # Проверяем, есть ли уже данные
    if Category.query.first():
        return
    
    # Создаем категории расходов
    expense_categories = [
        {'name': 'Продукты', 'icon': 'hamburger', 'color': '#4ADE80'},
        {'name': 'Транспорт', 'icon': 'taxi', 'color': '#FBBF24'},
        {'name': 'Рестораны', 'icon': 'restaurant', 'color': '#F87171'},
        {'name': 'Развлечения', 'icon': 'palm-tree', 'color': '#EC4899'},
        {'name': 'Покупки', 'icon': 'shopping-cart', 'color': '#3B82F6'},
        {'name': 'Здоровье', 'icon': 'medical', 'color': '#EF4444'},
        {'name': 'Образование', 'icon': 'book', 'color': '#8B5CF6'},
        {'name': 'Коммунальные', 'icon': 'home', 'color': '#64748B'},
        {'name': 'Прочее', 'icon': 'dots', 'color': '#6B7280'}
    ]
    
    # Создаем категории доходов
    income_categories = [
        {'name': 'Зарплата', 'icon': 'money-bag', 'color': '#10B981'},
        {'name': 'Фриланс', 'icon': 'laptop', 'color': '#06B6D4'},
        {'name': 'Инвестиции', 'icon': 'chart', 'color': '#8B5CF6'},
        {'name': 'Подарки', 'icon': 'gift', 'color': '#F59E0B'},
        {'name': 'Прочие доходы', 'icon': 'plus', 'color': '#059669'}
    ]
    
    # Добавляем категории в базу
    for cat_data in expense_categories:
        category = Category(
            name=cat_data['name'],
            icon=cat_data['icon'],
            color=cat_data['color'],
            type='expense'
        )
        db.session.add(category)
    
    for cat_data in income_categories:
        category = Category(
            name=cat_data['name'],
            icon=cat_data['icon'],
            color=cat_data['color'],
            type='income'
        )
        db.session.add(category)
    
    # Создаем тестовые счета
    accounts_data = [
        {'name': 'Наличные', 'type': 'cash', 'balance': 15000, 'icon': 'wallet', 'color': '#10B981'},
        {'name': 'Сбербанк', 'type': 'card', 'balance': 85000, 'icon': 'credit-card', 'color': '#059669'},
        {'name': 'Тинькофф', 'type': 'card', 'balance': 42000, 'icon': 'credit-card', 'color': '#FBBF24'},
        {'name': 'Криптовалюта', 'type': 'crypto', 'balance': 25000, 'icon': 'bitcoin', 'color': '#F59E0B'}
    ]
    
    for acc_data in accounts_data:
        account = Account(
            user_id=1,
            name=acc_data['name'],
            type=acc_data['type'],
            balance=acc_data['balance'],
            icon=acc_data['icon'],
            color=acc_data['color']
        )
        db.session.add(account)
    
    db.session.commit()

with app.app_context():
    db.create_all()
    init_test_data()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
