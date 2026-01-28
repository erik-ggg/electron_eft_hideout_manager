# Electron EFT Hideout Manager

## 📖 Descripción
Este es un proyecto diseñado con el objetivo de aprender a utilizar **Electron**, utilizando como temática principal la gestión del "Hideout" del videojuego *Escape from Tarkov*. La aplicación permite gestionar módulos y requisitos de mejora de forma visual, sirviendo como ejercicio práctico aprender a utilizar las tecnología mencionada.

## 🛠️ Tecnologías Usadas
El stack tecnológico elegido para este proyecto incluye:
- **Electron** como base para la aplicación de escritorio.
- **React** para la construcción de la interfaz de usuario.
- **TypeScript** proporcionando tipado estático y robustez.
- **Vite** para un entorno de desarrollo rápido y optimizado.
- **Sass** para un estilado.

## 🚀 Cómo Iniciar el Proyecto
Para trabajar en el proyecto localmente:

1. Instala las dependencias necesarias:
   ```bash
   npm install
   ```

2. Arranca el entorno de desarrollo:
   ```bash
   npm run dev
   ```
   Esto iniciará el servidor de Vite y abrirá la ventana de la aplicación Electron con *Hot Module Replacement* (HMR) activo.

## 📦 Compilación
Para generar el ejecutable de escritorio:

1. Compila el código fuente:
   ```bash
   npx tsc && npx vite build
   ```

2. Genera los instaladores con **Electron Forge**:
   ```bash
   npm run make
   ```

Los instaladores resultantes se encontrarán en la carpeta `out`.

---
> [!NOTE]
> Este proyecto ha sido realizado en sesiones de "Livecoding" con la asistencia de herramientas como "Antigravity". A pesar de la asistencia IA, las decisiones arquitectónicas y el rumbo del proyecto son responsabilidad exclusiva del developer.
