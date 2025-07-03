from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from sqlalchemy import func, and_, desc
import json
import random
from src.models.user import db
from src.models.transaction import Transaction, Category, Account, Budget, AIInsight

ai_bp = Blueprint('ai', __name__)

class FinAiceAI:
    """Улучшенный ИИ-ассистент для FinAice"""
    
    def __init__(self):
        self.responses = {
            'greeting': [
                "Привет! Я ваш персональный финансовый ассистент FinAice. Как дела с бюджетом?",
                "Добро пожаловать в FinAice! Готов помочь вам с управлением финансами.",
                "Здравствуйте! Давайте разберем ваши финансы и найдем способы сэкономить."
            ],
            'spending_analysis': [
                "Анализирую ваши расходы за последний месяц...",
                "Изучаю паттерны ваших трат...",
                "Проверяю, как распределяются ваши расходы..."
            ],
            'budget_tips': [
                "Вот несколько советов по оптимизации бюджета:",
                "Рекомендую обратить внимание на следующие моменты:",
                "Для улучшения финансового состояния предлагаю:"
            ]
        }
    
    def analyze_spending_patterns(self, user_id, period_days=30):
        """Анализ паттернов трат пользователя"""
        start_date = datetime.utcnow() - timedelta(days=period_days)
        
        # Получаем транзакции за период
        transactions = Transaction.query.filter(
            and_(
                Transaction.user_id == user_id,
                Transaction.type == 'expense',
                Transaction.date >= start_date
            )
        ).all()
        
        if not transactions:
            return {
                'total_spent': 0,
                'categories': [],
                'insights': ["У вас пока нет расходов за этот период."]
            }
        
        # Группируем по категориям
        category_spending = {}
        total_spent = 0
        
        for transaction in transactions:
            total_spent += transaction.amount
            cat_name = transaction.category.name if transaction.category else 'Прочее'
            if cat_name not in category_spending:
                category_spending[cat_name] = {
                    'amount': 0,
                    'count': 0,
                    'color': transaction.category.color if transaction.category else '#64748B'
                }
            category_spending[cat_name]['amount'] += transaction.amount
            category_spending[cat_name]['count'] += 1
        
        # Сортируем категории по сумме
        sorted_categories = sorted(
            category_spending.items(),
            key=lambda x: x[1]['amount'],
            reverse=True
        )
        
        # Формируем инсайты
        insights = self._generate_spending_insights(sorted_categories, total_spent, period_days)
        
        return {
            'total_spent': total_spent,
            'average_daily': total_spent / period_days,
            'categories': [
                {
                    'name': cat[0],
                    'amount': cat[1]['amount'],
                    'percentage': round((cat[1]['amount'] / total_spent * 100), 1),
                    'count': cat[1]['count'],
                    'color': cat[1]['color']
                }
                for cat in sorted_categories[:5]  # Топ 5 категорий
            ],
            'insights': insights
        }
    
    def _generate_spending_insights(self, categories, total_spent, period_days):
        """Генерация инсайтов на основе анализа трат"""
        insights = []
        
        if not categories:
            return ["Недостаточно данных для анализа."]
        
        # Анализ топ категории
        top_category = categories[0]
        top_percentage = (top_category[1]['amount'] / total_spent * 100)
        
        if top_percentage > 40:
            insights.append(
                f"Ваша основная категория трат - '{top_category[0]}' ({top_percentage:.1f}%). "
                f"Рекомендую пересмотреть расходы в этой области."
            )
        elif top_percentage > 25:
            insights.append(
                f"Больше всего вы тратите на '{top_category[0]}' ({top_percentage:.1f}%). "
                f"Это нормальное распределение."
            )
        
        # Анализ среднего чека
        avg_daily = total_spent / period_days
        if avg_daily > 2000:
            insights.append(
                f"Ваши ежедневные траты составляют {avg_daily:.0f}₽. "
                f"Попробуйте сократить на 10-15% для улучшения накоплений."
            )
        elif avg_daily < 500:
            insights.append(
                f"Отличный контроль расходов! Ваши ежедневные траты всего {avg_daily:.0f}₽."
            )
        
        # Анализ количества категорий
        if len(categories) > 8:
            insights.append(
                "У вас много категорий трат. Рекомендую объединить похожие для лучшего контроля."
            )
        
        # Рекомендации по экономии
        if len(categories) >= 2:
            second_category = categories[1]
            insights.append(
                f"Попробуйте сократить расходы на '{second_category[0]}' на 15% - "
                f"это сэкономит {second_category[1]['amount'] * 0.15:.0f}₽ в месяц."
            )
        
        return insights
    
    def generate_budget_recommendations(self, user_id):
        """Генерация рекомендаций по бюджету"""
        analysis = self.analyze_spending_patterns(user_id)
        
        recommendations = []
        
        # Рекомендации на основе анализа
        if analysis['total_spent'] > 0:
            recommendations.append(
                f"На основе ваших трат ({analysis['total_spent']:.0f}₽ за месяц) "
                f"рекомендую бюджет {analysis['total_spent'] * 1.1:.0f}₽ с запасом 10%."
            )
            
            # Рекомендации по категориям
            for cat in analysis['categories'][:3]:
                if cat['percentage'] > 30:
                    recommendations.append(
                        f"Категория '{cat['name']}' занимает {cat['percentage']}% бюджета. "
                        f"Рекомендую установить лимит {cat['amount'] * 0.9:.0f}₽."
                    )
        
        # Общие советы
        general_tips = [
            "Используйте правило 50/30/20: 50% на необходимое, 30% на желания, 20% на накопления.",
            "Ведите учет всех трат, даже мелких - они складываются в значительные суммы.",
            "Установите автоматические переводы на накопительный счет.",
            "Пересматривайте подписки и регулярные платежи каждые 3 месяца.",
            "Планируйте крупные покупки заранее и откладывайте на них постепенно."
        ]
        
        recommendations.extend(random.sample(general_tips, 2))
        
        return recommendations
    
    def predict_future_spending(self, user_id, days_ahead=30):
        """Прогноз будущих трат на основе истории"""
        # Анализируем последние 60 дней для прогноза
        analysis = self.analyze_spending_patterns(user_id, 60)
        
        if analysis['total_spent'] == 0:
            return {
                'predicted_amount': 0,
                'confidence': 'low',
                'recommendations': ["Недостаточно данных для прогноза."]
            }
        
        # Простой прогноз на основе среднего
        predicted_amount = analysis['average_daily'] * days_ahead
        
        # Определяем уверенность
        confidence = 'high' if len(analysis['categories']) >= 3 else 'medium'
        
        recommendations = [
            f"Прогнозируемые расходы на {days_ahead} дней: {predicted_amount:.0f}₽",
            f"Это примерно {predicted_amount/days_ahead:.0f}₽ в день",
        ]
        
        # Добавляем рекомендации по оптимизации
        if predicted_amount > analysis['total_spent'] * 0.5:
            recommendations.append(
                "Рекомендую создать резерв на непредвиденные расходы."
            )
        
        return {
            'predicted_amount': predicted_amount,
            'confidence': confidence,
            'recommendations': recommendations
        }

