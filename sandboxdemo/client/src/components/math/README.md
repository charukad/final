# Math Components

Mathematical research components powered by LM Studio.

## MathResearchAgent

Specialized AI research assistant for mathematical content.

### Features
- Multiple research modes (Papers, Formulas, Concepts, Proofs)
- LM Studio integration for local AI processing
- Slide-out panel interface
- Direct note integration

### Usage
```jsx
import MathResearchAgent from './MathResearchAgent';

<MathResearchAgent
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onAddToNote={(content) => addToNote(content)}
/>
```

### Research Modes
- **Papers**: Academic papers and publications
- **Formulas**: Mathematical equations with derivations
- **Concepts**: Theoretical concepts with context
- **Proofs**: Step-by-step mathematical proofs

### Props
- `isOpen`: Panel visibility
- `onClose`: Close callback
- `onAddToNote`: Add content to note callback
- `currentNote`: Current note content (optional)

### Implementation
Uses LM Studio's `generateContent` service with specialized prompts for each research type. 