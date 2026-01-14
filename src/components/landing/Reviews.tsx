import React from 'react';
import { SlideUp, StaggerContainer, StaggerItem } from '../ui/motion';

type Review = {
    name: string;
    avatar: string;
    date: string;
    text: string;
    source: "Chrome Web Store" | "Gumroad";
};

const reviewsChrome: Review[] = [
    {
        name: "Phil Berndt",
        avatar: "https://lh3.googleusercontent.com/a-/ALV-UjWlSnKqfvg_us9THTOIwGlMeHIYBGMKLP6wqXQMe4tdkgI6manj=s96-w96-h96",
        date: "May 19, 2025",
        text: "I picked up this extension a few months ago, back when they were just getting started. I had to pause using it for a little while because of some performance hiccups, but it seems like those issues are all sorted now. There were a few bugs along the way, but I really appreciate how much the developer listens to feedback. In fact, they even added one of my suggestions—being able to add custom icons to custom prompts! Big thanks to the devs for that!",
        source: "Chrome Web Store"
    },
    {
        name: "Phat Pham",
        avatar: "https://lh3.googleusercontent.com/a-/ALV-UjWqhtCE40fXQYmEg50_Qziz64HYxS-jyudqh5tcqMwIo4zFPq4=s96-w96-h96",
        date: "Mar 7, 2025",
        text: "beautiful UI with great summary feature on Youtube",
        source: "Chrome Web Store"
    },
    {
        name: "Kehao Chen",
        avatar: "https://lh3.googleusercontent.com/a-/ALV-UjUrHBx_-lHLlajmV5L25SXtmYm99QcM5-gw436XEIB6dKLwAQ1HBw=s96-w96-h96",
        date: "Mar 2, 2025",
        text: "While searching for alternatives to HAPRA AI, I discovered this Chrome extension. My requirements are simple: I need assistance with summarizing web pages and YouTube transcripts, the ability to interact with web content, and, importantly, the option to use my own API key for pay-as-you-go billing instead of a subscription model. GPT Breeze meets all my needs and requires only a one-time purchase. It has become an indispensable tool in my daily life.",
        source: "Chrome Web Store"
    },
    {
        name: "Pete Z",
        avatar: "https://lh3.googleusercontent.com/a-/ALV-UjW7NofjXItdcqljn5AizOH9axqGEOX7jNTnXmXibUw90_KQxMR4yg=s96-w96-h96",
        date: "Dec 13, 2024",
        text: "Exactly what I've been looking for! And love that I can use my ChatGPT API. The custom prompt feature is efficient for quick explanations and rewrites, providing clear messages that maintain my original intent. I appreciate how it allows me to adjust the tone for different professional or casual audiences. Overall, it's a valuable tool for enhancing messaging efficiency.",
        source: "Chrome Web Store"
    },
    {
        name: "Nguyen Huong",
        avatar: "https://lh3.googleusercontent.com/a-/ALV-UjXlrW4S-2Y-Edv0FPpdoyrRHoOEXzMhxeINfeC3PrNywNqE7LI=s96-w96-h96",
        date: "Aug 28, 2024",
        text: "This one is great, no requires an account or login, can use different AI models and free, wow",
        source: "Chrome Web Store"
    },
    {
        name: "Notion Promax",
        avatar: "https://lh3.googleusercontent.com/a-/ALV-UjVA1tzvtL-cb25JNafbAjl4AoPe7iD3Uza0mL4OiBHHm-qEgXE=s96-w96-h96",
        date: "Aug 6, 2024",
        text: "The ChatGPT web session was convenient, but it sometimes failed to respond. After switching to the API key, it has become fast and reliable. 4 stars, but consider the fact that it's free, 5 then.",
        source: "Chrome Web Store"
    }
];