# Инициализируем ИИ-ассистента
ai_assistant = FinAiceAI()

@ai_bp.route('/ai/chat', methods=['POST'])
def chat_with_ai():
    """Чат с ИИ-ассистентом"""
    data = request.get_json()
    user_id = data.get('user_id', 1)
    message = data.get('message', '').lower().strip()
    
    # Определяем тип запроса
    if any(word in message for word in ['привет', 'hello', 'здравствуй', 'добро пожаловать']):
        response = random.choice(ai_assistant.responses['greeting'])
        
    elif any(word in message for word in ['расход', 'трат', 'анализ', 'статистика']):
        analysis = ai_assistant.analyze_spending_patterns(user_id)
        
        if analysis['total_spent'] > 0:
            response = f"За последний месяц вы потратили {analysis['total_spent']:.0f}₽. "
            
            if analysis['categories']:
                top_cat = analysis['categories'][0]
                response += f"Больше всего на '{top_cat['name']}' - {top_cat['percentage']}% ({top_cat['amount']:.0f}₽). "
            
            if analysis['insights']:
                response += "\n\n" + "\n".join(analysis['insights'][:2])
        else:
            response = "У вас пока нет записей о расходах. Начните добавлять транзакции для получения аналитики!"
            
    elif any(word in message for word in ['совет', 'рекомендаци', 'бюджет', 'экономи']):
        recommendations = ai_assistant.generate_budget_recommendations(user_id)
        response = random.choice(ai_assistant.responses['budget_tips']) + "\n\n"
        response += "\n".join(recommendations[:3])
        
    elif any(word in message for word in ['прогноз', 'будущ', 'планир']):
        prediction = ai_assistant.predict_future_spending(user_id)
        response = "Прогноз ваших расходов:\n\n"
        response += "\n".join(prediction['recommendations'])
        
    elif any(word in message for word in ['баланс', 'счет', 'деньги']):
        # Получаем баланс счетов
        total_balance = db.session.query(func.sum(Account.balance)).filter(
            and_(Account.user_id == user_id, Account.is_active == True)
        ).scalar() or 0
        
        response = f"Общий баланс ваших счетов: {total_balance:.0f}₽"
        
        if total_balance > 0:
            analysis = ai_assistant.analyze_spending_patterns(user_id)
            if analysis['average_daily'] > 0:
                days_left = total_balance / analysis['average_daily']
                response += f"\nПри текущем уровне трат денег хватит на {days_left:.0f} дней."
        
    else:
        # Общий ответ
        response = ("Я могу помочь вам с:\n"
                   "• Анализом расходов и доходов\n"
                   "• Рекомендациями по бюджету\n"
                   "• Прогнозом будущих трат\n"
                   "• Советами по экономии\n\n"
                   "Просто спросите меня о ваших финансах!")
    
    return jsonify({
        'response': response,
        'timestamp': datetime.utcnow().isoformat(),
        'user_id': user_id
    })

