from flask import Blueprint, request, jsonify
from src.models.user import db, User
from datetime import datetime

user_bp = Blueprint('user', __name__)

@user_bp.route('/api/user/profile', methods=['GET'])
def get_user_profile():
    """Получить профиль пользователя"""
    try:
        # Для демо используем пользователя с ID 1
        user = User.query.get(1)
        if not user:
            # Создаем демо пользователя если его нет
            user = User.create_default_user()
            db.session.add(user)
            db.session.commit()
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@user_bp.route('/api/user/profile', methods=['PUT'])
def update_user_profile():
    """Обновить профиль пользователя"""
    try:
        data = request.get_json()
        
        # Для демо используем пользователя с ID 1
        user = User.query.get(1)
        if not user:
            return jsonify({
                'success': False,
                'error': 'Пользователь не найден'
            }), 404
        
        # Обновляем поля
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data:
            user.email = data['email']
        if 'phone' in data:
            user.phone = data['phone']
        if 'currency' in data:
            user.currency = data['currency']
        if 'timezone' in data:
            user.timezone = data['timezone']
        if 'language' in data:
            user.language = data['language']
        if 'notifications_enabled' in data:
            user.notifications_enabled = data['notifications_enabled']
        if 'email_notifications' in data:
            user.email_notifications = data['email_notifications']
        if 'push_notifications' in data:
            user.push_notifications = data['push_notifications']
        if 'balance_visible' in data:
            user.balance_visible = data['balance_visible']
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@user_bp.route('/api/user/settings', methods=['GET'])
def get_user_settings():
    """Получить настройки пользователя"""
    try:
        user = User.query.get(1)
        if not user:
            return jsonify({
                'success': False,
                'error': 'Пользователь не найден'
            }), 404
        
        settings = {
            'currency': user.currency,
            'timezone': user.timezone,
            'language': user.language,
            'notifications_enabled': user.notifications_enabled,
            'email_notifications': user.email_notifications,
            'push_notifications': user.push_notifications,
            'balance_visible': user.balance_visible
        }
        
        return jsonify({
            'success': True,
            'settings': settings
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@user_bp.route('/api/user/settings', methods=['PUT'])
def update_user_settings():
    """Обновить настройки пользователя"""
    try:
        data = request.get_json()
        
        user = User.query.get(1)
        if not user:
            return jsonify({
                'success': False,
                'error': 'Пользователь не найден'
            }), 404
        
        # Обновляем настройки
        if 'currency' in data:
            user.currency = data['currency']
        if 'timezone' in data:
            user.timezone = data['timezone']
        if 'language' in data:
            user.language = data['language']
        if 'notifications_enabled' in data:
            user.notifications_enabled = data['notifications_enabled']
        if 'email_notifications' in data:
            user.email_notifications = data['email_notifications']
        if 'push_notifications' in data:
            user.push_notifications = data['push_notifications']
        if 'balance_visible' in data:
            user.balance_visible = data['balance_visible']
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Настройки обновлены'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

