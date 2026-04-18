# Transformer Architecture

The Transformer is a deep learning architecture developed by Google in 2017, primarily used for natural language processing tasks. It relies entirely on a self-attention mechanism to draw global dependencies between input and output, eschewing recurrence and convolution.

## Key Components

- **Self-Attention Mechanism**: Allows the model to weigh the importance of different words in a sequence relative to each other.
- **Multi-Head Attention**: Multiple self-attention layers run in parallel, enabling the model to jointly attend to information from different representation subspaces.
- **Feed-Forward Networks**: Applied automatically to each position after the attention layers.
- **Positional Encoding**: Since the model has no recurrence, it uses positional encodings added to the input embeddings to inject information about the relative or absolute position of the tokens.

---
Metadata: {"type": "concept"}
