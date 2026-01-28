import React from 'react';
import './MaterialsPanel.scss';
import { Item } from '../types';

interface MaterialsPanelProps {
    requirements: { item: Item; quantity: number }[];
}

export const MaterialsPanel: React.FC<MaterialsPanelProps> = ({ requirements }) => {
    const categories = ['building', 'tech', 'food', 'health', 'tools', 'valuables', 'other'];

    const groupedRequirements = categories.reduce((acc, category) => {
        acc[category] = requirements.filter(req => (req.item.category || 'other') === category);
        return acc;
    }, {} as Record<string, typeof requirements>);

    // Handle items with unknown categories just in case, putting them in 'other'
    const knownCategories = new Set(categories);
    const unknownItems = requirements.filter(req => !knownCategories.has(req.item.category || 'other'));
    if (unknownItems.length > 0) {
        groupedRequirements['other'] = [...(groupedRequirements['other'] || []), ...unknownItems];
    }

    const hasAnyMaterials = requirements.length > 0;

    return (
        <div className="main-content">
            <h2 className="materials-title">Required Materials</h2>
            <div className="materials-container">
                {hasAnyMaterials ? (
                    categories.map(category => {
                        const items = groupedRequirements[category];
                        if (!items || items.length === 0) return null;

                        return (
                            <div key={category} className="category-column">
                                <h3 className="category-title">{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                                <div className="category-items">
                                    {items.map(({ item, quantity }) => (
                                        <div key={item.id} className="material-card">
                                            <div className="material-left">
                                                <div className="material-icon">
                                                    <span>?</span>
                                                </div>
                                                <div className="material-info">
                                                    <h4>{item.name}</h4>
                                                </div>
                                            </div>
                                            <div className="material-qty">
                                                x{quantity}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p>No materials needed.</p>
                )}
            </div>
        </div>
    );
};
