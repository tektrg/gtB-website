# Generate Models Table Script Guide

## Overview
The `generate-models-table.js` script is a Node.js utility that generates static HTML and Markdown tables from `models-api.json` data. It provides structured information about AI models including provider details, costs, limits, and features.

## Location
- Script: `/scripts/generate-models-table.js`
- Input data: `/src/data/models-api.json`
- Output directory: `/generated/`

## Usage Instructions

### Basic Usage
```bash
node generate-models-table.js
```
This processes all models in the `models-api.json` file and creates output files with tables for all available models.

### Filter Specific Models
```bash
node generate-models-table.js [model-name-1] [model-name-2] ...
```
Example:
```bash
node generate-models-table.js gpt-4o gpt-4-turbo claude-3-opus
```
This will only include the specified models in the generated output.

## Input Data Format
The script reads from `src/data/models-api.json` which should follow this structure:
- Providers contain multiple models
- Each model has properties: cost (input/output), limits (context/output), features (reasoning, tools, attachments, etc.)

## Output Files
All output is written to the `generated/` directory:

1. `models-table-full.html` - Complete table with all columns
   - Includes Provider, Model, Input/Output Costs, Context/Output Limits
   - Features like reasoning, tools, attachments, open weights
   - Release dates and modalities information

2. `models-table-simplified.html` - Reduced columns optimized for blog posts
   - Contains Provider, Model, Input/Output Costs, Context Window
   - Key features like reasoning, tools, open weights, and modalities

3. `models-table-simplified.md` - Markdown version for blog posts
   - Same data as simplified HTML but in Markdown format
   - Ready for use in Markdown-based blog posts

4. `models-summary.txt` - Text summary with count information
   - Shows total number of models and providers processed

## Output Columns Explained
- **Provider**: Name of the AI service provider
- **Model**: Model identifier/name
- **Input/Output Costs**: Price per million tokens formatted to 2 decimal places
- **Context/Output Limits**: Maximum token limits with 'K' suffix for thousands (e.g., 1000 tokens becomes '1K')
- **Feature indicators**: Checkmarks (✓) or crosses (✗) for reasoning, tool use, attachments, open weights
- **Release/Update dates**: Publication or last updated dates for the model
- **Modalities**: Input types supported by the model (text, image, etc.)

## Technical Details
- Costs are formatted as decimal numbers with 2 places (e.g., 0.25)
- Token limits over 1000 are formatted with 'K' suffix (e.g., 128K for 128,000 tokens)
- Boolean features are converted to checkmarks (✓) or crosses (✗)
- Tables are sorted first by provider, then by model name
- The script creates the output directory if it doesn't exist

## Integration with Blog Posts
The simplified HTML and Markdown outputs are specifically designed for integration into blog posts:
- Use the HTML version directly in Astro markdown files with HTML formatting
- Use the Markdown version in standard Markdown files
- Tables include CSS class `ai-models-table` for consistent styling

## Requirements
- Node.js environment
- `models-api.json` file at `src/data/models-api.json`
- Write permissions to create `generated/` directory

## Customization Options
The script currently doesn't have command-line options for customization, but the columns included in each output type can be modified by editing the script:
- Full HTML includes all available data
- Simplified versions include only key information for blog consumption