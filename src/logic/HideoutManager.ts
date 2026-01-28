import { v4 as uuidv4 } from 'uuid';
import { Database, ActiveProject, Item, Module, ModuleLevel, Requirement, SaveData } from '../types';
import { INITIAL_DATA } from './initial_data';

export class HideoutManager {
    public db: Database;
    public active_projects: ActiveProject[];
    private dataPath: string = 'hideout_data.json';

    constructor() {
        // Start with initial data, but deep copy to avoid mutating the source constant
        this.db = JSON.parse(JSON.stringify(INITIAL_DATA));
        this.active_projects = [];
    }

    // Initialize with loaded data
    public loadData(data: SaveData) {
        // Merge loaded data with initial data to ensure new preloaded items/modules appear
        // This is a simple merge: loaded data overwrites initial data if keys exist
        this.db = {
            items: { ...INITIAL_DATA.items, ...data.database.items },
            modules: { ...INITIAL_DATA.modules, ...data.database.modules }
        };
        this.active_projects = data.active_projects;
    }

    public getData(): SaveData {
        return {
            database: this.db,
            active_projects: this.active_projects
        };
    }

    public addProject(moduleName: string, initialLevel: number, materials: { name: string; quantity: number; category?: string }[], existingModuleId?: string) {
        const name = moduleName.trim();
        if (!name) {
            console.log("DEBUG: Empty module name ignored");
            return;
        }

        let moduleId = existingModuleId;
        let module = moduleId ? this.db.modules[moduleId] : undefined;

        // If no ID provided, or module not found, create new
        if (!moduleId || !module) {
            moduleId = uuidv4();
            module = {
                id: moduleId,
                name: name,
                levels: {}
            };
            this.db.modules[moduleId] = module;
        }

        // If the module exists (preloaded or newly created), check if the level exists
        if (!module.levels[initialLevel.toString()]) {
            // Level doesn't exist, create it from provided materials
            const requirements: Requirement[] = [];

            for (const mat of materials) {
                // Check if item exists (case-insensitive search)
                let itemId: string | undefined;
                for (const id in this.db.items) {
                    if (this.db.items[id].name.toLowerCase() === mat.name.toLowerCase()) {
                        itemId = id;
                        break;
                    }
                }

                if (!itemId) {
                    // Create new item
                    itemId = uuidv4();
                    this.db.items[itemId] = {
                        id: itemId,
                        name: mat.name,
                        image_path: null,
                        category: mat.category || 'other'
                    };
                    console.log(`DEBUG: Created new item: ${mat.name}`);
                }

                requirements.push({
                    item_id: itemId,
                    quantity: mat.quantity
                });
            }

            module.levels[initialLevel.toString()] = {
                level: initialLevel,
                requirements: requirements
            };
        } else {
            console.log(`Using existing level definition for ${name} level ${initialLevel}`);
        }

        // Check if project is already active
        if (this.active_projects.some(p => p.module_id === moduleId)) {
            console.log(`Project ${name} is already active.`);
            return;
        }

        this.active_projects.push({
            module_id: moduleId!,
            level: initialLevel,
            owned_materials: {}
        });

        console.log(`DEBUG: Added project: ${name} at level ${initialLevel}`);
        this.save();
    }

