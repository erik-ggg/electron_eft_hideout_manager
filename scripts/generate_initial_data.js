const fs = require('fs');
const path = require('path');

const ITEMS_URL = 'https://raw.githubusercontent.com/TarkovTracker/tarkovdata/master/items.en.json';
const HIDEOUT_URL = 'https://raw.githubusercontent.com/TarkovTracker/tarkovdata/master/hideout.json';
const OUTPUT_FILE = path.join(__dirname, '../src/logic/initial_data.ts');

async function main() {
    console.log('Fetching data...');
    const [itemsRes, hideoutRes] = await Promise.all([
        fetch(ITEMS_URL),
        fetch(HIDEOUT_URL)
    ]);

    if (!itemsRes.ok) throw new Error(`Failed to fetch items: ${itemsRes.statusText}`);
    if (!hideoutRes.ok) throw new Error(`Failed to fetch hideout: ${hideoutRes.statusText}`);

    const itemsData = await itemsRes.json();
    const hideoutData = await hideoutRes.json();

    console.log('Processing data...');

    const db = {
        items: {},
        modules: {}
    };

    // Helper to get or create item
    const getOrCreateItem = (itemId) => {
        if (db.items[itemId]) return itemId;

        const itemInfo = itemsData[itemId];
        if (!itemInfo) {
            console.warn(`Item not found: ${itemId}`);
            return itemId; // Fallback to ID as name if not found? Or skip?
        }

        db.items[itemId] = {
            id: itemId,
            name: itemInfo.name,
            image_path: null,
            category: 'other' // Default category
        };
        return itemId;
    };

    // Process modules
    // hideoutData.modules contains the levels
    for (const mod of hideoutData.modules) {
        const moduleName = mod.module;
        const moduleId = `module-${moduleName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        const level = mod.level;

        if (!db.modules[moduleId]) {
            db.modules[moduleId] = {
                id: moduleId,
                name: moduleName,
                levels: {}
            };
        }

        const requirements = [];

        for (const req of mod.require) {
            if (req.type === 'item') {
                const itemId = req.name; // For items, 'name' is the ID
                const quantity = req.quantity;

                // Ensure item exists in our DB
                getOrCreateItem(itemId);

                requirements.push({
                    item_id: itemId,
                    quantity: quantity
                });
            }
            // Ignore 'module' and 'trader' requirements for now as per current app logic
        }

        db.modules[moduleId].levels[level.toString()] = {
            level: level,
            requirements: requirements
        };
    }

    // Generate TypeScript file content
    const content = `import { Database } from '../types';

export const INITIAL_DATA: Database = ${JSON.stringify(db, null, 4)};
`;

    console.log(`Writing to ${OUTPUT_FILE}...`);
    fs.writeFileSync(OUTPUT_FILE, content);
    console.log('Done!');
}

main().catch(console.error);
