# Adaptive Chess AI: Multi-Algorithmic Intelligence Engine

![Chess AI](https://img.shields.io/badge/Game-Chess-blue)
![AI Level](https://img.shields.io/badge/AI-Adaptive-green)
![Algorithms](https://img.shields.io/badge/Algorithms-4-brightgreen)
![Difficulty](https://img.shields.io/badge/Difficulty-4_levels-orange)

## Advanced Chess AI with Dynamic Intelligence Simulation

This project implements a cutting-edge JavaScript chess engine featuring an adaptive AI opponent that dynamically adjusts its playing strength using four distinct algorithms. The AI intelligently blends different decision-making approaches to simulate human-like play at varying skill levels, from beginner to expert.

## Key Features

- **Multi-Algorithmic Decision Engine**
- **Dynamic Difficulty Adjustment** (Easy to Expert)
- **Human-like Imperfection Simulation**
- **Complete Chess Rules Implementation**
- **Real-time Move Evaluation**
- **Visual Move Highlighting**

## Core AI Architecture

### 1. Hybrid Algorithm System
The AI employs four distinct decision-making paradigms:

| Algorithm | Strengths | Best For |
|-----------|----------|----------|
| **Greedy** | Fast, material-focused | Low-depth decisions |
| **Minimax** | Complete lookahead | Tactical positions |
| **Negamax** | Optimized evaluation | Endgame precision |
| **Alpha-Beta** | Pruned search space | High-level play |

### 2. Adaptive Intelligence Mechanism
```javascript
// Dynamic algorithm selection
let selectedAlgo;
let randomFactor = (5 - searchDepth) / 4;

if (Math.random() < randomFactor) {
    // Human-like variability at lower levels
    selectedAlgo = randomChoice(algorithms); 
} else {
    // Optimal play at higher levels
    selectedAlgo = strongestAlgorithm();
}
