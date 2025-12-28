import React, { useState, useEffect, useMemo } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ru } from 'date-fns/locale/ru';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Circle,
  Type,
  AlignLeft,
  Trash2,
  Save
} from 'lucide-react';

registerLocale('ru', ru);

/**
 * Приложение "Dark Neon Calendar"
 * Реализует канбан-сетку на месяц с хранением в localStorage
 */
export default function App() {
  // --- Состояние ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('ultra_dark_calendar_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load tasks", e);
        return [];
      }
    }
    return [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  // Поля формы
  const [formTask, setFormTask] = useState({
    text: '',
    description: '',
    date: '',
    completed: false
  });

  // --- Сохранение данных ---
  useEffect(() => {
    localStorage.setItem('ultra_dark_calendar_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // --- Логика дат ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Корректировка для Пн как первого дня недели
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    
    const days = [];
    for (let i = 0; i < offset; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    
    return days;
  }, [year, month]);

  const monthLabel = currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });

  // --- Вспомогательные функции ---
  const formatDateLocal = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // --- Действия ---
  const changeMonth = (offset) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  const openModal = (task = null, dateStr = null) => {
    if (task) {
      setEditingTask(task);
      setFormTask(task);
    } else {
      setEditingTask(null);
      setFormTask({
        text: '',
        description: '',
        date: dateStr || formatDateLocal(new Date()),
        completed: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formTask.text.trim()) return;
    
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...formTask } : t));
    } else {
      setTasks([...tasks, { ...formTask, id: Date.now().toString() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    setIsModalOpen(false);
  };

  const toggleComplete = (e, id) => {
    e.stopPropagation();
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const getTasksForDate = (date) => {
    if (!date) return [];
    const dStr = formatDateLocal(date);
    return tasks.filter(t => t.date === dStr);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-purple-50 font-sans selection:bg-purple-500/40 selection:text-white">
      {/* Декоративные фоновые элементы */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Контент */}
      <div className="relative z-10 p-4 md:p-8 flex flex-col h-screen max-w-[1600px] mx-auto">
        
        {/* Хедер */}
        <header className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-purple-600/20 p-3 rounded-2xl border border-purple-500/30">
              <CalendarIcon className="text-purple-400" size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-white first-letter:uppercase">
                {monthLabel}
              </h1>
              <p className="text-purple-400/60 text-xs font-medium tracking-widest uppercase">Task Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-black/40 backdrop-blur-md p-1 rounded-xl border border-white/5">
              <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-purple-500/10 rounded-lg transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-xs font-bold uppercase hover:text-purple-400 transition-colors">
                Сегодня
              </button>
              <button onClick={() => changeMonth(1)} className="p-2 hover:bg-purple-500/10 rounded-lg transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
            
            <button 
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] active:scale-95"
            >
              <Plus size={20} /> <span className="hidden sm:inline">Задача</span>
            </button>
          </div>
        </header>

        {/* Сетка календаря */}
        <div className="flex-1 grid grid-cols-7 gap-2 min-h-0">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
            <div key={d} className="text-center text-purple-400/40 text-xs font-black uppercase tracking-widest mb-2">
              {d}
            </div>
          ))}

          {calendarDays.map((date, i) => {
            const isToday = date && formatDateLocal(date) === formatDateLocal(new Date());
            const dayTasks = getTasksForDate(date);
            
            return (
              <div 
                key={i}
                onClick={() => date && openModal(null, formatDateLocal(date))}
                className={`
                  group relative flex flex-col p-2 md:p-3 rounded-2xl border transition-all overflow-hidden h-full
                  ${date 
                    ? 'bg-purple-900/5 border-purple-900/20 hover:border-purple-500/40 hover:bg-purple-900/10 cursor-pointer' 
                    : 'opacity-0 pointer-events-none'
                  }
                  ${isToday ? 'border-purple-500/60 bg-purple-600/10 shadow-[inset_0_0_15px_rgba(147,51,234,0.1)]' : ''}
                `}
              >
                {date && (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-sm font-bold ${isToday ? 'text-purple-400' : 'text-purple-100/40'}`}>
                        {date.getDate()}
                      </span>
                      {dayTasks.length > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                      )}
                    </div>

                    <div className="flex flex-col gap-1 overflow-y-auto no-scrollbar">
                      {dayTasks.map(t => (
                        <div 
                          key={t.id}
                          onClick={(e) => { e.stopPropagation(); openModal(t); }}
                          className={`
                            flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] md:text-xs font-medium border transition-all
                            ${t.completed 
                              ? 'bg-black/40 border-emerald-500/20 text-emerald-400/50' 
                              : 'bg-purple-500/10 border-purple-500/20 text-purple-100 hover:bg-purple-500/20'
                            }
                          `}
                        >
                          <button onClick={(e) => toggleComplete(e, t.id)} className="shrink-0">
                            {t.completed 
                              ? <CheckCircle2 size={14} className="text-emerald-500" /> 
                              : <Circle size={14} className="text-purple-400/40" />
                            }
                          </button>
                          <span className={`truncate ${t.completed ? 'line-through' : ''}`}>
                            {t.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Модальное окно */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-md bg-[#0f0f12] border border-purple-500/30 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,0,0,1)] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
            
            <header className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black uppercase tracking-tight">
                {editingTask ? 'Изменить' : 'Создать'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-purple-400/40 hover:text-purple-100 transition-colors">
                <X size={24} />
              </button>
            </header>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-purple-400/60 ml-2">
                  <Type size={12} /> Название
                </label>
                <input 
                  type="text"
                  placeholder="Название задачи..."
                  value={formTask.text}
                  onChange={e => setFormTask({...formTask, text: e.target.value})}
                  className="w-full bg-black/50 border border-purple-500/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500/50 transition-all text-purple-50 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-purple-400/60 ml-2">
                    <CalendarIcon size={12} /> Дата
                  </label>
                  <div className="w-full">
                    <DatePicker 
                      selected={formTask.date ? new Date(formTask.date) : null}
                      onChange={(date) => setFormTask({...formTask, date: formatDateLocal(date)})}
                      dateFormat="dd.MM.yyyy"
                      locale="ru"
                      placeholderText="Выберите дату"
                      className="w-full bg-black/50 border border-purple-500/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500/50 transition-all text-purple-50 color-scheme-dark"
                      calendarClassName="dark-neon-datepicker"
                      wrapperClassName="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-purple-400/60 ml-2">
                  <AlignLeft size={12} /> Описание
                </label>
                <textarea 
                  placeholder="Добавьте подробности..."
                  rows={3}
                  value={formTask.description}
                  onChange={e => setFormTask({...formTask, description: e.target.value})}
                  className="w-full bg-black/50 border border-purple-500/10 rounded-2xl px-5 py-4 outline-none focus:border-purple-500/50 transition-all text-purple-50 resize-none"
                />
              </div>

              <div className="flex items-center justify-between gap-4 pt-4">
                {editingTask ? (
                  <button 
                    onClick={() => handleDelete(editingTask.id)}
                    className="p-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 size={22} />
                  </button>
                ) : <div />}
                
                <div className="flex gap-3 flex-1 justify-end">
                  <button 
                    onClick={handleSave}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-purple-900/20"
                  >
                    <Save size={18} /> Сохранить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}