import { useState, useEffect, useMemo } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ListView } from './components/views/ListView';
import { BoardView } from './components/views/BoardView';
import { CalendarView } from './components/views/CalendarView';
import { ProjectEditor } from './components/projects/ProjectEditor';
import { TagEditor } from './components/tags/TagEditor';
import { LoginPage } from './components/auth/LoginPage';
import { useTodos, useProjects, useTags } from './hooks/useApi';
import { api } from './utils/api';
import { isAuthenticated } from './utils/auth';
import type { ViewMode, Todo, Project, Tag } from './types';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [activeProject, setActiveProject] = useState<number | undefined>();
  const [activeTag, setActiveTag] = useState<number | undefined>();
  
  const [showProjectEditor, setShowProjectEditor] = useState(false);
  const [showTagEditor, setShowTagEditor] = useState(false);

  useEffect(() => {
    setCheckingAuth(false);
    setAuthenticated(isAuthenticated());
  }, []);

  const { 
    todos, 
    loading: todosLoading, 
    fetchTodos
  } = useTodos(
    useMemo(() => {
      if (!authenticated) return {};
      const f: Record<string, string> = {};
      if (activeProject) f.project_id = String(activeProject);
      if (activeTag) f.tag_id = String(activeTag);
      return f;
    }, [authenticated, activeProject, activeTag]), 
    authenticated
  );

  const { 
    projects, 
    loading: projectsLoading
  } = useProjects(authenticated);

  const { 
    tags, 
    loading: tagsLoading
  } = useTags(authenticated);

  const handleCreateTodo = async (todoData: Partial<Todo>) => {
    const todo = await api.todos.create(todoData);
    await fetchTodos();
    return todo;
  };

  const handleCreateProject = async (projectData: Partial<Project>) => {
    await api.projects.create(projectData);
    window.location.reload();
  };

  const handleCreateTag = async (tagData: Partial<Tag>) => {
    await api.tags.create(tagData);
    window.location.reload();
  };

  const handleUpdateTodo = async (id: number, updates: Partial<Todo>) => {
    await api.todos.update(id, updates);
    await fetchTodos();
  };

  const handleDeleteTodo = async (id: number) => {
    await api.todos.delete(id);
    await fetchTodos();
  };

  const handleLogin = () => {
    setAuthenticated(true);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-sm text-neutral-400">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <div className="flex pt-16">
        <Sidebar
          projects={projects}
          tags={tags}
          activeProject={activeProject}
          activeTag={activeTag}
          onSelectProject={setActiveProject}
          onSelectTag={setActiveTag}
          onCreateProject={() => setShowProjectEditor(true)}
          onCreateTag={() => setShowTagEditor(true)}
        />

        <main className="flex-1 overflow-auto" style={{ marginLeft: '256px' }}>
          <div className={currentView === 'board' ? 'h-full p-6' : currentView === 'calendar' ? 'p-6' : 'max-w-3xl mx-auto px-6 py-12'}>
            {todosLoading || projectsLoading || tagsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-sm text-neutral-400">Loading...</div>
              </div>
            ) : (
              <>
                {currentView === 'list' && (
                  <ListView
                    todos={todos}
                    projects={projects}
                    tags={tags}
                    onUpdate={handleUpdateTodo}
                    onDelete={handleDeleteTodo}
                    onCreateTodo={handleCreateTodo}
                  />
                )}

                {currentView === 'board' && (
                  <BoardView
                    todos={todos}
                    projects={projects}
                    tags={tags}
                    onUpdate={handleUpdateTodo}
                    onDelete={handleDeleteTodo}
                    onCreateTodo={handleCreateTodo}
                  />
                )}

                {currentView === 'calendar' && (
                  <CalendarView
                    todos={todos}
                    onUpdate={handleUpdateTodo}
                    onDelete={handleDeleteTodo}
                  />
                )}
              </>
            )}

            {currentView !== 'calendar' && (
              <footer className="pt-6 mt-8 border-t border-neutral-200">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-neutral-400">Auto-save enabled</span>
                </div>
              </footer>
            )}
          </div>
        </main>
      </div>

      {showProjectEditor && (
        <ProjectEditor
          onSave={async (project) => {
            await handleCreateProject(project);
            setShowProjectEditor(false);
          }}
          onClose={() => setShowProjectEditor(false)}
        />
      )}

      {showTagEditor && (
        <TagEditor
          onSave={async (tag) => {
            await handleCreateTag(tag);
            setShowTagEditor(false);
          }}
          onClose={() => setShowTagEditor(false)}
        />
      )}
    </div>
  );
}

export default App;