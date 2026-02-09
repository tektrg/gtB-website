import { SlideUp, StaggerContainer, StaggerItem } from '../ui/motion';

const useCases = [
    {
        title: "For Researchers",
        description: "Summarize academic papers, analyze documents, and extract key insights instantly.",
        link: "/for-researchers"
    },
    {
        title: "For Content Creators",
        description: "Accelerate video research and content planning with AI-powered YouTube summaries.",
        link: "/for-creators"
    },
    {
        title: "For Power Users",
        description: "Advanced shortcuts, custom workflows, and seamless integration with your favorite tools.",
        link: "/for-power-users"
    },
    {
        title: "For Teams",
        description: "Streamline collaboration with shared AI shortcuts and consistent productivity workflows.",
        link: "/for-teams"
    },
    {
        title: "For Educators",
        description: "Create lesson plans, summarize educational content, and enhance teaching materials.",
        link: "/for-educators"
    }
];

export const UseCases = () => {
    return (
        <section id="use-cases">
            <div className="container">
                <SlideUp>
                    <h2 className="section-title">Perfect for Every User Type</h2>
                    <p className="subtle">Discover how GPT Breeze adapts to your specific workflow and productivity needs.</p>
                </SlideUp>

                <StaggerContainer className="two" style={{ marginTop: 12 }}>
                    {useCases.map((item, i) => (
                        <StaggerItem key={i}>
                            <a className="card block h-full hover:border-ui-border-hover transition-colors" href={item.link} rel="noopener">
                                <h3>{item.title}</h3>
                                <p className="muted">{item.description}</p>
                            </a>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
};
