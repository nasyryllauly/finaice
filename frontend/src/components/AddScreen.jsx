const AddScreen = () => {
  const categories = [
    { id: 1, name: 'Кошелёк', amount: '₽ 5,000', color: 'bg-orange-500', icon: '💳' },
    { id: 2, name: 'Транспорт', amount: '₽ 1,200', color: 'bg-purple-500', icon: '🚇' },
    { id: 3, name: 'Еда', amount: '₽ 2,100', color: 'bg-green-500', icon: '🍽️' },
    { id: 4, name: 'Продукты', amount: '₽ 3,400', color: 'bg-blue-500', icon: '🛒' },
    { id: 5, name: 'Развлечения', amount: '₽ 800', color: 'bg-red-500', icon: '🎬' },
    { id: 6, name: 'Здоровье', amount: '₽ 1,500', color: 'bg-pink-500', icon: '💊' },
    { id: 7, name: 'Образование', amount: '₽ 2,000', color: 'bg-indigo-500', icon: '📚' },
    { id: 8, name: 'Подарки', amount: '₽ 600', color: 'bg-yellow-500', icon: '🎁' },
  ]

  return (
    <div className="p-6 max-w-md mx-auto">
      {/* Заголовок в стиле Budget OK */}
      <div className="text-center mb-8 pt-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Просто</h1>
        <p className="text-gray-600">Потянуть монетку и указать сумму</p>
      </div>

      {/* Сетка категорий в стиле Budget OK */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-2xl transition-colors"
          >
            {/* Круглая иконка как в Budget OK */}
            <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center text-white text-2xl mb-3 shadow-lg hover:shadow-xl transition-shadow`}>
              {category.icon}
            </div>
            <p className="font-medium text-gray-800 text-center">{category.name}</p>
            <p className="text-sm text-gray-500 mt-1">{category.amount}</p>
          </button>
        ))}
      </div>

      {/* ИИ предложение */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-sm">🤖</span>
          </div>
          <div>
            <p className="text-blue-800 font-medium">ИИ предлагает: Кафе</p>
            <p className="text-blue-600 text-sm">(на основе геолокации)</p>
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-green-500 text-white py-3 px-6 rounded-xl font-medium hover:bg-green-600 transition-colors">
          + Доход
        </button>
        <button className="bg-red-500 text-white py-3 px-6 rounded-xl font-medium hover:bg-red-600 transition-colors">
          - Расход
        </button>
      </div>
    </div>
  )
}

export default AddScreen

