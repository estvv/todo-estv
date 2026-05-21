import type { ViewMode } from '../../types';
import { Button } from '../common/Button';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onMenuClick: () => void;
}

export function Header({ currentView, onViewChange, onMenuClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-neutral-200 z-40 h-16">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight lg:ml-0">
          Todo
        </h1>
        
        <div className="flex items-center gap-2">
          <Button
            variant={currentView === 'list' ? 'ghost' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('list')}
            className={currentView === 'list' ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200' : ''}
          >
            List
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange('board')}
            className={currentView === 'board' ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200' : ''}
          >
            Board
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange('calendar')}
            className={currentView === 'calendar' ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200' : ''}
          >
            Calendar
          </Button>
        </div>
        
        {/* Spacer for desktop to center view buttons */}
        <div className="w-10 lg:hidden" />
      </div>
    </header>
  );
}