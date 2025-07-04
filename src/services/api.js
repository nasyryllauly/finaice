// API Service для Budget OK AI
const API_BASE_URL = 'http://localhost:5003/api';

class APIService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Транзакции
  async getTransactions(userId = 1) {
    return this.request(`/transactions?user_id=${userId}`);
  }

  async createTransaction(transactionData) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  // Категории
  async getCategories() {
    return this.request('/categories');
  }

  // Аналитика
  async getAnalyticsSummary(userId = 1) {
    return this.request(`/analytics/summary?user_id=${userId}`);
  }

  // ИИ
  async getAIInsights(userId = 1) {
    return this.request(`/ai/insights?user_id=${userId}`);
  }

  async sendAIMessage(message, userId = 1) {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, user_id: userId }),
    });
  }
}

export default new APIService();

