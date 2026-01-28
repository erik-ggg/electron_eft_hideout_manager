import { useState, useEffect, useMemo } from 'react';
import './App.css';
import { HideoutManager } from './logic/HideoutManager';
import { ProjectPanel } from './components/ProjectPanel';
import { MaterialsPanel } from './components/MaterialsPanel';
import { AddProjectModal, LevelUpModal } from './components/Modals';
import { SaveData } from './types';

function App() {
  const [manager] = useState(() => new HideoutManager());
  const [data, setData] = useState<SaveData>(manager.getData());
  const [showAddModal, setShowAddModal] = useState(false);
  const [levelUpModal, setLevelUpModal] = useState<{ moduleId: string; moduleName: string; currentLevel: number } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (window.electronAPI) {
          const savedData = await window.electronAPI.readData('hideout_data.json');
          if (savedData) {
            manager.loadData(savedData);
            setData(manager.getData());
          }
        }
      } catch (e) {
        console.error("Failed to load data", e);
      }
    };
    load();
  }, [manager]);

  const refreshData = () => {
    setData({ ...manager.getData() });
  };

  const handleAddProject = (name: string, level: number, materials: { name: string; quantity: number; category?: string }[], moduleId?: string) => {
    manager.addProject(name, level, materials, moduleId);
    refreshData();
    setShowAddModal(false);
  };

  const handleLevelUpClick = (moduleId: string) => {
    const module = data.database.modules[moduleId];
    const project = data.active_projects.find(p => p.module_id === moduleId);
    if (module && project) {
      setLevelUpModal({
        moduleId,
        moduleName: module.name,
        currentLevel: project.level
      });
    }
  };

  const handleLevelUp = (materials: { name: string; quantity: number; category?: string }[]) => {
    if (levelUpModal) {
      manager.levelUpProject(levelUpModal.moduleId, materials);
      refreshData();
      setLevelUpModal(null);
    }
  };

  const handleDelete = (moduleId: string) => {
    manager.deleteProject(moduleId);
    refreshData();
  };

  const handleDeleteFromLevelUp = () => {
    if (levelUpModal) {
      manager.deleteProject(levelUpModal.moduleId);
      refreshData();
      setLevelUpModal(null);
    }
  };

  const handleIncrementMaterial = (moduleId: string, itemId: string) => {
    manager.incrementOwnedMaterial(moduleId, itemId);
    refreshData();
  };

  const handleDecrementMaterial = (moduleId: string, itemId: string) => {
    manager.decrementOwnedMaterial(moduleId, itemId);
    refreshData();
  };

  const requirements = useMemo(() => manager.calculateTotalRequirements(), [data]);

  return (
    <div className="app-container">
      <ProjectPanel
        projects={data.active_projects}
        modules={data.database.modules}
        items={data.database.items}
        onLevelUp={handleLevelUpClick}
        onDelete={handleDelete}
        onAddProject={() => setShowAddModal(true)}
        onIncrementMaterial={handleIncrementMaterial}
        onDecrementMaterial={handleDecrementMaterial}
      />

      <MaterialsPanel requirements={requirements} />

      {showAddModal && (
        <AddProjectModal
          items={data.database.items}
          modules={data.database.modules}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddProject}
        />
      )}

      {levelUpModal && (
        <LevelUpModal
          projectName={levelUpModal.moduleName}
          currentLevel={levelUpModal.currentLevel}
          items={data.database.items}
          onClose={() => setLevelUpModal(null)}
          onLevelUp={handleLevelUp}
          onDelete={handleDeleteFromLevelUp}
        />
      )}
    </div>
  );
}

export default App;
