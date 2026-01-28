import React, { useState } from 'react';
import './Modals.scss';

interface AddProjectModalProps {
    items: Record<string, { id: string; name: string }>;
    modules: Record<string, { id: string; name: string }>;
    onClose: () => void;
    onAdd: (name: string, level: number, materials: { name: string; quantity: number; category?: string }[], moduleId?: string) => void;
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({ items, modules, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [level, setLevel] = useState(1);

    // Material addition state
    const [selectedItemId, setSelectedItemId] = useState('');
    const [newItemName, setNewItemName] = useState('');
    const [newItemCategory, setNewItemCategory] = useState('other');
    const [quantity, setQuantity] = useState(1);

    const [addedMaterials, setAddedMaterials] = useState<{ name: string; quantity: number; category?: string }[]>([]);

    const handleAddMaterial = () => {
        let materialName = '';
        if (selectedItemId) {
            materialName = items[selectedItemId].name;
        } else if (newItemName.trim()) {
            materialName = newItemName.trim();
        }

        if (materialName && quantity > 0) {
            const material: { name: string; quantity: number; category?: string } = { name: materialName, quantity };
            if (newItemName.trim()) {
                material.category = newItemCategory;
            }
            setAddedMaterials([...addedMaterials, material]);
            // Reset fields
            setSelectedItemId('');
            setNewItemName('');
            setNewItemCategory('other');
            setQuantity(1);
        }
    };

    const handleRemoveMaterial = (index: number) => {
        const newMaterials = [...addedMaterials];
        newMaterials.splice(index, 1);
        setAddedMaterials(newMaterials);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Find if the name matches a preloaded module
        const preloadedModule = Object.values(modules).find(m => m.name === name);
        onAdd(name, level, addedMaterials, preloadedModule?.id);
    };

    const sortedItems = Object.values(items).sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Add New Project</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Module Name</label>
                        <div className="module-input-group" style={{ display: 'flex', gap: '10px' }}>
                            <select
                                value={Object.values(modules).find(m => m.name === name)?.id || ''}
                                onChange={e => {
                                    const selectedModule = modules[e.target.value];
                                    if (selectedModule) {
                                        setName(selectedModule.name);
                                    } else {
                                        setName('');
                                    }
                                }}
                                style={{ flex: 1 }}
                            >
                                <option value="">-- Custom / Select --</option>
                                {Object.values(modules).map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Or type custom name..."
                                required
                                style={{ flex: 1 }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Target Level</label>
                        <div className="level-buttons">
                            <button
                                type="button"
                                className={`level-btn ${level === 1 ? 'active' : ''}`}
                                onClick={() => setLevel(1)}
                            >
                                1
                            </button>
                            <button
                                type="button"
                                className={`level-btn ${level === 2 ? 'active' : ''}`}
                                onClick={() => setLevel(2)}
                            >
                                2
                            </button>
                            <button
                                type="button"
                                className={`level-btn ${level === 3 ? 'active' : ''}`}
                                onClick={() => setLevel(3)}
                            >
                                3
                            </button>
                        </div>
                    </div>

                    <div className="materials-section">
                        <h3>Materials Required ({addedMaterials.length})</h3>

                        <div className="material-input-group">
                            {/* Row 1: Existing Item */}
                            <div className="input-row">
                                <div className="form-group flex-grow">
                                    <label>Select Existing Item:</label>
                                    <select
                                        value={selectedItemId}
                                        onChange={e => {
                                            setSelectedItemId(e.target.value);
                                            if (e.target.value) setNewItemName('');
                                        }}
                                        disabled={!!newItemName}
                                    >
                                        <option value="">-- Select Item --</option>
                                        {sortedItems.map(item => (
                                            <option key={item.id} value={item.id}>{item.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="separator">
                                <span>OR CREATE NEW</span>
                            </div>

                            {/* Row 2: New Item */}
                            <div className="input-row">
                                <div className="form-group flex-grow">
                                    <label>New Item Name:</label>
                                    <input
                                        value={newItemName}
                                        onChange={e => {
                                            setNewItemName(e.target.value);
                                            if (e.target.value) setSelectedItemId('');
                                        }}
                                        placeholder="Material name"
                                        disabled={!!selectedItemId}
                                    />
                                </div>
                                <div className="form-group category-group">
                                    <label>Category:</label>
                                    <select
                                        value={newItemCategory}
                                        onChange={e => setNewItemCategory(e.target.value)}
                                        disabled={!newItemName}
                                    >
                                        {['building', 'tech', 'food', 'health', 'tools', 'valuables', 'other'].map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Row 3: Action */}
                            <div className="input-row action-row">
                                <div className="form-group qty-group">
                                    <label>Qty:</label>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={e => setQuantity(parseInt(e.target.value))}
                                        min="1"
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-success add-btn"
                                    onClick={handleAddMaterial}
                                    disabled={(!selectedItemId && !newItemName)}
                                >
                                    Add Material
                                </button>
                            </div>
                        </div>

                        <div className="materials-list">
                            {addedMaterials.map((mat, idx) => (
                                <div key={idx} className="material-list-item">
                                    <span>{mat.name}</span>
                                    <span className="qty">x{mat.quantity}</span>
                                    <button
                                        type="button"
                                        className="btn-icon"
                                        onClick={() => handleRemoveMaterial(idx)}
                                        style={{ color: '#f44747' }}
                                    >
                                        ✖
                                    </button>
                                </div>
                            ))}
                            {addedMaterials.length === 0 && <p className="empty-msg">No materials added yet.</p>}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn">Add Project</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface LevelUpModalProps {
    projectName: string;
    currentLevel: number;
    items: Record<string, { id: string; name: string }>;
    onClose: () => void;
    onLevelUp: (materials: { name: string; quantity: number; category?: string }[]) => void;
    onDelete: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
    projectName,
    currentLevel,
    items,
    onClose,
    onLevelUp,
    onDelete
}) => {
    const [selectedItemId, setSelectedItemId] = useState('');
    const [newItemName, setNewItemName] = useState('');
    const [newItemCategory, setNewItemCategory] = useState('other');
    const [quantity, setQuantity] = useState(1);
    const [addedMaterials, setAddedMaterials] = useState<{ name: string; quantity: number; category?: string }[]>([]);

    const handleAddMaterial = () => {
        let materialName = '';
        if (selectedItemId) {
            materialName = items[selectedItemId].name;
        } else if (newItemName.trim()) {
            materialName = newItemName.trim();
        }

        if (materialName && quantity > 0) {
            const material: { name: string; quantity: number; category?: string } = { name: materialName, quantity };
            if (newItemName.trim()) {
                material.category = newItemCategory;
            }
            setAddedMaterials([...addedMaterials, material]);
            setSelectedItemId('');
            setNewItemName('');
            setNewItemCategory('other');
            setQuantity(1);
        }
    };

    const handleRemoveMaterial = (index: number) => {
        const newMaterials = [...addedMaterials];
        newMaterials.splice(index, 1);
        setAddedMaterials(newMaterials);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLevelUp(addedMaterials);
    };

    const sortedItems = Object.values(items).sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Level Up: {projectName}</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    Current Level: {currentLevel} → New Level: {currentLevel + 1}
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="materials-section">
                        <h3>Materials for Level {currentLevel + 1} ({addedMaterials.length})</h3>

                        <div className="material-input-group">
                            {/* Row 1: Existing Item */}
                            <div className="input-row">
                                <div className="form-group flex-grow">
                                    <label>Select Existing Item:</label>
                                    <select
                                        value={selectedItemId}
                                        onChange={e => {
                                            setSelectedItemId(e.target.value);
                                            if (e.target.value) setNewItemName('');
                                        }}
                                        disabled={!!newItemName}
                                    >
                                        <option value="">-- Select Item --</option>
                                        {sortedItems.map(item => (
                                            <option key={item.id} value={item.id}>{item.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="separator">
                                <span>OR CREATE NEW</span>
                            </div>

                            {/* Row 2: New Item */}
                            <div className="input-row">
                                <div className="form-group flex-grow">
                                    <label>New Item Name:</label>
                                    <input
                                        value={newItemName}
                                        onChange={e => {
                                            setNewItemName(e.target.value);
                                            if (e.target.value) setSelectedItemId('');
                                        }}
                                        placeholder="Material name"
                                        disabled={!!selectedItemId}
                                    />
                                </div>
                                <div className="form-group category-group">
                                    <label>Category:</label>
                                    <select
                                        value={newItemCategory}
                                        onChange={e => setNewItemCategory(e.target.value)}
                                        disabled={!newItemName}
                                    >
                                        {['building', 'tech', 'food', 'health', 'tools', 'valuables', 'other'].map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Row 3: Action */}
                            <div className="input-row action-row">
                                <div className="form-group qty-group">
                                    <label>Qty:</label>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={e => setQuantity(parseInt(e.target.value))}
                                        min="1"
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-success add-btn"
                                    onClick={handleAddMaterial}
                                    disabled={(!selectedItemId && !newItemName)}
                                >
                                    Add Material
                                </button>
                            </div>
                        </div>

                        <div className="materials-list">
                            {addedMaterials.map((mat, idx) => (
                                <div key={idx} className="material-list-item">
                                    <span>{mat.name}</span>
                                    <span className="qty">x{mat.quantity}</span>
                                    <button
                                        type="button"
                                        className="btn-icon"
                                        onClick={() => handleRemoveMaterial(idx)}
                                        style={{ color: '#f44747' }}
                                    >
                                        ✖
                                    </button>
                                </div>
                            ))}
                            {addedMaterials.length === 0 && (
                                <p className="empty-msg">No materials added. You can level up without materials or delete the project.</p>
                            )}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button
                            type="button"
                            className="btn"
                            style={{ backgroundColor: 'var(--danger-color)' }}
                            onClick={onDelete}
                        >
                            Delete Project
                        </button>
                        <button type="submit" className="btn">Level Up</button>
                    </div>
                </form>
            </div>
        </div >
    );
};
