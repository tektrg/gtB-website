---
title: "How to Use Local LLMs with GPT Breeze for Ultimate Privacy and Control"
description: "Unlock the full potential of local LLMs with GPT Breeze. This guide shows you how to set up Ollama and use it with the GPT Breeze browser extension for a private and powerful AI experience."
pubDate: 2024-07-30
author: "Jules"
tags: ["local llm", "gpt breeze", "ollama", "ai privacy", "browser extension"]
draft: false
---

Run your own AI models locally while maintaining privacy and reducing costs with GPT Breeze's custom model server support.

## Overview

GPT Breeze supports any local AI model server that provides an OpenAI-compatible API. This means you can:

- **Keep your data private** - All conversations stay on your device
- **Reduce costs** - No API fees for using your own models
- **Work offline** - Use AI even without internet connection
- **Choose any model** - Run specialized models for your specific needs

### Key Benefits

- Complete data privacy and control
- Zero ongoing API costs after initial setup
- Offline capability for sensitive work
- Support for specialized and fine-tuned models

## Getting Started

### What You'll Need

- A local model server running on your computer
- Basic understanding of your local server's configuration
- 5-10 minutes for initial setup

### Ollama (Recommended for Beginners)

**Best for**: Easy setup and model management

- **Default URL**: `http://127.0.0.1:11434/v1`
- **Why choose Ollama**: Simple installation, extensive model library, automatic model management
- **Getting started**: Visit [ollama.ai](http://ollama.ai) for installation instructions

## Setting Up Your Local Server

### Step 1: Install Your Chosen Server

Follow the installation instructions for your selected local model server. Most servers provide simple installation scripts or packages.

### Step 2: Download a Model

Each server has its own method for downloading models:

- **Ollama**: `ollama pull llama2` (or your preferred model)
- **LocalAI**: Place model files in the models directory
- **vLLM**: Specify model path in startup command
- **Text Generation WebUI**: Use the web interface to download models

### Step 3: Start the Server

Start your local server according to its documentation. Ensure it's running and accessible at the expected URL.

**Verification**: Open your browser and visit your server's URL. You should see either an API documentation page or a confirmation that the server is running.

```bash
export OLLAMA_ORIGINS="*"
ollama serve > /dev/null 2>&1 &
```

> 💡 `OLLAMA_ORIGINS="*"` is needed to prevent a "Forbidden" error when the extension tries to access the server.

## Configuring GPT Breeze

### Adding Your Local Server

1. **Open GPT Breeze settings**
    - Click the GPT Breeze extension icon
    - Navigate to Settings or Credentials section
2. **Add a new custom provider**
    - Click "Add Provider" or similar button
    - Select "Custom" as the provider type
3. **Enter your server details**:
    - **Name**: Give your server a recognizable name (e.g., "My Ollama Server")
    - **Base URL**: Enter your server's URL (e.g., `http://127.0.0.1:11434/v1`)
    - **API Key**: Leave empty or enter "dummy-key" (most local servers don't require authentication)
4. **Save and test**
    - Save your configuration
    - Try sending a test message to verify the connection

### Configuration Example

```
Name: Ollama Local
Base URL: http://127.0.0.1:11434/v1
API Key: (leave empty)
```

## Troubleshooting

### Common Issues

### Issue: "Forbidden"

**Symptoms**: GPT Breeze can't connect to your local server

**Solutions**:

1. `export OLLAMA_ORIGINS="*"` then restart the server

### Issue: "Connection failed" or "Server not responding"

**Symptoms**: GPT Breeze can't connect to your local server

**Solutions**:

1. Verify your local server is running
2. Check the URL is correct (including the `/v1` path)
3. Ensure no firewall is blocking the connection
4. Try accessing the URL directly in your browser

### Issue: "Authentication failed"

**Symptoms**: Server rejects requests due to authentication

**Solutions**:

1. Leave the API Key field empty for most local servers
2. If your server requires authentication, consult its documentation for the correct key format
3. Try using "dummy-key" or "local" as a placeholder API key

### Issue: Slow responses or timeouts

**Symptoms**: Long delays or failed responses from local models

**Causes**: Local models can be slower than cloud APIs, especially on older hardware

**Solutions**:

1. Use smaller, faster models for better response times
2. Ensure sufficient RAM and processing power
3. Close other resource-intensive applications
4. Consider using quantized models for better performance

### Issue: Models giving poor quality responses

**Symptoms**: Responses are incoherent or low quality

**Solutions**:

1. Try different models to find one that works well for your use case
2. Adjust model parameters in your local server if supported
3. Ensure the model is fully loaded and not partially corrupted

### Getting Help

- Check your local server's documentation for specific configuration issues
- GPT Breeze treats custom servers as standard OpenAI-compatible endpoints
- Most connection issues are related to the local server setup rather than GPT Breeze

### Advanced Tips

- **Multiple servers**: You can configure multiple local servers and switch between them
- **Model switching**: Change models by reconfiguring your local server, not in GPT Breeze
- **Performance optimization**: Refer to your local server's documentation for performance tuning

**Result**: You should now be able to use local AI models privately and efficiently through GPT Breeze, with full control over your data and conversations.

---

*Stay connected with us on [X (Twitter)](https://x.com/gptBreeze_io) | [Youtube](https://www.youtube.com/@gptBreeze_io) | [Website: GPTBreeze.io](https://www.gptbreeze.io/) | [Chrome web store](https://chromewebstore.google.com/detail/gpt-breeze-chatgpt-ai-sho/plchckmceefljjjphgfcadhlfnlindog) | yourfriend@gptbreeze.io*
