import { SlideUp } from '../ui/motion';

export const Privacy = () => {
    return (
        <section id="privacy">
            <div className="container">
                <SlideUp>
                    <h2 className="section-title">Privacy policy</h2>
                    <p className="muted">
                        We prioritize privacy and data security. BYO API keys stay on your device and requests go directly to providers when feasible. Minimal telemetry, no selling of personal data.
                        <br />
                        <span>Read more at <a href="/privacy">privacy policy</a></span>
                    </p>
                </SlideUp>
            </div>
        </section>
    );
};

export const Contact = () => {
    return (
        <section id="contact">
            <div className="container two">
                <SlideUp className="card">
                    <h3>Get in touch</h3>
                    <p className="stack">
                        <span><a href="https://x.com/gptBreeze_io" rel="noopener noreferrer">X (Twitter)</a></span>
                        <span><a href="https://www.youtube.com/channel/UCLQy78epuhpwyJHdejH8kYA" rel="noopener noreferrer">YouTube</a></span>
                        <span><a href="https://chromewebstore.google.com/detail/gpt-breeze-ai-shortcuts-y/plchckmceefljjjphgfcadhlfnlindog" rel="noopener noreferrer">Chrome Web Store</a></span>
                        <span>Email: <a href="mailto:yourfriend@gptbreeze.io">yourfriend@gptbreeze.io</a></span>
                    </p>
                </SlideUp>

                <SlideUp delay={0.2} className="card center">
                    <h3>Join thousands saving time</h3>
                    <p className="muted">Boost your focus and ship faster.</p>
                    <p><a className="cta" href="https://chromewebstore.google.com/detail/gpt-breeze-ai-shortcuts-y/plchckmceefljjjphgfcadhlfnlindog">Get GPT Breeze</a></p>
                </SlideUp>
            </div>
        </section>
    );
};
