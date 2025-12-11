---
title: "How to Use Local LLMs with GPT Breeze for Ultimate Privacy and Control"
description: "Unlock the full potential of local LLMs with GPT Breeze. This guide shows you how to set up Ollama and use it with the GPT Breeze browser extension for a private and powerful AI experience."
pubDate: 2024-07-30
author: "Jules"
tags: ["local llm", "gpt breeze", "ollama", "ai privacy", "browser extension"]
draft: false
---

## Introduction

In the rapidly evolving landscape of AI, privacy and control are paramount. While cloud-based AI models offer convenience, they often come with privacy trade-offs. This is where local Large Language Models (LLMs) shine. By running an LLM directly on your own machine, you can ensure that your data remains private and you have complete control over your AI experience.

[GPT Breeze](https://chrome.google.com/webstore/detail/gpt-breeze/bceemhpgndldchfglifbldmbgmebhdja) is a powerful browser extension that brings the power of AI to your fingertips. It's a "bring your own model" (BYOM) tool that supports various AI providers, including any local AI model server with an OpenAI-compatible API.

This guide will walk you through setting up a local LLM with [Ollama](https://ollama.ai/) and integrating it with GPT Breeze for a truly private and customizable AI workflow.

## Why Use a Local LLM?

Before we dive into the setup, let's explore the key benefits of using a local LLM with GPT Breeze:

*   **Complete Data Privacy:** Your data never leaves your machine. This is crucial for sensitive information or for users who are simply uncomfortable sending their data to third-party servers. All conversations stay on your device.
*   **Reduce Costs:** While there's an initial hardware investment, using a local LLM eliminates API fees, making it more cost-effective in the long run.
*   **Work Offline:** Once a model is downloaded, you can use it without an internet connection, making it a reliable tool for on-the-go productivity.
*   **Choose Any Model:** You have full control over the model you use. You can switch between different models, run specialized or fine-tuned models for your specific needs, and even create your own.

## Getting Started with Ollama

### What You'll Need

- A local model server running on your computer. We recommend Ollama for its ease of use.
- Basic understanding of your local server's configuration.
- 5-10 minutes for initial setup.

### Ollama (Recommended for Beginners)

**Best for**: Easy setup and model management

- **Default URL**: `http://127.0.0.1:11434/v1`
- **Why choose Ollama**: Simple installation, extensive model library, and automatic model management.
- **Getting started**: Visit [ollama.ai](http://ollama.ai) for installation instructions.

## Setting Up Your Local Server

### Step 1: Install Ollama

First, you'll need to install Ollama on your machine. Head over to the [Ollama website](https://ollama.ai/) and download the appropriate version for your operating system (macOS, Windows, or Linux). The installation process is straightforward and well-documented.

### Step 2: Download a Model

Once Ollama is installed, you can download a model to run locally. For this tutorial, we'll use `llama2`, a popular and powerful open-source model.

Open your terminal and run the following command:

```bash
ollama pull llama2
```

### Step 3: Start the Server

Start your local server according to its documentation. For GPT Breeze to communicate with your local LLM, the Ollama server needs to be running.

```bash
export OLLAMA_ORIGINS="*"
ollama serve > /dev/null 2>&1 &
```

> 💡 The `export OLLAMA_ORIGINS="*"` command is important to prevent "Forbidden" errors when the extension tries to access the server.

**Verification**: Open your browser and visit your server's URL (e.g., `http://127.0.0.1:11434`). You should see a confirmation that the server is running.

## Configuring GPT Breeze

### Adding Your Local Server

1.  **Open GPT Breeze settings**: Click the extension icon and navigate to the **Settings** or **Credentials** section.
2.  **Add a new custom provider**: Click "Add Provider" and select "Custom" as the provider type.
3.  **Enter your server details**:
    *   **Name**: Give your server a recognizable name (e.g., "My Ollama Server").
    *   **Base URL**: Enter your server's URL: `http://127.0.0.1:11434/v1`.
    *   **API Key**: Leave empty or enter "dummy-key" (most local servers don't require one).
4.  **Save and test**: Save your configuration and try a test prompt to verify the connection.

## Troubleshooting Common Issues

### Issue: "Forbidden" or "Connection failed"
- **Solution**: Ensure you have set `export OLLAMA_ORIGINS="*"` and restarted the server. Verify the server is running and the URL is correct, including the `/v1` path. Check for firewalls blocking the connection.

### Issue: "Authentication failed"
- **Solution**: Leave the API Key field empty. Most local servers do not require authentication.

### Issue: Slow responses or timeouts
- **Solution**: Local models can be slower. Use smaller, quantized models for better performance and ensure your computer has sufficient RAM.

### Issue: Poor quality responses
- **Solution**: Try different models to find one that suits your use case. Ensure the model is fully downloaded and not corrupted.

## Conclusion

By combining the power of local LLMs with the convenience of a browser extension like GPT Breeze, you can create a private, powerful, and customizable AI workflow. This setup gives you the best of both worlds: the cutting-edge capabilities of large language models and the peace of mind that comes with knowing your data is secure. You are now able to use local AI models privately and efficiently, with full control over your data and conversations.

Ready to take control of your AI experience? [Install GPT Breeze from the Chrome Web Store](https://chrome.google.com/webstore/detail/gpt-breeze/bceemhpgndldchfglifbldmbgmebhdja) and start exploring the world of local LLMs today!

---

*Stay connected with us on [X (Twitter)](https://x.com/gptBreeze_io) | [Youtube](https://www.youtube.com/@gptBreeze_io) | [Website: GPTBreeze.io](https://www.gptbreeze.io/) | [Chrome web store](https://chromewebstore.google.com/detail/gpt-breeze-chatgpt-ai-sho/plchckmceefljjjphgfcadhlfnlindog) | yourfriend@gptbreeze.io*
