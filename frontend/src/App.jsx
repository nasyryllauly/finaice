import { useState } from 'react'
import { Home, Plus, BarChart3, Brain, Settings } from 'lucide-react'
import './App.css'

// Компоненты экранов
import HomeScreen from './components/HomeScreen'
import AddScreen from './components/AddScreen'
import AnalyticsScreen from './components/AnalyticsScreen'
import AIScreen from './components/AIScreen'
import SettingsScreen from './components/SettingsScreen'

function App() {
  const [activeTab, setActiveTab] = useState('home')

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />
      case 'add':
        return <AddScreen />
      case 'analytics':
        return <AnalyticsScreen />
      case 'ai':
        return <AIScreen />
      case 'settings':
        return <SettingsScreen />
      default:
        return <HomeScreen />
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Основной контент */}
      <div className="pb-20">
        {renderScreen()}
      </div>

      {/* Нижняя навигация в стиле Budget OK */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center p-2 ${
              activeTab === 'home' ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            <Home size={24} />
            <span className="text-xs mt-1">Главная</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center p-2 ${
              activeTab === 'analytics' ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            <BarChart3 size={24} />
            <span className="text-xs mt-1">Анализ</span>
          </button>

          {/* Центральная кнопка добавления */}
          <button
            onClick={() => setActiveTab('add')}
            className="bg-red-500 rounded-full p-3 shadow-lg"
          >
            <Plus size={28} color="white" />
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex flex-col items-center p-2 ${
              activeTab === 'ai' ? 'text-blue-500' : 'text-gray-400'
            }`}
          >
            <Brain size={24} />
            <span className="text-xs mt-1">ИИ</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center p-2 ${
              activeTab === 'settings' ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            <Settings size={24} />
            <span className="text-xs mt-1">Еще</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default App

