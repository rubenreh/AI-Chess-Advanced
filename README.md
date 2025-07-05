# ♟️ AI Chess Engine with Neural Network

This project is an AI-powered Chess game built using **TensorFlow** and classic AI algorithms. The engine uses a **neural network** to evaluate board states and makes decisions through multiple search paradigms. Whether you're a beginner or an advanced player, this engine simulates realistic and challenging chess games.

---

## 🔍 Overview

The goal of this project is to combine traditional AI search algorithms with modern neural network evaluation to create a strong, adaptive chess-playing agent.

The AI makes moves using one of four core decision-making strategies:

| **Algorithm**       | **Strengths**              | **Best For**             |
|---------------------|----------------------------|---------------------------|
| Greedy              | Fast, material-focused     | Low-depth decisions       |
| Minimax             | Complete lookahead         | Tactical positions        |
| Negamax             | Optimized evaluation       | Endgame precision         |
| Alpha-Beta Pruning  | Pruned search space        | High-level strategic play |

---

## 🧠 Neural Network

- Built using **TensorFlow**
- Trained to evaluate board positions based on:
  - Material balance
  - King safety
  - Pawn structure
  - Control of the center
- Output: a scalar value representing the strength of the board for the current player.

---

## 🎮 Features

- Play against the AI or watch two AIs compete.
- Support for various AI depth levels and algorithms.
- Customizable neural network layers and architecture.
- Move history tracking and undo functionality.
- Console-based interface (GUI optional).

---

## 📂 Project Structure

```
ai-chess/
│
├── models/              # Saved neural network models
├── data/                # Training data and FEN positions
├── chess_engine.py      # Core game logic and rules
├── ai_player.py         # AI logic and decision-making
├── neural_net.py        # TensorFlow model and training pipeline
├── main.py              # Run the game
└── README.md            # This file
```

---

## 📈 Future Improvements

- Add a graphical UI (Tkinter or Pygame)
- Support for learning from self-play (reinforcement learning)
- Save and resume games
- UCI protocol integration for external chess GUIs

---

**Enjoy the game and explore the power of AI in Chess!** 🧠♜