    public levelUpProject(moduleId: string, materials?: { name: string; quantity: number; category?: string }[]) {
        const project = this.active_projects.find(p => p.module_id === moduleId);
        if (project) {
            const newLevel = project.level + 1;
            const module = this.db.modules[moduleId];

            // Check if the module already has this level defined (preloaded)
            if (module && module.levels[newLevel.toString()]) {
                console.log(`Leveling up preloaded project: ${moduleId} to level ${newLevel}`);
                // Requirements are already there, just update level
                project.level = newLevel;
                project.owned_materials = {};
                this.save();
                return;
            }

            // If materials are provided (custom project or manual override), add them to the module's new level
            if (materials && materials.length > 0) {
                if (module) {
                    const requirements: Requirement[] = [];

                    for (const mat of materials) {
                        // Check if item exists
                        let itemId: string | undefined;
                        for (const id in this.db.items) {
                            if (this.db.items[id].name.toLowerCase() === mat.name.toLowerCase()) {
                                itemId = id;
                                break;
                            }
                        }

                        if (!itemId) {
                            // Create new item
                            itemId = uuidv4();
                            this.db.items[itemId] = {
                                id: itemId,
                                name: mat.name,
                                image_path: null,
                                category: mat.category || 'other'
                            };
                            console.log(`DEBUG: Created new item: ${mat.name}`);
                        }

                        requirements.push({
                            item_id: itemId,
                            quantity: mat.quantity
                        });
                    }

                    // Add new level to module
                    module.levels[newLevel.toString()] = {
                        level: newLevel,
                        requirements: requirements
                    };
                }
            }

            project.level = newLevel;
            project.owned_materials = {};
            console.log(`Leveling up project: ${moduleId} to level ${newLevel}`);
            this.save();
        }
    }

    public deleteProject(moduleId: string) {
        this.active_projects = this.active_projects.filter(p => p.module_id !== moduleId);
        console.log(`Deleted project: ${moduleId}`);
        this.save();
    }

    public incrementOwnedMaterial(moduleId: string, itemId: string) {
        const project = this.active_projects.find(p => p.module_id === moduleId);
        if (project) {
            if (!project.owned_materials[itemId]) {
                project.owned_materials[itemId] = 0;
            }
            project.owned_materials[itemId] += 1;
            console.log(`Incremented material ${itemId} for project ${moduleId}`);
            this.save();
        }
    }

    public decrementOwnedMaterial(moduleId: string, itemId: string) {
        const project = this.active_projects.find(p => p.module_id === moduleId);
        if (project) {
            if (project.owned_materials[itemId] && project.owned_materials[itemId] > 0) {
                project.owned_materials[itemId] -= 1;
                console.log(`Decremented material ${itemId} for project ${moduleId}`);
                this.save();
            }
        }
    }

    public calculateTotalRequirements(): { item: Item; quantity: number }[] {
        const totals: Record<string, number> = {};

        for (const project of this.active_projects) {
            const module = this.db.modules[project.module_id];
            if (module) {
                const modLevel = module.levels[project.level.toString()];
                if (modLevel) {
                    for (const req of modLevel.requirements) {
                        const owned = project.owned_materials[req.item_id] || 0;
                        const needed = Math.max(0, req.quantity - owned);
                        if (needed > 0) {
                            if (!totals[req.item_id]) {
                                totals[req.item_id] = 0;
                            }
                            totals[req.item_id] += needed;
                        }
                    }
                }
            }
        }

        return Object.entries(totals).map(([id, qty]) => {
            const item = this.db.items[id] || {
                id: id,
                name: "Unknown Item",
                image_path: null,
                category: 'other'
            };
            return { item, quantity: qty };
        });
    }

    private async save() {
        // In a real Electron app, we'd call the main process via IPC here.
        // For now, we'll assume a global window object or a passed-in saver function.
        // But since we are inside the logic class, we should probably emit an event or call a bound function.
        // To keep it simple and aligned with the plan, we will rely on the UI layer to trigger saves or 
        // inject a save handler. However, the plan said "Implement JSON load/save logic (delegating file I/O to Electron main process)".

        // Let's try to use the window.electronAPI if available, otherwise just log.
        try {
            // @ts-ignore
            if (window.electronAPI) {
                // @ts-ignore
                await window.electronAPI.writeData(this.dataPath, JSON.stringify(this.getData(), null, 2));
                console.log("Saved state to file via IPC");
            }
        } catch (e) {
            console.error("Failed to save via IPC", e);
        }
    }
}
