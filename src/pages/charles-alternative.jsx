import React from 'react';
import Helmet from 'react-helmet';
import { Link } from 'gatsby';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { siteMetadata } from '../../gatsby-config.js';

import { styled, media } from '../styles';

import { Layout } from '../components/layout';
import { EmailSignupModal } from '../components/email-signup-modal';
import { StandaloneDownloadCTA } from '../components/cta';
import { DemoVideo } from '../components/demo-video';
import { ProductLdData } from '../components/product-ld-data.jsx';

import { TopHeroContainer } from '../components/pitch/leading-pitch';
import { FuturePlans } from '../components/pitch/future-plans';
import { TrailingPitchBlock } from '../components/pitch/trailing-pitch';

import { Testimonials } from '../components/testimonials.jsx';
import { SectionSpacer } from '../components/section-spacer.jsx';

import { InterceptFeature } from '../components/features/intercept';
import { InspectFeature } from '../components/features/inspect';
import { MockFeature } from '../components/features/mock';
import { EditFeature } from '../components/features/edit';
import { BreakpointFeature } from '../components/features/breakpoint';

const Heading = styled.h1`
    ${p => p.theme.fontSizeHeading};
    font-weight: bold;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;

    ${media.desktop`
        margin-bottom: 110px;
    `}

    ${media.mobileOrTablet`
        margin-bottom: 60px;
    `}
`;

const Highlight = styled.span`
    color: ${p => p.theme.popColor};
    font-weight: bold;
`;

const SubHeading = styled.h2`
    ${p => p.theme.fontSizeNearlyHeading};
    margin: 0 auto;
    max-width: 920px;

    ${media.mobileOrTablet`
        margin-bottom: 60px;

        br {
            display: inline;
            content: ' ';
            clear: none;

            &:before {
                content: ' ';
            }
        }
    `}

    ${media.tablet`
        padding: 0 20px;
    `}

    ${media.mobile`
        padding: 0 10px;
    `}

    ${media.desktop`
        margin-bottom: 120px;
    `}

    text-align: center;
    line-height: 1.5;
`;

const Description = styled(SubHeading.withComponent("p"))`
    ${media.mobileOrTablet`
        margin: 30px auto;
    `}

    ${media.desktop`
        margin: 60px auto;
    `}
`;

const UniqueFeatures = styled.ul`
    ${p => p.theme.fontSizeSubheading};
    line-height: 1.5;
    max-width: 760px;

    ${media.desktop`
        margin: 0 auto 60px;
    `}
    ${media.mobileOrTablet`
        margin: 0 auto 30px;
        padding: 0 10px;
    `}
`;

export const UniqueFeature = styled((p) =>
    <li className={p.className}>
        <FontAwesomeIcon icon={['fas', 'check']} />
        <div>
            { p.children }
        </div>
    </li>
)`
    display: flex;
    margin-bottom: 10px;

    > svg {
        margin-right: 15px;
        margin-top: 5px;
        color: #27bc17;
    }

    a:hover {
        color: ${p => p.theme.popColor};
    }
`;

export default class CharlesAlternativePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { updateModalOpen: false };
    }

    render() {
        return <Layout location={this.props.location}>
            <Helmet>
                <title>Charles alternative → HTTP Toolkit</title>

                <meta property="og:image" content={siteMetadata.siteUrl + 'screenshot-social.png'} />
                <meta name="twitter:image" content={siteMetadata.siteUrl + 'screenshot-social.png'} />
                <meta name="twitter:card" content="summary_large_image" />
                { ProductLdData() }
            </Helmet>
            <TopHeroContainer>
                <Heading>
                    Looking for a Charles alternative?
                </Heading>
                <SubHeading>
                    <Highlight>HTTP Toolkit</Highlight> is a modern powerful alternative to Charles<br/>
                    designed from the ground up for instant targeted debugging and control of any HTTP(S) traffic (with no Java necessary)
                </SubHeading>
                <StandaloneDownloadCTA
                    privacyPolicy="(No spam, no newsletters - just a quick & easy download link)"
                />
            </TopHeroContainer>

            <DemoVideo />

            <Description>
                <Highlight>HTTP Toolkit</Highlight> has all the core Charles features you use, plus:
            </Description>
            <UniqueFeatures>
                <UniqueFeature>
                    <strong>One-click zero-configuration interception</strong>: see & rewrite HTTPS instantly,
                    with <Link to="/blog/debugging-https-without-global-root-ca-certs/">no global CA
                    certificates required</Link>
                </UniqueFeature>
                <UniqueFeature>
                    <strong>Precisely targeted interception</strong>: automatically capture traffic
                    from just one browser window, without interfering with (or having to filter
                    though) traffic from the rest of your machine
                </UniqueFeature>
                <UniqueFeature>
                    Capture traffic from specific terminals and <strong>intercept scripts & servers</strong>,
                    with built-in integrations for <Link to="/docker/">Docker</Link>,{' '}
                    <Link to="/javascript/">Node.js</Link>, <Link to="/python/">Python</Link>,{' '}
                    <Link to="/ruby/">Ruby</Link> and more
                </UniqueFeature>
                <UniqueFeature>
                    <Link to="/android/">Android integration</Link> for apps and mobile browsers,
                    including automated setup, per-app interception, and system-level certificate injection for
                    complete visibility into emulators and rooted devices
                </UniqueFeature>
                <UniqueFeature>
                    Built-in documentation for every standard HTTP header & status code, plus specific
                    endpoint docs & validation for 1400+ popular APIs
                </UniqueFeature>
                <UniqueFeature>
                    <strong>Flexible rule engine for rewriting traffic</strong> so you can combine matchers with
                    mock responses, simulated errors, timeouts, redirection and more
                </UniqueFeature>
                <UniqueFeature>
                    One-click transformation of collected traffic into editable rules to match & mock subsequent requests,
                    or to export collected requests as ready-to-use code for 20+ languages
                </UniqueFeature>
            </UniqueFeatures>
            <Description>
                All within a modern beautiful UI, available for Windows, Linux & Mac, and of course <Highlight>100% open-source</Highlight>.
            </Description>

            <StandaloneDownloadCTA />

            <Testimonials />
            <SectionSpacer />

            <InterceptFeature />
            <InspectFeature reverse />
            <BreakpointFeature />
            <MockFeature reverse />
            <EditFeature />

            <FuturePlans onSignupUpdate={() => this.setState({ updateModalOpen: true })}/>
            <TrailingPitchBlock />

            <EmailSignupModal
                source='charles-footer-modal'
                isOpen={!!this.state.updateModalOpen}
                onClose={() => this.setState({updateModalOpen: false })}
            />
        </Layout>;
    }
}