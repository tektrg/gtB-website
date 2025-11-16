# Analytics & Conversion Tracking Setup

## Overview

This document outlines the analytics and conversion tracking implementation for GPT Breeze landing pages. The tracking strategy is designed to measure landing page performance, user engagement, and conversion optimization.

## Google Analytics Configuration

### Property Details
- **GA4 Property ID**: G-30EX1TYBPM
- **Implementation**: Global site tag (gtag.js)
- **Scope**: All pages including landing pages

## Event Tracking Strategy

### 1. Landing Page Views
**Event Name**: `landing_page_view`
**Trigger**: Automatic on page load for landing pages
**Parameters**:
- `page_type`: Landing page identifier (e.g., `for_researchers`, `privacy_first`)
- `page_location`: Full URL
- `page_title`: Page title

**Purpose**: Track which landing pages are receiving traffic and measure organic vs. paid traffic performance.

### 2. Primary Conversion Tracking
**Event Name**: `chrome_extension_click`
**Trigger**: Click on Chrome Web Store links
**Parameters**:
- `landing_page`: Source landing page
- `button_text`: Actual button text clicked
- `button_location`: Primary or secondary button placement

**Purpose**: Track the main conversion goal - Chrome extension installations from each landing page.

### 3. Secondary CTA Tracking
**Event Name**: `secondary_cta_click`
**Trigger**: Clicks on secondary actions (blog links, guides, anchor links)
**Parameters**:
- `action_type`: Type of action (`scroll_to_section`, `blog_visit`, `guide_access`)
- `landing_page`: Source landing page
- `button_text`: Button text

**Purpose**: Measure user engagement and interest in learning more about the product.

### 4. Engagement Metrics

#### Scroll Depth Tracking
**Event Name**: `scroll_depth`
**Trigger**: At 25%, 50%, 75%, and 90% scroll thresholds
**Parameters**:
- `depth`: Scroll percentage milestone
- `landing_page`: Source page

**Purpose**: Measure content engagement and identify where users lose interest.

#### Session Engagement
**Event Name**: `engaged_session`
**Trigger**: After 30+ seconds on page
**Parameters**:
- `time_on_page`: Session duration in seconds
- `landing_page`: Source page

**Purpose**: Identify quality traffic and engaged visitors.

### 5. Form Submissions (Future)
**Event Name**: `form_submit`
**Trigger**: Any form submission
**Parameters**:
- `form_type`: Form identifier
- `landing_page`: Source page

**Purpose**: Track future lead generation forms or newsletter signups.

## Key Performance Indicators (KPIs)

### Primary Metrics
1. **Conversion Rate**: `chrome_extension_click` events / landing page views
2. **Engagement Rate**: `engaged_session` events / landing page views
3. **Content Completion**: `scroll_depth` at 75%+ / landing page views

### Secondary Metrics
1. **Bounce Rate**: Sessions with no engagement events
2. **Time on Page**: Average session duration
3. **CTA Performance**: Click-through rates by button type and position

### Landing Page Comparison
- Conversion rate by landing page type
- Traffic quality by source landing page
- User journey patterns across different audiences

## Analytics Dashboard Setup

### Custom Events in GA4
All events are automatically sent to GA4 and can be found in:
- **Reports > Engagement > Events**
- **Configure > Custom Definitions > Custom Events**

### Recommended Custom Reports
1. **Landing Page Performance**
   - Dimension: `page_type`
   - Metrics: Page views, `chrome_extension_click`, conversion rate

2. **CTA Analysis**
   - Dimension: `button_text`, `button_location`
   - Metrics: Click count, conversion rate by CTA

3. **Engagement Analysis**
   - Dimension: `landing_page`
   - Metrics: `engaged_session`, `scroll_depth`, average time on page

### Goals and Conversions
Set up the following conversions in GA4:
1. **Primary**: `chrome_extension_click` (Main conversion)
2. **Secondary**: `engaged_session` (Engagement indicator)
3. **Tertiary**: `scroll_depth` with depth=75 (Content engagement)

## A/B Testing Framework

### Recommended Tests
1. **Headline Variations**: Test different value propositions
2. **CTA Text**: Test button text variations
3. **Social Proof**: Test different testimonial placements
4. **Pricing Presentation**: Test different cost comparison approaches

### Implementation
Use Google Optimize or similar A/B testing tools to:
1. Split traffic between variations
2. Track conversion differences
3. Measure statistical significance
4. Implement winning variations

## Privacy Compliance

### Data Collection
- Only tracks anonymous behavior data
- No personally identifiable information collected
- Complies with GDPR and CCPA requirements
- Uses Google Analytics' standard privacy controls

### Data Retention
- Follow Google Analytics default retention (14 months)
- Can be adjusted in GA4 property settings if needed

## Performance Monitoring

### Daily Checks
- Landing page traffic levels
- Conversion rate trends
- Error tracking (404s, broken links)

### Weekly Analysis
- Landing page performance comparison
- CTA effectiveness analysis
- User journey patterns

### Monthly Review
- Overall conversion rate trends
- Cost per acquisition analysis
- Landing page optimization opportunities

## Integration with Marketing Campaigns

### UTM Parameter Strategy
Use consistent UTM parameters for paid campaigns:
- `utm_source`: Traffic source (google, facebook, linkedin)
- `utm_medium`: Medium type (cpc, social, email)
- `utm_campaign`: Campaign name
- `utm_content`: Ad variation or A/B test
- `utm_term`: Target keyword (for search ads)

### Campaign Attribution
Track campaign performance by:
1. Landing page destination
2. Conversion rate by traffic source
3. Cost per conversion by campaign
4. Lifetime value by acquisition channel

## Technical Implementation Notes

### Event Tracking Code Location
- **File**: `/src/layouts/Base.astro`
- **Section**: Enhanced Google Analytics script
- **Load Order**: After GA4 initialization

### Browser Compatibility
- Modern browsers with JavaScript enabled
- Graceful degradation for users with disabled JavaScript
- No impact on page performance or user experience

### Debugging
Use Google Analytics Debugger extension or GA4 DebugView to:
1. Verify events are firing correctly
2. Check parameter accuracy
3. Troubleshoot tracking issues

## Future Enhancements

### Planned Additions
1. **Heatmap Integration**: Add Hotjar or similar for visual analysis
2. **Enhanced Attribution**: Multi-touch attribution modeling
3. **Predictive Analytics**: Use GA4 machine learning insights
4. **Cross-Platform Tracking**: Connect with Chrome extension usage data

### Advanced Tracking
1. **Video Engagement**: Track demo video completion rates
2. **Element Visibility**: Track which sections users actually see
3. **Mouse Movement**: Advanced user behavior analysis
4. **Device Performance**: Track performance by device type

## Contact and Maintenance

### Analytics Access
- Primary account holder manages GA4 property
- Development team has view access for debugging
- Marketing team has edit access for campaign tracking

### Regular Maintenance
- Monthly review of tracking accuracy
- Quarterly assessment of KPI relevance
- Annual audit of data collection practices
- Continuous optimization based on insights

---

This tracking implementation provides comprehensive visibility into landing page performance while maintaining user privacy and enabling data-driven optimization decisions.