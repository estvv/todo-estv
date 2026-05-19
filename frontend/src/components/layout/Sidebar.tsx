import type { Project, Tag } from '../../types';

interface SidebarProps {
  projects: Project[];
  tags: Tag[];
  activeProject?: number;
  activeTag?: number;
  onSelectProject: (id?: number) => void;
  onSelectTag: (id?: number) => void;
  onCreateProject: () => void;
  onCreateTag: () => void;
}

export function Sidebar({
  projects,
  tags,
  activeProject,
  activeTag,
  onSelectProject,
  onSelectTag,
  onCreateProject,
  onCreateTag,
}: SidebarProps) {
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 border-r border-neutral-200 overflow-y-auto bg-white">
      <div className="p-6">
        <div className="mb-8">
          <button
            onClick={() => {
              onSelectProject(undefined);
              onSelectTag(undefined);
            }}
            className={`
              w-full text-left py-2 px-3 rounded-lg text-sm transition-colors
              ${!activeProject && !activeTag 
                ? 'bg-neutral-100 text-neutral-900' 
                : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50'
              }
            `}
          >
            All Tasks
          </button>
        </div>

        <Section
          title="Projects"
          onCreate={onCreateProject}
        >
          {projects.map(project => (
            <button
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className={`
                w-full text-left py-2 px-3 rounded-lg text-sm transition-colors flex items-center gap-2
                ${activeProject === project.id 
                  ? 'bg-neutral-100 text-neutral-900' 
                  : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50'
                }
              `}
            >
              <span 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              {project.name}
            </button>
          ))}
        </Section>

        <Section
          title="Tags"
          onCreate={onCreateTag}
        >
          {tags.map(tag => (
            <button
              key={tag.id}
              onClick={() => onSelectTag(tag.id)}
              className={`
                w-full text-left py-2 px-3 rounded-lg text-sm transition-colors flex items-center gap-2
                ${activeTag === tag.id 
                  ? 'bg-neutral-100 text-neutral-900' 
                  : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50'
                }
              `}
            >
              <span 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </button>
          ))}
        </Section>
      </div>
    </aside>
  );
}

interface SectionProps {
  title: string;
  onCreate: () => void;
  children: React.ReactNode;
}

function Section({ title, onCreate, children }: SectionProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-400">
          {title}
        </h3>
        <button
          onClick={onCreate}
          className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors"
        >
          + Add
        </button>
      </div>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}