#!/usr/bin/env node

// Script to generate a static HTML table from the models-api.json data
// This will extract key information and format it for use in blog posts
// Usage: node generate-models-table.js [model-name-1] [model-name-2] ...

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get model names from command line arguments
const modelNames = process.argv.slice(2);

// Path to the models API JSON file
const modelsApiPath = join(__dirname, '../src/data/models-api.json');
const outputDir = join(__dirname, '../generated');

// Read the models API data
const modelsApiData = JSON.parse(readFileSync(modelsApiPath, 'utf8'));

// Function to format cost values for display
function formatCost(costValue) {
  if (typeof costValue === 'number') {
    return costValue.toFixed(2);
  }
  return 'N/A';
}

// Function to format context/output limits
function formatLimit(limitValue) {
  if (typeof limitValue === 'number') {
    if (limitValue >= 1000) {
      return `${(limitValue / 1000).toFixed(0)}K`;
    }
    return limitValue.toString();
  }
  return 'N/A';
}

// Extract relevant information for the static table
const tableRows = [];

for (const [providerId, providerData] of Object.entries(modelsApiData)) {
  const providerName = providerData.name || providerId;
  
  for (const [modelId, modelData] of Object.entries(providerData.models)) {
    const modelName = modelData.name || modelId;
    
    // If model names were specified, only include matching models
    if (modelNames.length > 0 && !modelNames.includes(modelId) && !modelNames.includes(modelName)) {
      continue;
    }
    
    const row = {
      provider: providerName,
      modelName: modelName,
      inputCost: modelData.cost ? formatCost(modelData.cost.input) : 'N/A',
      outputCost: modelData.cost ? formatCost(modelData.cost.output) : 'N/A',
      contextLimit: modelData.limit ? formatLimit(modelData.limit.context) : 'N/A',
      outputLimit: modelData.limit ? formatLimit(modelData.limit.output) : 'N/A',
      reasoning: modelData.reasoning ? '✓' : '✗',
      toolCall: modelData.tool_call ? '✓' : '✗',
      attachment: modelData.attachment ? '✓' : '✗',
      openWeights: modelData.open_weights ? '✓' : '✗',
      releaseDate: modelData.release_date || 'N/A',
      lastUpdated: modelData.last_updated || 'N/A',
      modalities: modelData.modalities ? modelData.modalities.input.join(', ') : 'N/A'
    };
    
    tableRows.push(row);
  }
}

// Sort table by provider and then by model name
tableRows.sort((a, b) => {
  if (a.provider !== b.provider) {
    return a.provider.localeCompare(b.provider);
  }
  return a.modelName.localeCompare(b.modelName);
});

// Generate HTML table with all columns
let fullHtmlTable = '<table class="ai-models-table">\n<thead>\n<tr>\n';
fullHtmlTable += '<th>Provider</th>\n<th>Model</th>\n<th>Input Cost</th>\n<th>Output Cost</th>\n<th>Context</th>\n<th>Output</th>\n<th>Reasoning</th>\n<th>Tools</th>\n<th>Attach</th>\n<th>Open Weights</th>\n<th>Modalities</th>\n<th>Release Date</th>\n<th>Last Updated</th>\n';
fullHtmlTable += '</tr>\n</thead>\n<tbody>\n';

for (const row of tableRows) {
  fullHtmlTable += '<tr>\n';
  fullHtmlTable += `<td>${row.provider}</td>\n`;
  fullHtmlTable += `<td>${row.modelName}</td>\n`;
  fullHtmlTable += `<td>${row.inputCost}</td>\n`;
  fullHtmlTable += `<td>${row.outputCost}</td>\n`;
  fullHtmlTable += `<td>${row.contextLimit}</td>\n`;
  fullHtmlTable += `<td>${row.outputLimit}</td>\n`;
  fullHtmlTable += `<td>${row.reasoning}</td>\n`;
  fullHtmlTable += `<td>${row.toolCall}</td>\n`;
  fullHtmlTable += `<td>${row.attachment}</td>\n`;
  fullHtmlTable += `<td>${row.openWeights}</td>\n`;
  fullHtmlTable += `<td>${row.modalities}</td>\n`;
  fullHtmlTable += `<td>${row.releaseDate}</td>\n`;
  fullHtmlTable += `<td>${row.lastUpdated}</td>\n`;
  fullHtmlTable += '</tr>\n';
}

