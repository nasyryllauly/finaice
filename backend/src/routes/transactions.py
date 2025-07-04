from flask import Blueprint, request, jsonify
from src.models.user import db, User
from src.models.transaction import Transaction, Category, AIInsight
from datetime import datetime
import random

transactions_bp = Blueprint('transactions', __name__)

# ИИ-сервис для анализа транзакций
class AIService:
    @staticmethod
    def suggest_category(description, amount):
        """Предложить категорию на основе описания и суммы"""
        description_lower = description.lower() if description else ""
        
        # Простая логика категоризации
        if any(word in description_lower for word in ['кафе', 'ресторан', 'еда', 'обед']):
            return 'Еда', 0.9
        elif any(word in description_lower for word in ['такси', 'автобус', 'метро', 'транспорт']):
            return 'Транспорт', 0.85
        elif any(word in description_lower for word in ['магазин', 'продукты', 'покупки']):
            return 'Продукты', 0.8
        elif any(word in description_lower for word in ['кино', 'театр', 'развлечения']):
            return 'Развлечения', 0.75
        elif any(word in description_lower for word in ['аптека', 'врач', 'лекарства']):
            return 'Здоровье', 0.8
        else:
            return 'Прочее', 0.3
    
    @staticmethod
    def generate_insights(user_id):
        """Генерировать ИИ-инсайты для пользователя"""
        user = User.query.get(user_id)
        if not user:
            return []
        
        insights = []
        current_stats = user.get_monthly_stats()
        
        # Анализ трат
        if current_stats['expense'] > 15000:
            insights.append({
                'type': 'warning',
                'title': 'Высокие расходы',
                'message': f'Ваши расходы в этом месяце составляют ₽ {current_stats["expense"]:,.0f}. Рекомендуем пересмотреть бюджет.',
                'priority': 4
            })
        
        # Позитивные инсайты
        if current_stats['balance'] > 30000:
            insights.append({
                'type': 'tip',
                'title': 'Отличная экономия!',
                'message': f'Вы экономите ₽ {current_stats["balance"]:,.0f} в этом месяце. Продолжайте в том же духе!',
                'priority': 2
            })
        
        # Предложения по оптимизации
        insights.append({
            'type': 'prediction',
            'title': 'Прогноз экономии',
            'message': 'Сократив расходы на развлечения на 20%, вы сможете сэкономить дополнительно ₽ 3,000.',
            'priority': 3
        })
        
        return insights

@transactions_bp.route('/transactions', methods=['GET'])
def get_transactions():
    """Получить все транзакции пользователя"""
    user_id = request.args.get('user_id', 1, type=int)
    
    transactions = Transaction.query.filter_by(user_id=user_id).order_by(Transaction.date.desc()).all()
    return jsonify([t.to_dict() for t in transactions])

@transactions_bp.route('/transactions', methods=['POST'])
def create_transaction():
    """Создать новую транзакцию с ИИ-анализом"""
    data = request.get_json()
    
    # ИИ-анализ категории
    suggested_category, confidence = AIService.suggest_category(
        data.get('description', ''), 
        data.get('amount', 0)
    )
    
    transaction = Transaction(
        amount=data['amount'],
        category=data.get('category', suggested_category),
        description=data.get('description', ''),
        type=data['type'],
        user_id=data.get('user_id', 1),
        ai_category_confidence=confidence,
        ai_suggested=data.get('category') is None
    )
    
    db.session.add(transaction)
    db.session.commit()
    
    return jsonify(transaction.to_dict()), 201

@transactions_bp.route('/categories', methods=['GET'])
def get_categories():
    """Получить все категории"""
    categories = Category.query.all()
    return jsonify([c.to_dict() for c in categories])

@transactions_bp.route('/analytics/summary', methods=['GET'])
def get_analytics_summary():
    """Получить аналитическую сводку"""
    user_id = request.args.get('user_id', 1, type=int)
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Статистика за текущий месяц
    monthly_stats = user.get_monthly_stats()
    
    # Анализ по категориям
    transactions = Transaction.query.filter_by(user_id=user_id, type='expense').all()
    category_stats = {}
    
    for transaction in transactions:
        category = transaction.category
        if category not in category_stats:
            category_stats[category] = 0
        category_stats[category] += transaction.amount
    
    # Сортировка по сумме
    sorted_categories = sorted(category_stats.items(), key=lambda x: x[1], reverse=True)
    
    return jsonify({
        'monthly_stats': monthly_stats,
        'balance': user.get_balance(),
        'category_breakdown': sorted_categories[:5],  # Топ 5 категорий
        'total_transactions': len(user.transactions)
    })

