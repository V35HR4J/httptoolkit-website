import React from 'react';
import Helmet from 'react-helmet';

import { siteMetadata } from '../../gatsby-config.js';

import { Layout } from '../components/layout';
import { EmailSignupModal } from '../components/email-signup-modal';
import { StandaloneDownloadCTA } from '../components/cta';
import { AndroidDemoVideo } from '../components/per-target/android-demo-video';
import { SectionSpacer } from '../components/section-spacer';
import { ProductLdData } from '../components/product-ld-data.jsx';

import { TopHeroContainer, Pitch } from '../components/pitch/leading-pitch';
import { Description } from '../components/pitch/description';
import { FuturePlans } from '../components/pitch/future-plans';
import { TrailingPitchBlock } from '../components/pitch/trailing-pitch';

import { AndroidDetails } from '../components/per-target/android-details';

import { Testimonials } from '../components/testimonials.jsx';

import { InspectFeature } from '../components/features/inspect';
import { MockFeature } from '../components/features/mock';
import { EditFeature } from '../components/features/edit';
import { BreakpointFeature } from '../components/features/breakpoint';

export default class JSPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { updateModalOpen: false };
    }

    render() {
        const sendToEmailBlurb = <>
            You're on mobile, but you'll need the desktop app to get started.
            Send yourself a link to try it now on your computer:
        </>

        return <Layout location={this.props.location}>
            <Helmet>
                <title>Intercept, mock & debug Android HTTP traffic</title>

                <meta property="og:image" content={siteMetadata.siteUrl + 'screenshot-social.png'} />
                <meta name="twitter:image" content={siteMetadata.siteUrl + 'screenshot-social.png'} />
                <meta name="twitter:card" content="summary_large_image" />
                { ProductLdData() }
            </Helmet>
            <TopHeroContainer>
                <Pitch target='Android' />
                <StandaloneDownloadCTA
                    sendToEmailText={sendToEmailBlurb}
                    privacyPolicy="(No spam, no newsletters - just a quick & easy download link)"
                />
            </TopHeroContainer>

            <AndroidDemoVideo />

            <Description />

            <AndroidDetails />
            <SectionSpacer />

            <StandaloneDownloadCTA sendToEmailText={sendToEmailBlurb} />

            <Testimonials />
            <SectionSpacer />

            <InspectFeature reverse />
            <BreakpointFeature />
            <MockFeature reverse />
            <EditFeature />

            <FuturePlans onSignupUpdate={() => this.setState({ updateModalOpen: true })}/>
            <TrailingPitchBlock sendToEmailText={sendToEmailBlurb} />

            <EmailSignupModal
                source='android-footer-modal'
                isOpen={!!this.state.updateModalOpen}
                onClose={() => this.setState({updateModalOpen: false })}
            />
        </Layout>;
    }
}