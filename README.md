# Triple Match-Up (单词连连看) 🎮

Triple Match-Up is a fast-paced, educational game designed to help students master Chinese vocabulary from YCT (Youth Chinese Test) levels 1 through 6. The game challenges players to match three related components: **Chinese Characters**, **Pinyin**, and **English/Mongolian Translations**.

## ✨ Features

- **Multiple Game Modes**:
  - **Solo Mode**: Practice at your own pace and improve your high score.
  - **PK Mode**: Compete against time in a more challenging environment.
- **Comprehensive Vocabulary**: Over hundreds of words covering YCT Levels 1-6.
- **Interactive Preparation**: Study words in the Preparation Page before diving into the game.
- **Dynamic Card Stacking**: A unique 3D layered card system inspired by classic matching games.
- **Tool System**: Use items like **Shuffle**, **Eject**, and **Auto-Match** to overcome difficult levels.
- **Modern UI**: Clean, cartoon-style design optimized for both desktop and small screens (responsive layout).

## 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Animation**: [Motion](https://motion.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Font**: [Outfit](https://fonts.google.com/specimen/Outfit) & Custom Chinese Support

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/triple-match-up.git
   cd triple-match-up
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Add your API keys if you plan to use AI features
   ```

4. **Launch the development server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

### Building for Production

To create an optimized production build:
```bash
npm run build
```
The output will be in the `dist/` directory.

## 📁 Directory Structure

- `src/components/`: UI components (Landing, GameView, PrepPage, etc.)
- `src/hooks/`: Custom React hooks for game logic and state management.
- `src/data/`: Vocabulary datasets for YCT levels.
- `src/assets/`: Static assets and global styles.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Designed with a focus on educational accessibility for language learners.
- Special thanks to the YCT curriculum for the vocabulary foundation.
