import { Brain } from 'lucide-react';
import { useState, useEffect } from 'react';
import APIService from '../services/api';

const HomeScreen = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [aiInsight, setAiInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Загружаем аналитику и транзакции параллельно
      const [analyticsData, transactionsData, insightsData] = await Promise.all([
        APIService.getAnalyticsSummary(),
        APIService.getTransactions(),
        APIService.getAIInsights()
      ]);

      setBalance(analyticsData.balance || 0);
      setTransactions(transactionsData.slice(0, 5)); // Показываем только последние 5
      
      if (insightsData && insightsData.length > 0) {
        setAiInsight(insightsData[0]); // Берем первый инсайт
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount, type) => {
    const sign = type === 'income' ? '+' : '';
    return `${sign}₽ ${Math.abs(amount).toLocaleString()}`;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Продукты': '🛒',
      'Транспорт': '🚇',
      'Еда': '🍽️',
      'Развлечения': '🎬',
      'Здоровье': '💊',
      'Кошелёк': '💳',
      'Зарплата': '💰',
      'Образование': '📚'
    };
    return icons[category] || '💰';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Продукты': 'bg-blue-500',
      'Транспорт': 'bg-purple-500',
      'Еда': 'bg-green-500',
      'Развлечения': 'bg-red-500',
      'Здоровье': 'bg-pink-500',
      'Кошелёк': 'bg-orange-500',
      'Зарплата': 'bg-green-500',
      'Образование': 'bg-indigo-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Баланс */}
      <div className="text-center">
        <div className="text-3xl font-bold text-red-500 mb-2">
          ₽ {balance.toLocaleString()}
        </div>
        <div className="text-gray-500">Общий баланс</div>
      </div>

      {/* ИИ совет */}
      {aiInsight && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={20} />
            <span className="font-medium">ИИ совет:</span>
          </div>
          <div className="text-sm">{aiInsight.message}</div>
        </div>
      )}

      {/* Список транзакций */}
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${getCategoryColor(transaction.category)} rounded-full flex items-center justify-center text-white text-lg`}>
                {getCategoryIcon(transaction.category)}
              </div>
              <div>
                <div className="font-medium">{transaction.category}</div>
                <div className="text-sm text-gray-500">
                  {transaction.description || 'Без описания'}
                </div>
              </div>
            </div>
            <div className={`font-bold ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
              {formatAmount(transaction.amount, transaction.type)}
            </div>
          </div>
        ))}
      </div>

      {transactions.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          Нет транзакций
        </div>
      )}
    </div>
  );
};

export default HomeScreen;

