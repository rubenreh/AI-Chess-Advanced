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
```

### 3. Sophisticated Position Evaluation
The evaluation function considers:
- Material balance (weighted piece values)
- Piece activity and mobility
- King safety
- Pawn structure
- Center control
- Development advantage

### 4. Technical Implementation
The AI combines multiple search techniques:
- Greedy algorithm for immediate moves
- Minimax for complete lookahead
- Negamax for optimized evaluation
- Alpha-Beta pruning for efficiency

### 5. Adaptive Difficulty System
Four distinct difficulty levels:
- Easy (Depth 1): Basic moves
- Normal (Depth 2): Short-term planning
- Hard (Depth 3): Intermediate strategy
- Expert (Depth 4): Advanced positional play

### 6. Human-like Behavior Simulation
The AI intentionally:
- Makes occasional suboptimal moves at lower levels
- Varies its thinking time
- Shows different play styles
- Displays which algorithm it used

### 7. Complete Chess Rules Support
Full implementation including:
- Castling (both sides)
- En passant
- Pawn promotion
- Check/checkmate detection
- Stalemate recognition

### 8. Visual Feedback System
Interactive features:
- Move highlighting
- Valid move indicators
- Check warnings
- Game status messages

### 9. Future Development Roadmap
Planned enhancements:
- Neural network integration
- Opening book support
- Endgame tablebases
- Multi-threading
- Improved evaluation heuristics

### 10. Getting Started
Quick setup:
1. Clone repository
2. Open index.html
3. Select difficulty
4. Play as White
5. Watch AI's thought process

The AI displays its chosen algorithm for each move, giving unique insight into its decision-making.
