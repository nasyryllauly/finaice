import { User, Bell, Shield, HelpCircle, LogOut, ChevronRight } from 'lucide-react'

const SettingsScreen = () => {
  const settingsItems = [
    { icon: User, title: 'Профиль', subtitle: 'Личная информация', color: 'text-blue-500' },
    { icon: Bell, title: 'Уведомления', subtitle: 'Настройки оповещений', color: 'text-green-500' },
    { icon: Shield, title: 'Безопасность', subtitle: 'Пароль и защита', color: 'text-red-500' },
    { icon: HelpCircle, title: 'Помощь', subtitle: 'FAQ и поддержка', color: 'text-purple-500' },
  ]

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* Заголовок */}
      <div className="text-center mb-8 pt-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Настройки</h1>
        <p className="text-gray-600">Управление приложением</p>
      </div>

      {/* Профиль пользователя */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
            <User size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Пользователь</h3>
            <p className="text-red-100">user@example.com</p>
          </div>
        </div>
      </div>

      {/* Список настроек */}
      <div className="space-y-3 mb-6">
        {settingsItems.map((item, index) => (
          <button
            key={index}
            className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center">
              <div className={`w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3`}>
                <item.icon size={20} className={item.color} />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800">{item.title}</p>
                <p className="text-sm text-gray-500">{item.subtitle}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        ))}
      </div>

      {/* ИИ статистика */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">🤖 ИИ Статистика</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">127</p>
            <p className="text-sm text-blue-600">Советов дано</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">₽ 8,500</p>
            <p className="text-sm text-green-600">Сэкономлено</p>
          </div>
        </div>
      </div>

      {/* Выход */}
      <button className="w-full flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 hover:bg-red-100 transition-colors">
        <LogOut size={20} className="mr-2" />
        <span className="font-medium">Выйти из аккаунта</span>
      </button>

      {/* Версия */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">Budget OK AI v1.0.0</p>
        <p className="text-xs text-gray-400">Создано с ❤️ для умного управления финансами</p>
      </div>
    </div>
  )
}

export default SettingsScreen

