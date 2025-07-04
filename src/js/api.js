// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5001' 
    : 'https://0vhlizcpwwwe.manus.space';

// API Client Class
class FinAiceAPI {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.headers,
            ...options
        };

        try {
            console.log(`API Request: ${config.method || 'GET'} ${url}`);
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`API Response:`, data);
            return data;
        } catch (error) {
            console.error(`API Error for ${endpoint}:`, error);
            throw error;
        }
    }

    // GET request
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // POST request
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Transactions API
    async getTransactions(filters = {}) {
        const params = new URLSearchParams();
        
        if (filters.type) params.append('type', filters.type);
        if (filters.category_id) params.append('category_id', filters.category_id);
        if (filters.account_id) params.append('account_id', filters.account_id);
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        if (filters.limit) params.append('limit', filters.limit);
        if (filters.offset) params.append('offset', filters.offset);

        const queryString = params.toString();
        const endpoint = queryString ? `/api/transactions?${queryString}` : '/api/transactions';
        
        return this.get(endpoint);
    }

    async getTransaction(id) {
        return this.get(`/api/transactions/${id}`);
    }

    async createTransaction(transactionData) {
        return this.post('/api/transactions', transactionData);
    }

    async updateTransaction(id, transactionData) {
        return this.put(`/api/transactions/${id}`, transactionData);
    }

    async deleteTransaction(id) {
        return this.delete(`/api/transactions/${id}`);
    }

    // Categories API
    async getCategories(type = null) {
        const endpoint = type ? `/api/categories?type=${type}` : '/api/categories';
        return this.get(endpoint);
    }

    async getCategory(id) {
        return this.get(`/api/categories/${id}`);
    }

    // Accounts API
    async getAccounts() {
        return this.get('/api/accounts');
    }

    async getAccount(id) {
        return this.get(`/api/accounts/${id}`);
    }

    async createAccount(accountData) {
        return this.post('/api/accounts', accountData);
    }

    async updateAccount(id, accountData) {
        return this.put(`/api/accounts/${id}`, accountData);
    }

    // Analytics API
    async getAnalytics(period = 'month') {
        return this.get(`/api/analytics/summary?period=${period}`);
    }

    async getCategoryAnalytics(period = 'month') {
        return this.get(`/api/analytics/summary?period=${period}`);
    }

    async getMonthlyTrends() {
        return this.get('/api/analytics/trends');
    }

    // AI Assistant API
    async chatWithAI(message) {
        return this.post('/api/ai/chat', { message });
    }

    async getAIInsights() {
        return this.get('/api/ai/insights');
    }

    async getAIRecommendations() {
        return this.get('/api/ai/recommendations');
    }

    // Budgets API
    async getBudgets() {
        return this.get('/api/budgets');
    }

    async createBudget(budgetData) {
        return this.post('/api/budgets', budgetData);
    }

    async updateBudget(id, budgetData) {
        return this.put(`/api/budgets/${id}`, budgetData);
    }

    async deleteBudget(id) {
        return this.delete(`/api/budgets/${id}`);
    }

    // Dashboard data
    async getDashboardData() {
        try {
            const [transactions, accounts, categories, analytics, aiInsights] = await Promise.all([
                this.getTransactions({ limit: 10 }),
                this.getAccounts(),
                this.getCategories(),
                this.getAnalytics(),
                this.getAIInsights().catch(() => ({ insights: [] })) // Fallback if AI fails
            ]);

            return {
                transactions: transactions.transactions || [],
                accounts: accounts.accounts || [],
                categories: categories.categories || [],
                analytics: analytics,
                aiInsights: aiInsights.insights || []
            };
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    }
}

// Utility functions
const formatCurrency = (amount, currency = '₽') => {
    const num = parseFloat(amount) || 0;
    return `${currency} ${num.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
        return 'Сегодня';
    } else if (d.toDateString() === yesterday.toDateString()) {
        return 'Вчера';
    } else {
        return d.toLocaleDateString('ru-RU', { 
            day: 'numeric', 
            month: 'short' 
        });
    }
};

const formatDateTime = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getCategoryIcon = (categoryName) => {
    const icons = {
        'Продукты': '🛒',
        'Транспорт': '🚗',
        'Развлечения': '🎬',
        'Здоровье': '💊',
        'Образование': '📚',
        'Коммунальные услуги': '🏠',
        'Одежда': '👕',
        'Рестораны': '🍽️',
        'Другое': '📦',
        'Зарплата': '💰',
        'Фриланс': '💻',
        'Инвестиции': '📈',
        'Подарки': '🎁',
        'Бонусы': '🎯'
    };
    return icons[categoryName] || '📦';
};

const getCategoryColor = (categoryName) => {
    const colors = {
        'Продукты': '#FF6B6B',
        'Транспорт': '#4ECDC4',
        'Развлечения': '#45B7D1',
        'Здоровье': '#96CEB4',
        'Образование': '#FFEAA7',
        'Коммунальные услуги': '#DDA0DD',
        'Одежда': '#FFB347',
        'Рестораны': '#FD79A8',
        'Другое': '#C0C0C0',
        'Зарплата': '#00D4AA',
        'Фриланс': '#6C5CE7',
        'Инвестиции': '#A29BFE',
        'Подарки': '#FD79A8',
        'Бонусы': '#FDCB6E'
    };
    return colors[categoryName] || '#C0C0C0';
};

const getAccountIcon = (accountType) => {
    const icons = {
        'cash': '💵',
        'card': '💳',
        'bank': '🏦',
        'crypto': '₿',
        'savings': '🏛️'
    };
    return icons[accountType] || '💳';
};

// Error handling
const handleAPIError = (error, context = '') => {
    console.error(`API Error ${context}:`, error);
    
    let message = 'Произошла ошибка при загрузке данных';
    
    if (error.message.includes('Failed to fetch')) {
        message = 'Нет соединения с сервером';
    } else if (error.message.includes('404')) {
        message = 'Данные не найдены';
    } else if (error.message.includes('500')) {
        message = 'Ошибка сервера';
    }
    
    return message;
};

// Loading state management
const showLoading = () => {
    const modal = document.getElementById('loadingModal');
    if (modal) {
        modal.classList.add('active');
    }
};

const hideLoading = () => {
    const modal = document.getElementById('loadingModal');
    if (modal) {
        modal.classList.remove('active');
    }
};

// Export API instance
const api = new FinAiceAPI();

// Make API available globally
window.FinAiceAPI = FinAiceAPI;
window.api = api;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.getCategoryIcon = getCategoryIcon;
window.getCategoryColor = getCategoryColor;
window.getAccountIcon = getAccountIcon;
window.handleAPIError = handleAPIError;
window.showLoading = showLoading;
window.hideLoading = hideLoading;

