import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { StaggerContainer, StaggerItem, ScaleIn, ParallaxScroll } from '../ui/motion';
import { cn } from '../ui/motion';

declare global {
    interface Window {
        gtag?: (command: string, action: string, params?: Record<string, unknown>) => void;
    }
}

export const Hero = () => {
    const [showVideo, setShowVideo] = useState(false);
    const [email, setEmail] = useState('');

    const wordVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 10 } }
    };

    const headingVariants: Variants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    // ... handleEmailSubmit ...

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        // Track email submission with Google Analytics if available
        if (window.gtag) {
            window.gtag('event', 'mobile_email_submit', {
                'event_category': 'engagement',
                'event_label': email,
                'value': 1
            });
        }

        const subject = encodeURIComponent('GPT Breeze - Chrome Extension Info');
        const body = encodeURIComponent(
            'Hi there!\n\n' +
            'Thank you for your interest in GPT Breeze!\n\n' +
            'GPT Breeze is a powerful Chrome extension that helps you save time with AI summaries, tab management, and one-click shortcuts for YouTube, selected text, and any website.\n\n' +
            'Install GPT Breeze for Chrome:\n' +
            'https://chromewebstore.google.com/detail/gpt-breeze-ai-shortcuts-y/plchckmceefljjjphgfcadhlfnlindog\n\n' +
            'Best regards,\nGPT Breeze Team'
        );

        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
        setEmail('');
    };

    return (
        <section id="home" className="hero">
            <div className="container">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" style={{ zIndex: 0 }}>
                    <motion.div
                        animate={{
                            x: ["-20%", "20%"],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            repeatType: "mirror",
                            ease: "easeInOut",
                        }}
                        className="absolute top-[-30%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-accent-blue-light blur-[80px] opacity-60 mix-blend-multiply"
                    />
                    <motion.div
                        animate={{
                            x: ["20%", "-20%"],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 7,
                            repeat: Infinity,
                            repeatType: "mirror",
                            ease: "easeInOut",
                        }}
                        className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-100 blur-[80px] opacity-60 mix-blend-multiply"
                    />
                </div>

                {/* Text Content */}
                <StaggerContainer className="relative z-10 flex flex-col items-center">
                    <motion.h1
                        className="display"
                        variants={headingVariants}
                    >
                        <motion.span variants={wordVariants} className="inline-block mr-[0.2em]">Save</motion.span>
                        <motion.span variants={wordVariants} className="em inline-block mr-[0.2em]">hours</motion.span>
                        <br className="hidden sm:inline" />
                        {["consuming", "long", "content", "on", "the", "web"].map((word, i) => (
                            <motion.span key={i} variants={wordVariants} className="inline-block mr-[0.25em] last:mr-0">{word}</motion.span>
                        ))}
                    </motion.h1>

                    <StaggerItem delay={0.1}>
                        <p className="lead center" style={{ maxWidth: '720px', marginInline: 'auto' }}>
                            GPT Breeze Extension summarizes YouTube videos and articles, accelerates your writing, by saving your prompts as one-click shortcuts.
                        </p>
                    </StaggerItem>

                    <StaggerItem delay={0.2}>
                        <div className="rating-badge" aria-label="Chrome Web Store rating">
                            <div className="rating-top">
                                <img className="logo" src="https://fonts.gstatic.com/s/i/productlogos/chrome_store/v7/192px.svg" alt="" width="22" height="22" loading="lazy" />
                                <div className="stars" aria-hidden="true">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.97 6.02 6.65.97-4.81 4.69 1.14 6.63L12 17.77 6.05 20.81l1.14-6.63L2.38 9.49l6.65-.97L12 2.5z" /></svg>
                                    ))}
                                </div>
                            </div>
                            <span className="rating-text"><strong style={{ color: 'theme("colors.brand-fg")' }}>4.9 stars</strong> on Chrome Web Store</span>
                        </div>
                    </StaggerItem>

                    <StaggerItem delay={0.3} className="hero-actions w-full flex justify-center">
                        <a className="btn primary desktop-cta" href="https://chromewebstore.google.com/detail/gpt-breeze-ai-shortcuts-y/plchckmceefljjjphgfcadhlfnlindog">
                            Add to Chrome for free
                        </a>
                        <form className="mobile-email-form" onSubmit={handleEmailSubmit}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                required
                                aria-label="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button type="submit" className="btn primary">Remind me via email</button>
                        </form>
                    </StaggerItem>
                </StaggerContainer>

                {/* Hero Media / Video */}
                <ParallaxScroll offset={40} className="hero-media-container">
                    <ScaleIn delay={0.4} className="hero-media">
                        <div className="device-frame">
                            <div className="ratio">
                                {!showVideo ? (
                                    <div
                                        className="yt-lite"
                                        role="button"
                                        aria-label="Play product overview video"
                                        style={{ backgroundImage: "url('/media/hero/gpt-breeze-hero-video-placeholder-1280x800.jpg')" }}
                                        tabIndex={0}
                                        onClick={() => setShowVideo(true)}
                                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setShowVideo(true)}
                                    >
                                        <button className="play" aria-label="Play video"></button>
                                    </div>
                                ) : (
                                    <iframe
                                        src="https://www.youtube-nocookie.com/embed/y4LZe_S0H-0?rel=0&modestbranding=1&autoplay=1"
                                        title="GPT Breeze overview"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            width: '100%',
                                            height: '100%',
                                            border: 0
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </ScaleIn>
                </ParallaxScroll>
            </div>
        </section>
    );
};
