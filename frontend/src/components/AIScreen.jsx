import { useState } from 'react'
import { Brain, Send, TrendingUp, Target, Lightbulb } from 'lucide-react'

const AIScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: 'Привет! Я ваш финансовый ИИ-ассистент. Анализирую ваши расходы за месяц...',
      time: '14:30'
    },
    {
      id: 2,
      type: 'ai',
      text: 'Рекомендую сократить траты на развлечения на 20%. Это поможет сэкономить ₽ 3,000.',
      time: '14:31'
    },
    {
      id: 3,
      type: 'ai',
      text: 'Ваши расходы на продукты в норме, но можно найти более выгодные предложения.',
      time: '14:31'
    }
  ])

  const [inputText, setInputText] = useState('')

  const quickActions = [
    { icon: TrendingUp, text: 'Анализ трат', color: 'bg-blue-500' },
    { icon: Target, text: 'Прогноз бюджета', color: 'bg-green-500' },
    { icon: Lightbulb, text: 'Советы по экономии', color: 'bg-orange-500' },
  ]

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: messages.length + 1,
        type: 'user',
        text: inputText,
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      }
      setMessages([...messages, newMessage])
      setInputText('')
      
      // Симуляция ответа ИИ
      setTimeout(() => {
        const aiResponse = {
          id: messages.length + 2,
          type: 'ai',
          text: 'Анализирую ваш запрос... Рекомендую обратить внимание на категорию "Развлечения" - здесь есть потенциал для экономии.',
          time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
        }
        setMessages(prev => [...prev, aiResponse])
      }, 1000)
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white">
      {/* Заголовок */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 pt-12">
        <div className="flex items-center">
          <Brain size={28} className="mr-3" />
          <div>
            <h1 className="text-xl font-bold">ИИ Ассистент</h1>
            <p className="text-blue-100 text-sm">🟢 Онлайн</p>
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="p-4 border-b">
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className={`${action.color} text-white p-3 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity`}
            >
              <action.icon size={20} className="mx-auto mb-1" />
              {action.text}
            </button>
          ))}
        </div>
      </div>

      {/* Чат */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.type === 'ai' && (
                <div className="flex items-center mb-1">
                  <Brain size={16} className="mr-1 text-blue-500" />
                  <span className="text-xs font-medium text-blue-500">ИИ</span>
                </div>
              )}
              <p className="text-sm">{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.type === 'user' ? 'text-red-100' : 'text-gray-500'
              }`}>
                {message.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Поле ввода */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Спросите ИИ о финансах..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSendMessage}
            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default AIScreen

