// FinAice App Main JavaScript File

class FinAiceApp {
    constructor() {
        this.currentScreen = 'home';
        this.currentTransactionType = 'expense';
        this.selectedCategory = null;
        this.dashboardData = null;
        this.balanceVisible = true;
        
        this.init();
    }

    async init() {
        console.log('Initializing FinAice App...');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load initial data
        await this.loadDashboardData();
        
        // Set current date for transaction form
        this.setCurrentDate();
        
        console.log('FinAice App initialized successfully');
    }

    setupEventListeners() {
        // Navigation
        this.setupNavigation();
        
        // Balance toggle
        this.setupBalanceToggle();
        
        // Quick actions
        this.setupQuickActions();
        
        // Transaction form
        this.setupTransactionForm();
        
        // AI Chat
        this.setupAIChat();
        
        // Filters
        this.setupFilters();
        
        // Back buttons
        this.setupBackButtons();
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const screen = item.dataset.screen;
                this.switchScreen(screen);
            });
        });
    }

    setupBalanceToggle() {
        const balanceToggle = document.getElementById('balanceToggle');
        if (balanceToggle) {
            balanceToggle.addEventListener('click', () => {
                this.toggleBalanceVisibility();
            });
        }
    }

    setupQuickActions() {
        const addIncomeBtn = document.getElementById('addIncomeBtn');
        const addExpenseBtn = document.getElementById('addExpenseBtn');
        const aiAssistantBtn = document.getElementById('aiAssistantBtn');

        if (addIncomeBtn) {
            addIncomeBtn.addEventListener('click', () => {
                this.openAddTransaction('income');
            });
        }

        if (addExpenseBtn) {
            addExpenseBtn.addEventListener('click', () => {
                this.openAddTransaction('expense');
            });
        }

        if (aiAssistantBtn) {
            aiAssistantBtn.addEventListener('click', () => {
                this.switchScreen('ai');
            });
        }

        // View all transactions
        const viewAllBtn = document.getElementById('viewAllTransactionsBtn');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                this.switchScreen('transactions');
            });
        }
    }

    setupTransactionForm() {
        // Transaction type tabs
        const typeTabs = document.querySelectorAll('.type-tab');
        typeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTransactionType(tab.dataset.type);
            });
        });

        // Category selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.category-selector-item')) {
                this.selectCategory(e.target.closest('.category-selector-item'));
            }
        });

        // Save transaction
        const saveBtn = document.getElementById('saveTransactionBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveTransaction();
            });
        }

        // Form validation
        const amountInput = document.getElementById('amountInput');
        if (amountInput) {
            amountInput.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                if (value < 0) {
                    e.target.value = Math.abs(value);
                }
            });
        }
    }

    setupAIChat() {
        const sendBtn = document.getElementById('sendBtn');
        const chatInput = document.getElementById('chatInput');

        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.sendAIMessage();
            });
        }

        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendAIMessage();
                }
            });
        }

        // Quick questions
        const quickQuestions = document.querySelectorAll('.quick-question');
        quickQuestions.forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.dataset.question;
                this.sendAIMessage(question);
            });
        });
    }

    setupFilters() {
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.filterTransactions(tab.dataset.filter);
            });
        });
    }

    setupBackButtons() {
        const backButtons = document.querySelectorAll('.back-btn');
        backButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchScreen('home');
            });
        });
    }

    // Screen Management
    switchScreen(screenName) {
        // Hide all screens
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.remove('active'));

        // Show target screen
        const targetScreen = document.getElementById(`${screenName}Screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }

        // Update navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.screen === screenName) {
                item.classList.add('active');
            }
        });

        this.currentScreen = screenName;

        // Load screen-specific data
        this.loadScreenData(screenName);
    }

    async loadScreenData(screenName) {
        switch (screenName) {
            case 'transactions':
                await this.loadAllTransactions();
                break;
            case 'analytics':
                await this.loadAnalytics();
                break;
            case 'ai':
                await this.loadAIInsights();
                break;
        }
    }

    // Data Loading
    async loadDashboardData() {
        try {
            showLoading();
            
            console.log('Loading dashboard data...');
            this.dashboardData = await api.getDashboardData();
            
            this.renderDashboard();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Ошибка загрузки данных');
        } finally {
            hideLoading();
        }
    }

    renderDashboard() {
        if (!this.dashboardData) return;

        const { transactions, accounts, categories, analytics } = this.dashboardData;

        // Render balance
        this.renderBalance(analytics);
        
        // Render categories
        this.renderCategories(categories, analytics);
        
        // Render wallets
        this.renderWallets(accounts);
        
        // Render recent transactions
        this.renderRecentTransactions(transactions);
    }

    renderBalance(analytics) {
        const totalBalanceEl = document.getElementById('totalBalance');
        const balanceChangeEl = document.getElementById('balanceChange');

        if (totalBalanceEl && analytics) {
            const balance = analytics.total_income - analytics.total_expense;
            totalBalanceEl.textContent = this.balanceVisible 
                ? formatCurrency(balance) 
                : '₽ ••••••';
        }

        if (balanceChangeEl && analytics) {
            const change = analytics.monthly_change || 0;
            balanceChangeEl.textContent = `${change >= 0 ? '+' : ''}${formatCurrency(change)} за месяц`;
            balanceChangeEl.className = change >= 0 ? 'balance-change' : 'balance-change negative';
        }
    }

    renderCategories(categories, analytics) {
        const incomeCategories = categories.filter(cat => cat.type === 'income');
        const expenseCategories = categories.filter(cat => cat.type === 'expense');

        this.renderCategorySection('incomeCategories', incomeCategories, analytics.category_totals);
        this.renderCategorySection('expenseCategories', expenseCategories, analytics.category_totals);

        // Update section amounts
        const incomeAmount = incomeCategories.reduce((sum, cat) => {
            return sum + (analytics.category_totals[cat.id] || 0);
        }, 0);
        
        const expenseAmount = expenseCategories.reduce((sum, cat) => {
            return sum + (analytics.category_totals[cat.id] || 0);
        }, 0);

        const incomeAmountEl = document.getElementById('incomeAmount');
        const expenseAmountEl = document.getElementById('expenseAmount');

        if (incomeAmountEl) incomeAmountEl.textContent = formatCurrency(incomeAmount);
        if (expenseAmountEl) expenseAmountEl.textContent = formatCurrency(expenseAmount);
    }

    renderCategorySection(containerId, categories, categoryTotals) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = categories.map(category => {
            const amount = categoryTotals[category.id] || 0;
            const icon = getCategoryIcon(category.name);
            const color = getCategoryColor(category.name);

            return `
                <div class="category-item" data-category-id="${category.id}">
                    <div class="category-icon" style="background: ${color}">
                        ${icon}
                    </div>
                    <div class="category-name">${category.name}</div>
                    <div class="category-amount">${formatCurrency(amount)}</div>
                </div>
            `;
        }).join('');
    }

    renderWallets(accounts) {
        const container = document.getElementById('walletsList');
        if (!container) return;

        const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
        const walletsAmountEl = document.getElementById('walletsAmount');
        if (walletsAmountEl) {
            walletsAmountEl.textContent = formatCurrency(totalBalance);
        }

        container.innerHTML = accounts.map(account => {
            const icon = getAccountIcon(account.type);
            
            return `
                <div class="wallet-item" data-account-id="${account.id}">
                    <div class="wallet-info">
                        <div class="wallet-icon">${icon}</div>
                        <div class="wallet-name">${account.name}</div>
                    </div>
                    <div class="wallet-balance">${formatCurrency(account.balance)}</div>
                </div>
            `;
        }).join('');
    }

    renderRecentTransactions(transactions) {
        const container = document.getElementById('recentTransactionsList');
        if (!container) return;

        if (!transactions || transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <div class="empty-text">Нет транзакций</div>
                </div>
            `;
            return;
        }

        container.innerHTML = transactions.slice(0, 5).map(transaction => {
            return this.renderTransactionItem(transaction);
        }).join('');
    }

    renderTransactionItem(transaction) {
        const icon = getCategoryIcon(transaction.category_name);
        const color = getCategoryColor(transaction.category_name);
        const isIncome = transaction.type === 'income';
        const amountClass = isIncome ? 'income' : 'expense';
        const amountPrefix = isIncome ? '+' : '-';

        return `
            <div class="transaction-item" data-transaction-id="${transaction.id}">
                <div class="transaction-info">
                    <div class="transaction-icon" style="background: ${color}">
                        ${icon}
                    </div>
                    <div class="transaction-details">
                        <div class="transaction-description">${transaction.description}</div>
                        <div class="transaction-category">${transaction.category_name}</div>
                    </div>
                </div>
                <div class="transaction-amount">
                    <div class="transaction-value ${amountClass}">
                        ${amountPrefix}${formatCurrency(transaction.amount)}
                    </div>
                    <div class="transaction-date">${formatDate(transaction.date)}</div>
                </div>
            </div>
        `;
    }

    // Transaction Management
    openAddTransaction(type = 'expense') {
        this.currentTransactionType = type;
        this.selectedCategory = null;
        
        // Switch to add transaction screen
        this.switchScreen('addTransaction');
        
        // Update form
        this.updateTransactionForm();
        
        // Load categories for selection
        this.loadTransactionCategories();
        
        // Load accounts for selection
        this.loadTransactionAccounts();
    }

    switchTransactionType(type) {
        this.currentTransactionType = type;
        
        // Update tabs
        const tabs = document.querySelectorAll('.type-tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.type === type) {
                tab.classList.add('active');
            }
        });

        // Update title
        const title = document.getElementById('addTransactionTitle');
        if (title) {
            title.textContent = type === 'income' ? 'Добавить доход' : 'Добавить расход';
        }

        // Reload categories
        this.loadTransactionCategories();
    }

    async loadTransactionCategories() {
        try {
            const response = await api.getCategories(this.currentTransactionType);
            const categories = response.categories || [];
            
            this.renderCategorySelector(categories);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    renderCategorySelector(categories) {
        const container = document.getElementById('categoriesSelector');
        if (!container) return;

        container.innerHTML = categories.map(category => {
            const icon = getCategoryIcon(category.name);
            const color = getCategoryColor(category.name);

            return `
                <div class="category-selector-item" data-category-id="${category.id}">
                    <div class="category-selector-icon" style="background: ${color}">
                        ${icon}
                    </div>
                    <div class="category-selector-name">${category.name}</div>
                </div>
            `;
        }).join('');
    }

    async loadTransactionAccounts() {
        try {
            const response = await api.getAccounts();
            const accounts = response.accounts || [];
            
            const select = document.getElementById('accountSelect');
            if (select) {
                select.innerHTML = '<option value="">Выберите кошелек</option>' + 
                    accounts.map(account => {
                        const icon = getAccountIcon(account.type);
                        return `<option value="${account.id}">${icon} ${account.name} (${formatCurrency(account.balance)})</option>`;
                    }).join('');
            }
        } catch (error) {
            console.error('Error loading accounts:', error);
        }
    }

    selectCategory(categoryElement) {
        // Remove previous selection
        document.querySelectorAll('.category-selector-item').forEach(item => {
            item.classList.remove('selected');
        });

        // Add selection to clicked category
        categoryElement.classList.add('selected');
        this.selectedCategory = categoryElement.dataset.categoryId;
    }

    async saveTransaction() {
        const form = document.getElementById('transactionForm');
        if (!form) return;

        const formData = new FormData(form);
        const amount = document.getElementById('amountInput').value;
        const description = document.getElementById('descriptionInput').value;
        const date = document.getElementById('dateInput').value;
        const accountId = document.getElementById('accountSelect').value;

        // Validation
        if (!amount || !this.selectedCategory || !accountId || !date) {
            this.showError('Пожалуйста, заполните все обязательные поля');
            return;
        }

        const transactionData = {
            type: this.currentTransactionType,
            amount: parseFloat(amount),
            description: description || 'Без описания',
            category_id: parseInt(this.selectedCategory),
            account_id: parseInt(accountId),
            date: date
        };

        try {
            showLoading();
            
            await api.createTransaction(transactionData);
            
            // Show success message
            this.showSuccess('Транзакция успешно добавлена');
            
            // Reset form
            this.resetTransactionForm();
            
            // Reload dashboard data
            await this.loadDashboardData();
            
            // Return to home screen
            this.switchScreen('home');
            
        } catch (error) {
            console.error('Error saving transaction:', error);
            this.showError('Ошибка при сохранении транзакции');
        } finally {
            hideLoading();
        }
    }

    resetTransactionForm() {
        const form = document.getElementById('transactionForm');
        if (form) {
            form.reset();
        }

        // Clear category selection
        document.querySelectorAll('.category-selector-item').forEach(item => {
            item.classList.remove('selected');
        });
        this.selectedCategory = null;

        // Set current date
        this.setCurrentDate();
    }

    setCurrentDate() {
        const dateInput = document.getElementById('dateInput');
        if (dateInput) {
            const today = new Date();
            const dateString = today.toISOString().split('T')[0];
            dateInput.value = dateString;
        }
    }

    updateTransactionForm() {
        // Update type tabs
        const tabs = document.querySelectorAll('.type-tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.type === this.currentTransactionType) {
                tab.classList.add('active');
            }
        });

        // Update title
        const title = document.getElementById('addTransactionTitle');
        if (title) {
            title.textContent = this.currentTransactionType === 'income' ? 'Добавить доход' : 'Добавить расход';
        }
    }

    // AI Chat
    async sendAIMessage(message = null) {
        const chatInput = document.getElementById('chatInput');
        const chatMessages = document.getElementById('chatMessages');

        const messageText = message || (chatInput ? chatInput.value.trim() : '');
        if (!messageText) return;

        // Clear input
        if (chatInput && !message) {
            chatInput.value = '';
        }

        // Add user message to chat
        this.addChatMessage(messageText, 'user');

        try {
            // Send message to AI
            const response = await api.chatWithAI(messageText);
            
            // Add AI response to chat
            this.addChatMessage(response.response, 'ai');
            
        } catch (error) {
            console.error('Error sending AI message:', error);
            this.addChatMessage('Извините, произошла ошибка. Попробуйте позже.', 'ai');
        }

        // Scroll to bottom
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    addChatMessage(text, sender) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `${sender}-message`;
        
        const avatar = sender === 'ai' ? '🤖' : '👤';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-text">${text}</div>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
    }

    // Analytics
    async loadAnalytics() {
        try {
            showLoading();
            
            const [analytics, categoryAnalytics, aiInsights] = await Promise.all([
                api.getAnalytics(),
                api.getCategoryAnalytics(),
                api.getAIInsights().catch(() => ({ insights: [] }))
            ]);

            this.renderAnalytics(analytics, categoryAnalytics, aiInsights);
            
        } catch (error) {
            console.error('Error loading analytics:', error);
            this.showError('Ошибка загрузки аналитики');
        } finally {
            hideLoading();
        }
    }

    renderAnalytics(analytics, categoryAnalytics, aiInsights) {
        // Render metrics
        this.renderMetrics(analytics);
        
        // Render expense chart
        this.renderExpenseChart(categoryAnalytics);
        
        // Render top categories
        this.renderTopCategories(categoryAnalytics);
        
        // Render AI insights
        this.renderAIInsights(aiInsights.insights || []);
    }

    renderMetrics(analytics) {
        const totalIncomeEl = document.getElementById('totalIncomeMetric');
        const totalExpenseEl = document.getElementById('totalExpenseMetric');
        const savingsEl = document.getElementById('savingsMetric');

        if (totalIncomeEl) totalIncomeEl.textContent = formatCurrency(analytics.total_income);
        if (totalExpenseEl) totalExpenseEl.textContent = formatCurrency(analytics.total_expense);
        if (savingsEl) {
            const savings = analytics.total_income - analytics.total_expense;
            savingsEl.textContent = formatCurrency(savings);
        }
    }

    renderExpenseChart(categoryAnalytics) {
        const canvas = document.getElementById('expenseChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const categories = categoryAnalytics.categories || [];
        
        if (categories.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Нет данных для отображения', canvas.width / 2, canvas.height / 2);
            return;
        }

        // Simple pie chart
        const total = categories.reduce((sum, cat) => sum + cat.amount, 0);
        let currentAngle = -Math.PI / 2;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        categories.forEach((category, index) => {
            const sliceAngle = (category.amount / total) * 2 * Math.PI;
            const color = getCategoryColor(category.name);

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();

            currentAngle += sliceAngle;
        });
    }

    renderTopCategories(categoryAnalytics) {
        const container = document.getElementById('categoryStats');
        if (!container) return;

        const categories = categoryAnalytics.categories || [];
        const sortedCategories = categories.sort((a, b) => b.amount - a.amount).slice(0, 5);

        container.innerHTML = sortedCategories.map(category => {
            const icon = getCategoryIcon(category.name);
            const color = getCategoryColor(category.name);

            return `
                <div class="category-stat">
                    <div class="category-stat-info">
                        <div class="category-stat-icon" style="background: ${color}">
                            ${icon}
                        </div>
                        <div class="category-stat-name">${category.name}</div>
                    </div>
                    <div class="category-stat-amount">${formatCurrency(category.amount)}</div>
                </div>
            `;
        }).join('');
    }

    renderAIInsights(insights) {
        const container = document.getElementById('aiInsightsList');
        if (!container) return;

        if (insights.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🤖</div>
                    <div class="empty-text">ИИ анализирует ваши данные...</div>
                </div>
            `;
            return;
        }

        container.innerHTML = insights.map(insight => `
            <div class="insight-item">
                <div class="insight-header">
                    <div class="insight-icon">💡</div>
                    <div class="insight-title">${insight.title}</div>
                </div>
                <div class="insight-text">${insight.description}</div>
            </div>
        `).join('');
    }

    // Transactions Screen
    async loadAllTransactions() {
        try {
            showLoading();
            
            const response = await api.getTransactions({ limit: 100 });
            const transactions = response.transactions || [];
            
            this.renderAllTransactions(transactions);
            
        } catch (error) {
            console.error('Error loading transactions:', error);
            this.showError('Ошибка загрузки транзакций');
        } finally {
            hideLoading();
        }
    }

    renderAllTransactions(transactions) {
        const container = document.getElementById('allTransactionsList');
        if (!container) return;

        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <div class="empty-text">Нет транзакций</div>
                </div>
            `;
            return;
        }

        container.innerHTML = transactions.map(transaction => {
            return this.renderTransactionItem(transaction);
        }).join('');
    }

    filterTransactions(filter) {
        // Update filter tabs
        const tabs = document.querySelectorAll('.filter-tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.filter === filter) {
                tab.classList.add('active');
            }
        });

        // Apply filter
        const transactions = document.querySelectorAll('.transaction-item');
        transactions.forEach(item => {
            const transactionId = item.dataset.transactionId;
            // This is a simple implementation - in a real app, you'd filter based on actual data
            item.style.display = 'flex';
        });
    }

    // AI Insights
    async loadAIInsights() {
        try {
            const response = await api.getAIInsights();
            const insights = response.insights || [];
            
            // Add insights to the analytics screen if we're there
            if (this.currentScreen === 'ai') {
                this.renderAIInsights(insights);
            }
            
        } catch (error) {
            console.error('Error loading AI insights:', error);
        }
    }

    // Utility Methods
    toggleBalanceVisibility() {
        this.balanceVisible = !this.balanceVisible;
        
        const balanceToggle = document.getElementById('balanceToggle');
        const totalBalance = document.getElementById('totalBalance');
        
        if (balanceToggle) {
            balanceToggle.textContent = this.balanceVisible ? '👁️' : '🙈';
        }
        
        if (totalBalance && this.dashboardData) {
            const balance = this.dashboardData.analytics.total_income - this.dashboardData.analytics.total_expense;
            totalBalance.textContent = this.balanceVisible 
                ? formatCurrency(balance) 
                : '₽ ••••••';
        }
    }

    showError(message) {
        // Simple error display - in a real app, you'd use a proper notification system
        alert(message);
    }

    showSuccess(message) {
        // Simple success display - in a real app, you'd use a proper notification system
        alert(message);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.finAiceApp = new FinAiceApp();
});

// Make app available globally for debugging
window.FinAiceApp = FinAiceApp;