@ai_bp.route('/ai/insights', methods=['GET'])
def get_ai_insights():
    """Получить ИИ-инсайты для пользователя"""
    user_id = request.args.get('user_id', 1, type=int)
    
    # Получаем существующие инсайты
    insights = AIInsight.query.filter_by(user_id=user_id).filter(
        AIInsight.expires_at > datetime.utcnow()
    ).order_by(desc(AIInsight.created_at)).limit(5).all()
    
    # Если инсайтов мало, генерируем новые
    if len(insights) < 3:
        new_insights = generate_fresh_insights(user_id)
        insights.extend(new_insights)
    
    return jsonify([insight.to_dict() for insight in insights])

def generate_fresh_insights(user_id):
    """Генерация новых ИИ-инсайтов"""
    analysis = ai_assistant.analyze_spending_patterns(user_id)
    new_insights = []
    
    if analysis['total_spent'] > 0:
        # Инсайт о топ категории
        if analysis['categories']:
            top_cat = analysis['categories'][0]
            if top_cat['percentage'] > 35:
                insight = AIInsight(
                    user_id=user_id,
                    type='spending_alert',
                    title='Высокие расходы в категории',
                    message=f"Категория '{top_cat['name']}' занимает {top_cat['percentage']}% вашего бюджета. Рекомендую пересмотреть траты.",
                    priority='medium',
                    expires_at=datetime.utcnow() + timedelta(days=7)
                )
                db.session.add(insight)
                new_insights.append(insight)
        
        # Инсайт о накоплениях
        if analysis['average_daily'] > 1000:
            insight = AIInsight(
                user_id=user_id,
                type='saving_tip',
                title='Возможность для накоплений',
                message=f"При ваших тратах {analysis['average_daily']:.0f}₽/день, сокращение на 10% даст {analysis['average_daily']*0.1*30:.0f}₽ накоплений в месяц.",
                priority='low',
                expires_at=datetime.utcnow() + timedelta(days=14)
            )
            db.session.add(insight)
            new_insights.append(insight)
    
    try:
        db.session.commit()
    except:
        db.session.rollback()
    
    return new_insights

@ai_bp.route('/ai/suggest-category', methods=['POST'])
def suggest_category():
    """ИИ-предложение категории для транзакции"""
    data = request.get_json()
    description = data.get('description', '').lower()
    amount = data.get('amount', 0)
    
    # Простая логика предложения категорий на основе ключевых слов
    category_keywords = {
        'Продукты': ['магазин', 'супермаркет', 'продукт', 'еда', 'пятерочка', 'магнит', 'ашан'],
        'Транспорт': ['такси', 'метро', 'автобус', 'бензин', 'азс', 'uber', 'яндекс'],
        'Рестораны': ['ресторан', 'кафе', 'макдональдс', 'kfc', 'доставка', 'пицца'],
        'Развлечения': ['кино', 'театр', 'концерт', 'игры', 'развлечения'],
        'Здоровье': ['аптека', 'врач', 'больница', 'лекарство', 'медицина'],
        'Покупки': ['одежда', 'обувь', 'техника', 'мебель', 'подарок'],
        'Коммунальные': ['электричество', 'газ', 'вода', 'интернет', 'телефон']
    }
    
    suggested_category = 'Прочее'
    confidence = 0.3
    
    for category, keywords in category_keywords.items():
        for keyword in keywords:
            if keyword in description:
                suggested_category = category
                confidence = 0.8
                break
        if confidence > 0.5:
            break
    
    # Дополнительная логика на основе суммы
    if amount > 10000 and suggested_category == 'Прочее':
        suggested_category = 'Покупки'
        confidence = 0.6
    elif amount < 500 and any(word in description for word in ['кофе', 'снек', 'мелочь']):
        suggested_category = 'Рестораны'
        confidence = 0.7
    
    return jsonify({
        'suggested_category': suggested_category,
        'confidence': confidence,
        'explanation': f"Предложено на основе описания '{description}' и суммы {amount}₽"
    })

