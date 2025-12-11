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

[GPT Breeze](https://chrome.google.com/webstore/detail/gpt-breeze/bceemhpgndldchfglifbldmbgmebhdja) is a powerful browser extension that brings the power of AI to your fingertips. It's a "bring your own model" (BYOM) tool that supports various AI providers, including the ability to connect to local LLMs. This guide will walk you through setting up a local LLM with [Ollama](https://ollama.ai/) and integrating it with GPT Breeze for a truly private and customizable AI workflow.

## Why Use a Local LLM?

Before we dive into the setup, let's explore the benefits of using a local LLM:

*   **Privacy:** Your data never leaves your machine. This is crucial for sensitive information or for users who are simply uncomfortable sending their data to third-party servers.
*   **Control:** You have full control over the model you use. You can switch between different models, fine-tune them for specific tasks, and even create your own.
*   **Cost-Effective:** While there's an initial hardware investment, using a local LLM can be more cost-effective in the long run compared to paying for API access to cloud-based models.
*   **Offline Access:** Once you have a model downloaded, you can use it without an internet connection, making it a reliable tool for on-the-go productivity.

## Setting Up Your Local LLM with Ollama

Ollama is a fantastic tool that simplifies the process of running and managing local LLMs. It provides a simple command-line interface and an API server, making it easy to integrate with other applications like GPT Breeze.

### Step 1: Install Ollama

First, you'll need to install Ollama on your machine. Head over to the [Ollama website](https://ollama.ai/) and download the appropriate version for your operating system (macOS, Windows, or Linux). The installation process is straightforward and well-documented.

### Step 2: Download a Model

Once Ollama is installed, you can download a model to run locally. There are many models to choose from, each with its own strengths and weaknesses. For this tutorial, we'll use the `llama2` model, a popular and powerful open-source model from Meta.

Open your terminal and run the following command:

```bash
ollama run llama2
```

This command will download the `llama2` model and start a chat session in your terminal. You can close this session for now, as we'll be using GPT Breeze to interact with the model.

### Step 3: Start the Ollama Server

For GPT Breeze to communicate with your local LLM, the Ollama server needs to be running. By default, Ollama starts a server on `http://localhost:11434`. You can ensure the server is running by opening a new terminal window and running the following command:

```bash
ollama serve
```

Keep this terminal window open while you use GPT Breeze.

## Integrating Ollama with GPT Breeze

Now that you have your local LLM up and running, it's time to connect it to GPT Breeze.

### Step 1: Install GPT Breeze

If you haven't already, install the [GPT Breeze extension](https://chrome.google.com/webstore/detail/gpt-breeze/bceemhpgndldchfglifbldmbgmebhdja) from the Chrome Web Store.

### Step 2: Configure GPT Breeze for Local LLM

1.  Open the GPT Breeze extension settings. You can usually do this by clicking the extension icon in your browser's toolbar and selecting "Settings" or "Options."
2.  In the settings, navigate to the "AI Provider" or "Model" section.
3.  Select "Custom" or "Local LLM" from the list of providers.
4.  You'll be prompted to enter the API endpoint for your local LLM. For Ollama, this is typically `http://localhost:11434`.
5.  You may also need to specify the model you want to use. Enter `llama2` in the model name field.
6.  Save your settings.

### Step 3: Start Using Your Local LLM in the Browser

That's it! You can now use GPT Breeze to interact with your local LLM. Highlight text on any webpage, right-click, and select a GPT Breeze action (e.g., "Summarize," "Explain," "Translate"). The request will be sent to your local Ollama server, and the response will be displayed in your browser.

## Conclusion

By combining the power of local LLMs with the convenience of a browser extension like GPT Breeze, you can create a private, powerful, and customizable AI workflow. This setup gives you the best of both worlds: the cutting-edge capabilities of large language models and the peace of mind that comes with knowing your data is secure.

Ready to take control of your AI experience? [Install GPT Breeze from the Chrome Web Store](https://chrome.google.com/webstore/detail/gpt-breeze/bceemhpgndldchfglifbldmbgmebhdja) and start exploring the world of local LLMs today!
