‧₊˚ ⏾. ⋅ Airi - A personal AI companion.

Airi is a personal AI desktop companion built using Electron and the OpenAI API.  
The application simulates a character-driven assistant that can hold conversations, adapt its tone, and remember user-specific information over time.

This project focuses on combining frontend UI, desktop application development, and AI integration into a cohesive interactive system.

---

## Features

- Real-time AI-powered conversations  
- Persistent chat history using local storage  
- Memory system for storing user-specific facts  
- Mood detection system (calm, focused, sleepy, annoyed)  
- Clear chat with confirmation logic (Y/N interaction)  
- Desktop application built with Electron  

---

## Technical Overview

The application is structured using Electron to bridge frontend and backend logic:

- Renderer process handles UI and user interaction  
- Main process handles API communication securely  
- OpenAI API is used for generating dynamic responses  
- Memory is stored locally and injected into future prompts  
- IPC (Inter-Process Communication) connects frontend and backend  

---

## Tech Stack

- JavaScript (ES6+)
- Node.js
- Electron
- HTML / CSS
- OpenAI API

---

## Installation

Clone the repository:

```bash
git clone https://github.com/zahara-robinson/Ai-Companion.git
cd Ai-Companion
