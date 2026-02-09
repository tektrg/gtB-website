import { useRef } from 'react';
import { motion, useScroll } from 'framer-motion';
import { SlideUp, StaggerContainer, StaggerItem, ScaleIn } from '../ui/motion';
import { cn } from '../ui/motion';

type FeatureItem = {
    id?: string;
    title: string;
    description: string;
    list: string[];
    videoSrc: string;
    reverse?: boolean;
};

const features: FeatureItem[] = [
    {
        title: "Summarize YouTube videos",
        description: "Navigate long videos with clickable, time‑stamped sections. Extract transcripts and turn insights into one‑click AI shortcuts.",
        list: [
            "Web page summarization and follow‑up chat",
            "Highlight text: explain, translate, improve writing",
            "AI helps with tabs/history/bookmarks organization",
            "Switch between models (OpenAI, Anthropic, etc.)",
        ],
        videoSrc: "https://www.youtube.com/embed/pOXdFaqTszU?autoplay=1&mute=1&controls=0&loop=1&playlist=pOXdFaqTszU&modestbranding=1&rel=0&playsinline=1",
        reverse: false,
    },
    {
        title: "Web page summarization and chat",
        description: "Get concise bullet‑point summaries of long articles. Ask follow‑up questions and dig deeper without losing time.",
        list: [
            "One‑click summary on any page",
            "Ask clarifying questions as you read",
            "Extract key quotes and sections",
        ],
        videoSrc: "https://www.youtube.com/embed/SeR-G-5l25Q?autoplay=1&mute=1&controls=0&loop=1&playlist=SeR-G-5l25Q&modestbranding=1&rel=0&playsinline=1",
        reverse: true,
    },
    {
        title: "Assist your creation process",
        description: "Highlight text to get explanations, translations, or quick improvements. Turn repeated prompts into one‑click actions.",
        list: [
            "Explain complex concepts in context",
            "Translate selected text across languages",
            "Improve tone, clarity, and brevity",
        ],
        videoSrc: "https://www.youtube.com/embed/2WftJLH3Zoc?autoplay=1&mute=1&controls=0&loop=1&playlist=2WftJLH3Zoc&modestbranding=1&rel=0&playsinline=1",
        reverse: false,
    },
    {
        id: "byok",
        title: "Bring your own key",
        description: "Switch between models to match the task — faster for summaries, deeper for reasoning.",
        list: [
            "OpenAI, Anthropic, OpenRouter, local - such as Ollama and more (BYOK)",
            "Quickly swap models in the panel",
            "Save preferred settings as shortcuts",
        ],
        videoSrc: "https://www.youtube.com/embed/QS7TU0xuvDk?autoplay=1&mute=1&controls=0&loop=1&playlist=QS7TU0xuvDk&modestbranding=1&rel=0&playsinline=1",
        reverse: false,
    },
];

const FeatureCard = ({ feature, index }: { feature: FeatureItem; index: number }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    useScroll({
        target: containerRef,
        offset: ['start end', 'start start']
    });

    return (
        <div
            ref={containerRef}
            className="feature-card-container"
            style={{
                position: 'sticky',
                top: 0,
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: index + 1,
                // backgroundColor: 'var(--surface)', // Card-like white background
                // borderTop: '1px solid var(--border)', // Separator
                // borderRadius: '32px 32px 0 0', // Rounded card top
                // boxShadow: '0 -10px 30px rgba(0,0,0,0.03)', // Subtle depth shadow
            }}
        >
            <motion.div
                className="features-sbs"
                id={feature.id}
                style={{
                    width: '100%',
                    margin: 0, // Override CSS margins to ensure perfect centering
                    willChange: 'transform, opacity' // Optimization
                    // We can add more scroll-linked transforms here if desired,
                    // but for 'stacking', standard sticky behavior does most of the work.
                    // The 'scale' effect on *exit* of the underlying card would require
                    // knowing the scroll of the *next* card, or we can just animate *entry*.
                    // Let's stick to standard sticky first, maybe add subtle entry scale.
                }}
            >
                <div className={cn("features-grid", feature.reverse && "rev")}>
                    <ScaleIn className="features-video" delay={0.1}>
                        <div className="ratio" style={{ position: 'relative' }}>
                            <div className="placeholder">
                                <iframe
                                    title={`${feature.title} demo`}
                                    width="100%"
                                    height="100%"
                                    src={feature.videoSrc}
                                    allow="autoplay; encrypted-media; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    </ScaleIn>

                    <StaggerContainer className="features-text" viewport={{ margin: "-20%" }}>
                        <StaggerItem>
                            <h3>{feature.title}</h3>
                        </StaggerItem>
                        <StaggerItem>
                            <p>{feature.description}</p>
                        </StaggerItem>
                        <StaggerItem>
                            <ul className="features-list">
                                {feature.list.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </StaggerItem>
                    </StaggerContainer>
                </div>
            </motion.div>
        </div>
    );
};

export const Features = () => {
    return (
        <section id="features">
            <div className="container">
                <SlideUp>
                    <h2 className="section-title">Features</h2>
                </SlideUp>

                <div className="features-wrapper" style={{ position: 'relative' }}>
                    {features.map((feature, i) => (
                        <FeatureCard key={i} feature={feature} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
};
