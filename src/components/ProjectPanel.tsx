import React, { useState } from 'react';
import './ProjectPanel.scss';
import { ActiveProject, Module, Item } from '../types';

interface ProjectPanelProps {
    projects: ActiveProject[];
    modules: Record<string, Module>;
    items: Record<string, Item>;
    onLevelUp: (moduleId: string) => void;
    onDelete: (moduleId: string) => void;
    onAddProject: () => void;
    onIncrementMaterial: (moduleId: string, itemId: string) => void;
    onDecrementMaterial: (moduleId: string, itemId: string) => void;
}

export const ProjectPanel: React.FC<ProjectPanelProps> = ({
    projects,
    modules,
    items,
    onLevelUp,
    onDelete,
    onAddProject,
    onIncrementMaterial,
    onDecrementMaterial
}) => {
    const [expandedProject, setExpandedProject] = useState<string | null>(null);

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>Active Projects</h2>
                <button className="btn" onClick={onAddProject}>+ Add</button>
            </div>

            {projects.map(project => {
                const module = modules[project.module_id];
                const isExpanded = expandedProject === project.module_id;
                const moduleLevel = module?.levels[project.level];

                return (
                    <div key={project.module_id} className="project-card">
                        <div
                            className="project-header"
                            onClick={() => setExpandedProject(isExpanded ? null : project.module_id)}
                            style={{ cursor: 'pointer', width: '100%' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div className="project-info">
                                    <h3>{module ? module.name : 'Unknown Module'}</h3>
                                    <p>Level {project.level}</p>
                                </div>
                                <div className="project-actions" onClick={(e) => e.stopPropagation()}>
                                    <button className="action-btn btn-levelup" onClick={() => onLevelUp(project.module_id)} title="Level Up">
                                        ▲
                                    </button>
                                    <button className="action-btn btn-delete" onClick={() => onDelete(project.module_id)} title="Delete">
                                        ✖
                                    </button>
                                </div>
                            </div>
                        </div>

                        {isExpanded && moduleLevel && (
                            <div className="project-materials">
                                {moduleLevel.requirements.map(req => {
                                    const item = items[req.item_id];
                                    const owned = project.owned_materials[req.item_id] || 0;
                                    const needed = req.quantity - owned;

                                    return (
                                        <div key={req.item_id} className="material-requirement">
                                            <div className="material-req-info">
                                                <span className="material-name">{item?.name || 'Unknown'}</span>
                                                <span className={`material-progress ${needed <= 0 ? 'complete' : ''}`}>
                                                    {owned}/{req.quantity}
                                                </span>
                                            </div>
                                            {(needed > 0 || owned > 0) && (
                                                <div className="material-actions">
                                                    {owned > 0 && (
                                                        <button
                                                            className="btn-decrement"
                                                            onClick={() => onDecrementMaterial(project.module_id, req.item_id)}
                                                            title="Decrease owned count"
                                                        >
                                                            -
                                                        </button>
                                                    )}
                                                    {needed > 0 && (
                                                        <button
                                                            className="btn-increment"
                                                            onClick={() => onIncrementMaterial(project.module_id, req.item_id)}
                                                            title="Mark as owned"
                                                        >
                                                            +
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
