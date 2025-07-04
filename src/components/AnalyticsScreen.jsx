import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts'

const AnalyticsScreen = () => {
  const expenseData = [
    { name: 'Продукты', value: 3400, color: '#3B82F6' },
    { name: 'Транспорт', value: 1200, color: '#8B5CF6' },
    { name: 'Развлечения', value: 800, color: '#EF4444' },
    { name: 'Кафе', value: 600, color: '#F97316' },
    { name: 'Здоровье', value: 1500, color: '#EC4899' },
  ]

  const monthlyData = [
    { month: 'Янв', income: 45000, expense: 12000 },
    { month: 'Фев', income: 47000, expense: 13500 },
    { month: 'Мар', income: 45000, expense: 12970 },
  ]

  const categories = [
    { name: 'Продукты', amount: 3400, percentage: 44, color: 'bg-blue-500' },
    { name: 'Здоровье', amount: 1500, percentage: 19, color: 'bg-pink-500' },
    { name: 'Транспорт', amount: 1200, percentage: 15, color: 'bg-purple-500' },
    { name: 'Развлечения', amount: 800, percentage: 10, color: 'bg-red-500' },
    { name: 'Кафе', amount: 600, percentage: 8, color: 'bg-orange-500' },
  ]

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* Заголовок */}
      <div className="text-center mb-6 pt-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Анализ</h1>
        <p className="text-gray-600">Март 2025</p>
      </div>

      {/* Общая статистика */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-xl">
          <p className="text-2xl font-bold text-green-500">₽ 45K</p>
          <p className="text-sm text-gray-600">Доходы</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-xl">
          <p className="text-2xl font-bold text-red-500">₽ 13K</p>
          <p className="text-sm text-gray-600">Расходы</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-xl">
          <p className="text-2xl font-bold text-blue-500">₽ 32K</p>
          <p className="text-sm text-gray-600">Остаток</p>
        </div>
      </div>

      {/* Круговая диаграмма расходов */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Распределение расходов</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Детализация по категориям в стиле Budget OK */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">По категориям</h3>
        <div className="space-y-3">
          {categories.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-4 h-4 ${category.color} rounded-full mr-3`}></div>
                <span className="text-gray-700">{category.name}</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-800">₽ {category.amount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{category.percentage}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ИИ инсайты */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 text-white">
        <h3 className="font-semibold mb-2">🤖 ИИ Анализ</h3>
        <p className="text-sm mb-2">• Расходы на продукты выросли на 15%</p>
        <p className="text-sm mb-2">• Рекомендуем сократить траты на развлечения</p>
        <p className="text-sm">• Вы можете сэкономить ₽ 2,000 в следующем месяце</p>
      </div>
    </div>
  )
}

export default AnalyticsScreen

