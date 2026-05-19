import type { ViewMode } from '../../types';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-neutral-200 z-40 h-16">
      <div className="flex items-center justify-center h-full px-6 gap-8">
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
          Todo
        </h1>
        
        <div className="flex items-center gap-2">
          <ViewButton
            active={currentView === 'list'}
            onClick={() => onViewChange('list')}
          >
            List
          </ViewButton>
          <ViewButton
            active={currentView === 'board'}
            onClick={() => onViewChange('board')}
          >
            Board
          </ViewButton>
          <ViewButton
            active={currentView === 'calendar'}
            onClick={() => onViewChange('calendar')}
          >
            Calendar
          </ViewButton>
        </div>
      </div>
    </header>
  );
}

interface ViewButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function ViewButton({ active, onClick, children }: ViewButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 text-sm rounded-lg transition-colors
        ${active 
          ? 'bg-neutral-700 text-white' 
          : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50'
        }
      `}
    >
      {children}
    </button>
  );
}