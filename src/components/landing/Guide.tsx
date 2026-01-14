import React from 'react';
import { SlideUp, StaggerContainer, StaggerItem } from '../ui/motion';

const guides = [
    {
        title: "Installation",
        description: "Add the Chrome extension and pin it for quick access.",
        link: "https://gptbreezedocs.notion.site/Installation-1fd731c621058179ad50e0b5dbf411e7"
    },
    {
        title: "UI options",
        description: "Customize shortcuts and layout from Settings.",
        link: "https://gptbreezedocs.notion.site/UI-options-1fd731c62105812d8526cb78c0a594d5"
    },
    {
        title: "Setup AI model",
        description: "Use your own API key for OpenAI, Anthropic, etc.",
        link: "https://gptbreezedocs.notion.site/Setup-AI-model-1fd731c62105816894b1ca65eeb18aec"
    },
    {
        title: "Get a license key",
        description: "Unlock paid features with a one‑time purchase.",
        link: "https://gptbreezedocs.notion.site/Get-GPT-Breeze-license-key-1fd731c621058179af8ff75d2d7adea4"
    },
    {
        title: "Get an OpenAI API Key",
        description: "Create an OpenAI account and generate a secure set up billing information for usage.",
        link: "https://gptbreezedocs.notion.site/Get-an-OpenAI-API-Key-1fd731c62105816ab1f6f6427942f259"
    },
    {
        title: "Use Openrouter.ai",
        description: "Openrouter.ai provides access to various AI language models via a unified API endpoint. See how to use it with GPT Breeze extension",
        link: "https://gptbreezedocs.notion.site/Use-Openrouter-ai-1fd731c6210581cf98b8e30d8d3e8fc8"
    },
    {
        title: "Using Local AI Models (Ollama) with GPT Breeze",
        description: "Run your own AI models locally while maintaining privacy and reducing costs with GPT Breeze's custom model server support.",
        link: "https://gptbreezedocs.notion.site/Using-Local-AI-Models-with-GPT-Breeze-User-Guide-252731c62105818583d8de500e941a04"
    }
];

export const Guide = () => {
    return (
        <section id="guide">
            <div className="container">
                <SlideUp>
                    <h2 className="section-title">Guide</h2>
                </SlideUp>

                <StaggerContainer className="two" style={{ marginTop: 12 }}>
                    {guides.map((item, i) => (
                        <StaggerItem key={i}>
                            <a className="card block h-full hover:border-ui-border-hover transition-colors" href={item.link} target="_blank" rel="noopener noreferrer">
                                <h3>{item.title}</h3>
                                <p className="muted">{item.description}</p>
                            </a>
                        </StaggerItem>
                    ))}
                </StaggerContainer>

                <SlideUp delay={0.2}>
                    <p style={{ marginTop: 12 }} className="muted">Learn more in the documentation.</p>
                </SlideUp>
            </div>
        </section>
    );
};
