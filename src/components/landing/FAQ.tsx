import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlideUp } from '../ui/motion';
import { cn } from '../ui/motion';

type FAQItemProps = {
    question: string;
    answer: React.ReactNode;
};

const FAQItem = ({ question, answer }: FAQItemProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-ui-border last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between py-4 text-left font-medium focus:outline-none"
                aria-expanded={isOpen}
            >
                <span>{question}</span>
                <span className={cn("ml-4 transition-transform duration-200", isOpen ? "rotate-45" : "rotate-0")}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </span>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="pb-4 text-muted">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const FAQ = () => {
    return (
        <section id="faq">
            <div className="container">
                <SlideUp>
                    <h2 className="section-title">F.A.Q</h2>
                </SlideUp>

                <div className="stack divide-y divide-ui-border" style={{ marginTop: 12 }}>
                    <FAQItem
                        question="What is GPT Breeze?"
                        answer={
                            <>
                                <p>GPT Breeze is a simple AI Chrome extension. It helps with various tasks you do on the internet, such as summarizing YouTube videos and web articles. It also helps you improve your writing and answer any questions. Compared to ChatGPT, GPT Breeze operates right in your current tab, saving you the effort of switching tabs and copying and pasting.</p>
                                <p className="mt-2">It's FREE to use, with the option to unlock advanced features such as custom AI shortcuts with the purchase of a license key.</p>
                                <p className="mt-2">The word "breeze" means something easy to achieve. Its vision is to make AI easier to use anywhere and help users maximize productivity while browsing.</p>
                            </>
                        }
                    />
                    <FAQItem
                        question="GPT Breeze is free without usage limit, why and how?"
                        answer={
                            <>
                                <p>We struggled to find a good, free extension for basic AI (LLM) functions like summarizing YouTube videos or page content. Most options come with a monthly subscription or strict usage limits for free users.</p>
                                <p className="mt-2">GPT Breeze is the little tool that you use to interact with your chosen AI model, via either web sessions or your API key, we don't host AI models ourself. In other word, it's Bring your own model approach. Developing such an extension costs us very little to maintain. Therefore, we decided to make it free to use.</p>
                                <p className="mt-2">However it's important to highlight that while GPT Breeze is free and has no usage limits, the AI models you use are subject to their policies. If you use an API key, it operates on a pay-as-you-go basis.</p>
                                <p className="mt-2">We make money by adding premium features for advanced users, such as the ability to create custom AI shortcuts to optimize their workflow.</p>
                            </>
                        }
                    />
                    <FAQItem
                        question="How does GPT Breeze guarantee privacy and data security?"
                        answer={
                            <>
                                <p>GPT Breeze prioritizes your privacy by not processing your conversation data on our server. Instead, it sends the conversation directly to your chosen AI (e.g., ChatGPT, Bing Copilot, Claude). Therefore, we do not store any of your personal data or conversations with the AI on our server. Read more on our <a href="/privacy" className="underline">privacy policy</a>.</p>
                                <p className="mt-2">You don't even need to create an account to use GPT Breeze.</p>
                            </>
                        }
                    />
                    <FAQItem
                        question="Can I get a refund?"
                        answer={
                            <p>You can apply for a refund within 24 hours after the purchase by sending the application to <a href="mailto:contact@gptbreeze.io" className="underline">contact@gptbreeze.io</a>. Please state the reason for your refund request in your application.</p>
                        }
                    />
                    <FAQItem
                        question="How to use GPT Breeze"
                        answer={
                            <p>Install the extension, open the panel with the toolbar button, then run shortcuts on tabs, videos, text, or pages.</p>
                        }
                    />
                </div>
            </div>
        </section>
    );
};