const reviewsGumroad: Review[] = [
    {
        name: "Phil",
        avatar: "https://assets.gumroad.com/assets/gumroad-default-avatar-5-623b6723477dd15920db554b0a4e9aac6a5e41159fd3d7bb4c9f9745a44e4f85.png",
        date: "",
        text: "I picked up this extension a few months ago, back when they were just getting started. I had to pause using it for a little while because of some performance hiccups, but it seems like those issues are all sorted now. There were a few bugs along the way, but I really appreciate how much the developer listens to feedback. In fact, they even added one of my suggestions—being able to add custom icons to custom prompts! Big thanks to the devs for that!",
        source: "Gumroad"
    },
    {
        name: "Pete",
        avatar: "https://assets.gumroad.com/assets/gumroad-default-avatar-5-623b6723477dd15920db554b0a4e9aac6a5e41159fd3d7bb4c9f9745a44e4f85.png",
        date: "",
        text: "This is the upgrade to ChatGPT I've been looking for!! Many that (try to) resemble this app, charge subscriptions and don't even measure up to GPT Breeze. Thank you, Developer(s)!",
        source: "Gumroad"
    },
    {
        name: "Anonimm",
        avatar: "https://assets.gumroad.com/assets/gumroad-default-avatar-5-623b6723477dd15920db554b0a4e9aac6a5e41159fd3d7bb4c9f9745a44e4f85.png",
        date: "",
        text: "Just wanted to share my experience with GPT Breeze - this Chrome extension is seriously awesome! 🙌 Started with the free version and honestly, I love it. Being able to chat with AI right on any webpage while browsing? Game changer! After seeing how much time it saved me, upgrading to premium was a no-brainer.",
        source: "Gumroad"
    },
    {
        name: "Tri Vo",
        avatar: "https://assets.gumroad.com/assets/gumroad-default-avatar-5-623b6723477dd15920db554b0a4e9aac6a5e41159fd3d7bb4c9f9745a44e4f85.png",
        date: "",
        text: "I love how the team create this Premium option. As a frequent user of AI application, I always try to support the builder. GPT Breeze helps me in my workflow from Youtube videos to content writing, so that I think paying for its premium features is a bargain for me. Keep up the good work, team!",
        source: "Gumroad"
    }
];

const RatingStars = () => (
    <span className="review-stars text-accent-star" aria-label="5 out of 5 stars" title="5 out of 5">
        {[...Array(5)].map((_, i) => (
            <svg key={i} style={{ width: 14, height: 14 }} viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.5l2.97 6.02 6.65.97-4.81 4.69 1.14 6.63L12 17.77 6.05 20.81l1.14-6.63L2.38 9.49l6.65-.97L12 2.5z" /></svg>
        ))}
    </span>
);

const ReviewCard = ({ review }: { review: Review }) => (
    <StaggerItem>
        <div>
            <div className="inline" style={{ gap: 10, alignItems: 'center' }}>
                <img
                    src={review.avatar}
                    alt={`Avatar of ${review.name}`}
                    width="36"
                    height="36"
                    style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid theme("colors.ui-border")' }}
                    loading="lazy"
                />
                <div>
                    <div style={{ fontWeight: 700 }}>{review.name}</div>
                    <div className="muted" style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {review.date && <span>{review.date}</span>}
                        <RatingStars />
                    </div>
                </div>
            </div>
            <p className="muted" style={{ margin: '8px 0 0' }}>{review.text}</p>
        </div>
    </StaggerItem>
);

export const Reviews = () => {
    return (
        <section id="reviews">
            <div className="container">
                <SlideUp>
                    <h2 className="section-title">Customer Reviews</h2>
                </SlideUp>

                <div className="card">
                    <p className="muted">Reviews from Chrome Web Store</p>
                    <StaggerContainer className="stack" style={{ marginTop: 12, gap: 14 }}>
                        {reviewsChrome.map((review, i) => (
                            <ReviewCard key={i} review={review} />
                        ))}
                    </StaggerContainer>
                </div>

                <div className="card" style={{ marginTop: 24 }}>
                    <p className="muted">Reviews from Gumroad</p>
                    <StaggerContainer className="stack" style={{ marginTop: 12, gap: 14 }}>
                        {reviewsGumroad.map((review, i) => (
                            <ReviewCard key={i} review={review} />
                        ))}
                    </StaggerContainer>
                </div>
            </div>
        </section>
    );
};