fullHtmlTable += '</tbody>\n</table>\n';

import { writeFileSync, existsSync, mkdirSync } from 'fs';

// Ensure the output directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

const fullOutputFile = join(outputDir, 'models-table-full.html');
writeFileSync(fullOutputFile, fullHtmlTable);

console.log(`Generated full static HTML table with ${tableRows.length} models from ${Object.keys(modelsApiData).length} providers.`);
console.log(`Full output written to: ${fullOutputFile}`);

// Generate a simplified version for blog posts (with only key columns)
let simplifiedHtmlTable = '<table class="ai-models-table">\n<thead>\n<tr>\n';
simplifiedHtmlTable += '<th>Provider</th>\n<th>Model</th>\n<th>Input Cost</th>\n<th>Output Cost</th>\n<th>Context Window</th>\n<th>Reasoning</th>\n<th>Tools</th>\n<th>Open Weights</th>\n<th>Modalities</th>\n';
simplifiedHtmlTable += '</tr>\n</thead>\n<tbody>\n';

for (const row of tableRows) {
  simplifiedHtmlTable += '<tr>\n';
  simplifiedHtmlTable += `<td>${row.provider}</td>\n`;
  simplifiedHtmlTable += `<td>${row.modelName}</td>\n`;
  simplifiedHtmlTable += `<td>${row.inputCost}</td>\n`;
  simplifiedHtmlTable += `<td>${row.outputCost}</td>\n`;
  simplifiedHtmlTable += `<td>${row.contextLimit}</td>\n`;
  simplifiedHtmlTable += `<td>${row.reasoning}</td>\n`;
  simplifiedHtmlTable += `<td>${row.toolCall}</td>\n`;
  simplifiedHtmlTable += `<td>${row.openWeights}</td>\n`;
  simplifiedHtmlTable += `<td>${row.modalities}</td>\n`;
  simplifiedHtmlTable += '</tr>\n';
}

simplifiedHtmlTable += '</tbody>\n</table>\n';

const simplifiedOutputFile = join(outputDir, 'models-table-simplified.html');
writeFileSync(simplifiedOutputFile, simplifiedHtmlTable);

console.log(`Generated simplified static HTML table for blog posts.`);
console.log(`Simplified output written to: ${simplifiedOutputFile}`);

// Also generate a Markdown version
let markdownTable = '| Provider | Model | Input Cost | Output Cost | Context Window | Reasoning | Tools | Open Weights | Modalities |\n';
markdownTable += '|--------|-------|------------|-------------|----------------|-----------|-------|--------------|------------|\n';

for (const row of tableRows) {
  markdownTable += `| ${row.provider} | ${row.modelName} | ${row.inputCost} | ${row.outputCost} | ${row.contextLimit} | ${row.reasoning} | ${row.toolCall} | ${row.openWeights} | ${row.modalities} |\n`;
}

const markdownOutputFile = join(outputDir, 'models-table-simplified.md');
writeFileSync(markdownOutputFile, markdownTable);

console.log(`Generated simplified Markdown table for blog posts.`);
console.log(`Markdown output written to: ${markdownOutputFile}`);

// Additionally, generate a summary of providers
const providers = [...new Set(tableRows.map(row => row.provider))];
const summaryText = `Total models from ${providers.length} providers: ${tableRows.length} models`;

const summaryOutputFile = join(outputDir, 'models-summary.txt');
writeFileSync(summaryOutputFile, summaryText);

console.log(`Generated models summary.`);
console.log(`Summary written to: ${summaryOutputFile}`);