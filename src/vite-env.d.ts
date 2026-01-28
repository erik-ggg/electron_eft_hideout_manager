/// <reference types="vite/client" />

interface ElectronAPI {
    readData: (filePath: string) => Promise<any>;
    writeData: (filePath: string, content: string) => Promise<boolean>;
}

interface Window {
    electronAPI: ElectronAPI;
}
