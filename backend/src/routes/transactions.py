from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from sqlalchemy import func, and_, or_
from src.models.user import db
from src.models.transaction import Transaction, Category, Account, Budget

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/transactions', methods=['GET'])
def get_transactions():
    """Получить список транзакций с фильтрацией"""
    user_id = request.args.get('user_id', 1, type=int)
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    category_id = request.args.get('category_id', type=int)
    account_id = request.args.get('account_id', type=int)
    transaction_type = request.args.get('type')  # 'income' or 'expense'
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    search = request.args.get('search')
    
    query = Transaction.query.filter_by(user_id=user_id)
    
    # Применяем фильтры
    if category_id:
        query = query.filter_by(category_id=category_id)
    if account_id:
        query = query.filter_by(account_id=account_id)
    if transaction_type:
        query = query.filter_by(type=transaction_type)
    if start_date:
        query = query.filter(Transaction.date >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(Transaction.date <= datetime.fromisoformat(end_date))
    if search:
        query = query.filter(Transaction.description.contains(search))
    
    # Сортировка по дате (новые сначала)
    query = query.order_by(Transaction.date.desc())
    
    # Пагинация
    transactions = query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'transactions': [t.to_dict() for t in transactions.items],
        'total': transactions.total,
        'pages': transactions.pages,
        'current_page': page,
        'per_page': per_page
    })

@transactions_bp.route('/transactions', methods=['POST'])
def create_transaction():
    """Создать новую транзакцию"""
    data = request.get_json()
    
    # Валидация обязательных полей
    required_fields = ['user_id', 'account_id', 'category_id', 'amount', 'type']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    try:
        transaction = Transaction(
            user_id=data['user_id'],
            account_id=data['account_id'],
            category_id=data['category_id'],
            amount=float(data['amount']),
            description=data.get('description', ''),
            type=data['type'],
            date=datetime.fromisoformat(data['date']) if data.get('date') else datetime.utcnow(),
            location=data.get('location'),
            tags=data.get('tags'),
            receipt_url=data.get('receipt_url'),
            is_recurring=data.get('is_recurring', False),
            recurring_period=data.get('recurring_period'),
            ai_suggested=data.get('ai_suggested', False)
        )
        
        db.session.add(transaction)
        
        # Обновляем баланс счета
        account = Account.query.get(data['account_id'])
        if account:
            if data['type'] == 'income':
                account.balance += float(data['amount'])
            else:
                account.balance -= float(data['amount'])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Transaction created successfully',
            'transaction': transaction.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/transactions/<int:transaction_id>', methods=['PUT'])
def update_transaction(transaction_id):
    """Обновить транзакцию"""
    transaction = Transaction.query.get_or_404(transaction_id)
    data = request.get_json()
    
    try:
        # Сохраняем старую сумму для корректировки баланса
        old_amount = transaction.amount
        old_type = transaction.type
        old_account_id = transaction.account_id
        
        # Обновляем поля
        for field in ['amount', 'description', 'category_id', 'account_id', 'type', 'location', 'tags']:
            if field in data:
                if field == 'amount':
                    setattr(transaction, field, float(data[field]))
                else:
                    setattr(transaction, field, data[field])
        
        if 'date' in data:
            transaction.date = datetime.fromisoformat(data['date'])
        
        transaction.updated_at = datetime.utcnow()
        
        # Корректируем баланс старого счета
        old_account = Account.query.get(old_account_id)
        if old_account:
            if old_type == 'income':
                old_account.balance -= old_amount
            else:
                old_account.balance += old_amount
        
        # Корректируем баланс нового счета
        new_account = Account.query.get(transaction.account_id)
        if new_account:
            if transaction.type == 'income':
                new_account.balance += transaction.amount
            else:
                new_account.balance -= transaction.amount
        
        db.session.commit()
        
        return jsonify({
            'message': 'Transaction updated successfully',
            'transaction': transaction.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    """Удалить транзакцию"""
    transaction = Transaction.query.get_or_404(transaction_id)
    
    try:
        # Корректируем баланс счета
        account = Account.query.get(transaction.account_id)
        if account:
            if transaction.type == 'income':
                account.balance -= transaction.amount
            else:
                account.balance += transaction.amount
        
        db.session.delete(transaction)
        db.session.commit()
        
        return jsonify({'message': 'Transaction deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/analytics/summary', methods=['GET'])
def get_analytics_summary():
    """Получить сводную аналитику"""
    user_id = request.args.get('user_id', 1, type=int)
    period = request.args.get('period', 'month')  # 'week', 'month', 'year'
    
    # Определяем период
    now = datetime.utcnow()
    if period == 'week':
        start_date = now - timedelta(days=7)
    elif period == 'month':
        start_date = now - timedelta(days=30)
    elif period == 'year':
        start_date = now - timedelta(days=365)
    else:
        start_date = now - timedelta(days=30)
    
    # Общая статистика
    total_income = db.session.query(func.sum(Transaction.amount)).filter(
        and_(
            Transaction.user_id == user_id,
            Transaction.type == 'income',
            Transaction.date >= start_date
        )
    ).scalar() or 0
    
    total_expenses = db.session.query(func.sum(Transaction.amount)).filter(
        and_(
            Transaction.user_id == user_id,
            Transaction.type == 'expense',
            Transaction.date >= start_date
        )
    ).scalar() or 0
    
    # Расходы по категориям
    expenses_by_category = db.session.query(
        Category.name,
        Category.color,
        func.sum(Transaction.amount).label('total')
    ).join(Transaction).filter(
        and_(
            Transaction.user_id == user_id,
            Transaction.type == 'expense',
            Transaction.date >= start_date
        )
    ).group_by(Category.id).all()
    
    # Топ категории
    top_categories = [
        {
            'name': cat.name,
            'color': cat.color,
            'amount': float(cat.total),
            'percentage': round((float(cat.total) / total_expenses * 100) if total_expenses > 0 else 0, 1)
        }
        for cat in expenses_by_category
    ]
    
    # Баланс счетов
    accounts_balance = db.session.query(func.sum(Account.balance)).filter(
        and_(
            Account.user_id == user_id,
            Account.is_active == True
        )
    ).scalar() or 0
    
    return jsonify({
        'period': period,
        'total_income': float(total_income),
        'total_expenses': float(total_expenses),
        'net_income': float(total_income - total_expenses),
        'accounts_balance': float(accounts_balance),
        'expenses_by_category': top_categories,
        'average_daily_expense': float(total_expenses / 30) if period == 'month' else float(total_expenses / 7),
        'transactions_count': Transaction.query.filter(
            and_(
                Transaction.user_id == user_id,
                Transaction.date >= start_date
            )
        ).count()
    })

@transactions_bp.route('/categories', methods=['GET'])
def get_categories():
    """Получить список категорий"""
    transaction_type = request.args.get('type')  # 'income' or 'expense'
    
    query = Category.query
    if transaction_type:
        query = query.filter_by(type=transaction_type)
    
    categories = query.all()
    return jsonify([cat.to_dict() for cat in categories])

@transactions_bp.route('/accounts', methods=['GET'])
def get_accounts():
    """Получить список счетов пользователя"""
    user_id = request.args.get('user_id', 1, type=int)
    
    accounts = Account.query.filter_by(user_id=user_id, is_active=True).all()
    return jsonify([acc.to_dict() for acc in accounts])