@transactions_bp.route('/ai/insights', methods=['GET'])
def get_ai_insights():
    """Получить ИИ-инсайты"""
    user_id = request.args.get('user_id', 1, type=int)
    
    # Получить существующие инсайты
    existing_insights = AIInsight.query.filter_by(user_id=user_id).order_by(AIInsight.created_at.desc()).limit(5).all()
    
    # Если инсайтов мало, генерируем новые
    if len(existing_insights) < 3:
        new_insights = AIService.generate_insights(user_id)
        
        for insight_data in new_insights:
            insight = AIInsight(
                user_id=user_id,
                insight_type=insight_data['type'],
                title=insight_data['title'],
                message=insight_data['message'],
                priority=insight_data['priority']
            )
            db.session.add(insight)
        
        db.session.commit()
        existing_insights = AIInsight.query.filter_by(user_id=user_id).order_by(AIInsight.created_at.desc()).limit(5).all()
    
    return jsonify([i.to_dict() for i in existing_insights])

@transactions_bp.route('/ai/chat', methods=['POST'])
def ai_chat():
    """ИИ-чат для финансовых вопросов"""
    data = request.get_json()
    user_message = data.get('message', '').lower()
    user_id = data.get('user_id', 1)
    
    # Простые ответы ИИ
    responses = {
        'анализ': 'Анализирую ваши расходы... Рекомендую обратить внимание на категорию "Развлечения" - здесь есть потенциал для экономии.',
        'прогноз': 'На основе ваших трат, в следующем месяце вы можете сэкономить до ₽ 5,000, сократив необязательные расходы.',
        'совет': 'Рекомендую использовать правило 50/30/20: 50% на необходимые расходы, 30% на желания, 20% на сбережения.',
        'бюджет': 'Ваш текущий бюджет выглядит сбалансированно. Основные траты идут на продукты и транспорт.',
        'экономия': 'Для экономии рекомендую: 1) Готовить дома чаще 2) Использовать общественный транспорт 3) Планировать покупки заранее'
    }
    
    # Поиск подходящего ответа
    response = "Извините, я не понял ваш вопрос. Попробуйте спросить об анализе трат, прогнозе или советах по экономии."
    
    for keyword, answer in responses.items():
        if keyword in user_message:
            response = answer
            break
    
    return jsonify({
        'response': response,
        'timestamp': datetime.utcnow().isoformat()
    })

# Инициализация базовых категорий
@transactions_bp.route('/init-data', methods=['POST'])
def init_data():
    """Инициализировать базовые данные"""
    # Создать базовые категории
    default_categories = [
        {'name': 'Продукты', 'icon': '🛒', 'color': 'bg-blue-500', 'type': 'expense'},
        {'name': 'Транспорт', 'icon': '🚇', 'color': 'bg-purple-500', 'type': 'expense'},
        {'name': 'Еда', 'icon': '🍽️', 'color': 'bg-green-500', 'type': 'expense'},
        {'name': 'Развлечения', 'icon': '🎬', 'color': 'bg-red-500', 'type': 'expense'},
        {'name': 'Здоровье', 'icon': '💊', 'color': 'bg-pink-500', 'type': 'expense'},
        {'name': 'Образование', 'icon': '📚', 'color': 'bg-indigo-500', 'type': 'expense'},
        {'name': 'Кошелёк', 'icon': '💳', 'color': 'bg-orange-500', 'type': 'expense'},
        {'name': 'Зарплата', 'icon': '💰', 'color': 'bg-green-500', 'type': 'income'},
    ]
    
    for cat_data in default_categories:
        existing = Category.query.filter_by(name=cat_data['name']).first()
        if not existing:
            category = Category(**cat_data)
            db.session.add(category)
    
    # Создать тестового пользователя
    existing_user = User.query.filter_by(username='demo').first()
    if not existing_user:
        user = User(username='demo', email='demo@budgetok.ai')
        db.session.add(user)
        db.session.commit()
        
        # Добавить тестовые транзакции
        test_transactions = [
            {'amount': 45000, 'category': 'Зарплата', 'description': 'Зарплата за март', 'type': 'income'},
            {'amount': 850, 'category': 'Продукты', 'description': 'Покупки в магазине', 'type': 'expense'},
            {'amount': 600, 'category': 'Транспорт', 'description': 'Проезд на такси', 'type': 'expense'},
            {'amount': 11200, 'category': 'Кошелёк', 'description': 'Покупка одежды', 'type': 'expense'},
            {'amount': 320, 'category': 'Еда', 'description': 'Обед в кафе', 'type': 'expense'},
        ]
        
        for trans_data in test_transactions:
            transaction = Transaction(user_id=user.id, **trans_data)
            db.session.add(transaction)
    
    db.session.commit()
    return jsonify({'message': 'Data initialized successfully'})

