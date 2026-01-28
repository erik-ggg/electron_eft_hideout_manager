export interface Item {
    id: string;
    name: string;
    image_path: string | null;
    category: string;
}

export interface Requirement {
    item_id: string;
    quantity: number;
}

export interface ModuleLevel {
    level: number;
    requirements: Requirement[];
}

export interface Module {
    id: string;
    name: string;
    levels: Record<string, ModuleLevel>; // Key is level number as string
}

export interface ActiveProject {
    module_id: string;
    level: number;
    owned_materials: Record<string, number>; // Key is item_id
}

export interface Database {
    items: Record<string, Item>;
    modules: Record<string, Module>;
}

export interface SaveData {
    database: Database;
    active_projects: ActiveProject[];
}
