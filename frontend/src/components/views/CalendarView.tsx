import { useState, useMemo } from 'react';
import type { Todo } from '../../types';
import { TodoItem } from '../todos/TodoItem';

interface CalendarViewProps {
  todos: Todo[];
  onUpdate: (id: number, updates: Partial<Todo>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function CalendarView({ todos, onUpdate, onDelete }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = useMemo(() => {
    const result = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      result.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      result.push(i);
    }
    return result;
  }, [firstDayOfMonth, daysInMonth]);

  const getTodosForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return todos.filter(todo => {
      if (!todo.due_date) return false;
      const dueDate = new Date(todo.due_date);
      return dueDate.toDateString() === date.toDateString();
    });
  };

  const selectedTodos = selectedDate
    ? todos.filter(todo => {
        if (!todo.due_date) return false;
        const dueDate = new Date(todo.due_date);
        return dueDate.toDateString() === selectedDate.toDateString();
      })
    : [];

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="p-2 hover:bg-neutral-50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="p-2 hover:bg-neutral-50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-xs font-medium uppercase tracking-wider text-neutral-400 text-center py-2">
              {day}
            </div>
          ))}
          
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="h-24" />;
            }

            const dayTodos = getTodosForDay(day);
            const isSelected = selectedDate && 
              day === selectedDate.getDate() &&
              currentDate.getMonth() === selectedDate.getMonth() &&
              currentDate.getFullYear() === selectedDate.getFullYear();

            return (
              <div
                key={index}
                onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                  className={`
                  h-24 border border-neutral-200 rounded-lg p-1 cursor-pointer transition-colors
                  ${isToday(day) ? 'bg-neutral-700 text-white' : 'hover:bg-neutral-50'}
                  ${isSelected ? 'ring-2 ring-neutral-700' : ''}
                `}
              >
                <div className={`text-xs font-medium ${isToday(day) ? 'text-white' : 'text-neutral-900'} mb-1`}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {dayTodos.slice(0, 3).map(todo => (
                    <div
                      key={todo.id}
                      className={`
                        text-xs truncate px-1 rounded
                        ${isToday(day) ? 'text-white' : 'bg-neutral-100 text-neutral-900'}
                      `}
                    >
                      {todo.title}
                    </div>
                  ))}
                  {dayTodos.length > 3 && (
                    <div className={`text-xs ${isToday(day) ? 'text-white' : 'text-neutral-400'}`}>
                      +{dayTodos.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && selectedTodos.length > 0 && (
        <div className="border-t border-neutral-200 pt-6">
          <h3 className="text-sm font-medium text-neutral-900 mb-3">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
          <div className="space-y-3">
            {selectedTodos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onClick={() => {}}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}