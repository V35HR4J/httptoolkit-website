import * as _ from 'lodash';
import React from 'react';
import Helmet from 'react-helmet';
import { Router } from "@reach/router"

import { observable, computed } from 'mobx';
import { observer } from 'mobx-react';

import "prismjs/themes/prism-tomorrow.css";
import logo from '../images/logo.svg';

import { styled, ThemeProvider, media, GlobalStyles, theme } from '../styles';
import {
    ExternalLink,
    getHeaderValue,
    getHeaderValues,
    setHeader,
    deleteHeader,
    getOrigin
} from '../components/will-it-cors/common';
import { Breadcrumbs } from '../components/will-it-cors/breadcrumbs';
import {
    Intro,
    SourceUrlQuestion,
    TargetUrlQuestion,
    NotCorsResult,
    MixedContentResult,
    MethodQuestion,
    RequestExtrasQuestion,
    ContentTypeQuestion,
    SimpleCorsRequest,
    ServerResponseQuestion,
    ServerRejectsCorsRequest,
    ServerAllowsCorsRequest,
    ShowCode,
    PreflightRequest,
    PreflightResponseQuestion,
    ServerRejectsPreflightRequest,
    ServerAllowsPreflightRequest,
} from '../components/will-it-cors/cors-steps';

const Main = styled.main`
    font-family: Lato, Helvetica, Arial, sans-serif;
    font-display: fallback;

    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    ${media.desktop`
        margin: 0 auto;
        width: 1024px;
    `}
`;

const PageContent = styled.section`
    ${media.desktopOrTablet`
        margin: 40px 0 0 0;
        max-width: 60%;
    `}

    ${media.mobile`
        margin: 20px;
        max-width: calc(100% - 40px);
    `}
`;

const Footer = styled.footer`
    margin-top: auto;
    padding: 10px 0;

    a {
        text-decoration: none;
    }

    img {
        height: 1em;
        margin-left: 3px;
    }
`;

const PAGE_TITLE = "Will It CORS?";
const PAGE_DESCRIPTION = "Literally nobody understands CORS, except this one magic web page";

const SAFE_CONTENT_TYPES = [
    'application/x-www-form-urlencoded',
    'multipart/form-data',
    'text/plain'
];

function isSafeContentType(contentType) {
    return !UNSAFE_HEADER_BYTES.some((b) => contentType.includes(b)) &&
        SAFE_CONTENT_TYPES.includes(contentType.split(';')[0].toLowerCase());
}

const SAFE_HEADERS = [
    'accept',
    'accept-language',
    'content-language',
    'content-type'
];

const UNSAFE_HEADER_BYTES = '"():<>?@[\\]{}'.split('');

@observer
export default class WillItCors extends React.Component {

    // The various props. They each start as undefined, become empty values (""/{}/[])
    // when the question is ready, and then get updated with input.
    @observable sourceUrl = "https://";
    @observable targetUrl = "https://";
    @observable method = "";

    @observable sendCredentials = false;
    @observable useStreaming = false;
    @observable requestHeaders = []; // List of key value pairs

    @observable preflightResponseHeaders = []; // List of key value pairs
    @observable serverResponseHeaders = []; // List of key value pairs

    @computed get sourceOrigin() {
        try {
            return getOrigin(this.sourceUrl);
        } catch (e) {
            return undefined;
        }
    }

    @computed get targetOrigin() {
        try {
            return getOrigin(this.targetUrl);
        } catch (e) {
            return undefined;
        }
    }

    @computed get contentType() {
        return getHeaderValue(this.requestHeaders, 'Content-Type');
    }

    @computed get isCorsRequest() {
        if (!this.sourceOrigin || !this.targetOrigin) return undefined;
        return this.sourceOrigin !== this.targetOrigin;
    }

    @computed get isMixedContentRequest() {
        if (!this.sourceOrigin || !this.targetOrigin) return undefined;

        return this.sourceOrigin.startsWith('https://') &&
            this.targetOrigin.startsWith('http://') &&
            // Most browsers (though admittedly, not all) treat localhost as secure
            !this.targetOrigin.match(/http:\/\/localhost(:|$)/) &&
            !this.targetOrigin.match(/http:\/\/127\.0\.0\.1(:|$)/);
    }

    @computed get unsafeHeaders() {
        return this.requestHeaders
            .filter(([headerName, headerValue]) => {
                const name = headerName.toLowerCase();

                if (!SAFE_HEADERS.includes(name)) return true;

                if (name === 'accept') return UNSAFE_HEADER_BYTES.some((b) => headerValue.includes(b));
                if (name === 'accept-language' || name === 'content-language') {
                    return !/^[0-9A-Za-z *,.;=\-]+$/.test(headerValue);
                }

                if (name === 'content-type') {
                    // Can't include unsafe bytes, must be a safe content type (ignoring params)
                    return !isSafeContentType(headerValue);
                }
            })
            .map(([headerName]) => headerName)
    }

    @computed get isSendingUnsafeHeaders() {
        return this.unsafeHeaders.length > 0;
    }

    @computed get isSimpleCorsRequest() {
        if (this.isCorsRequest === undefined || !this.method) return undefined;

        return this.isCorsRequest &&
            !this.isSendingUnsafeHeaders &&
            !this.useStreaming &&
            ['HEAD', 'GET', 'POST'].includes(this.method);
    }

    @computed get doesPreflightResponseAllowOrigin() {
        if (this.sourceOrigin === undefined) return undefined;
        const allowedOrigin = getHeaderValue(this.preflightResponseHeaders, 'access-control-allow-origin');

        return this.sendCredentials
            ? allowedOrigin === this.sourceOrigin
            : allowedOrigin === '*' || allowedOrigin === this.sourceOrigin;
    }

    @computed get doesPreflightResponseAllowMethod() {
        if (!this.method) return undefined;
        const allowedMethods = getHeaderValues(this.preflightResponseHeaders, 'access-control-allow-methods');

        return this.sendCredentials
            ? allowedMethods.includes(this.method)
            : allowedMethods === '*' || allowedMethods.includes(this.method);
    }

    @computed get doesPreflightResponseAllowHeaders() {
        const allowedHeaders = getHeaderValues(this.preflightResponseHeaders, 'access-control-allow-headers')
            .map(h => h.toLowerCase());

        const includesAllUnsafeHeaders = !this.unsafeHeaders.some(h =>
            !allowedHeaders.includes(h.toLowerCase())
        );

        // Authorization must be included explicitly - * isn't sufficient.
        const unsafeAuthorization = !allowedHeaders.includes('authorization') &&
            this.unsafeHeaders.map(h => h.toLowerCase()).includes('authorization');

        return !unsafeAuthorization && (
            this.sendCredentials
                ? includesAllUnsafeHeaders
                : allowedHeaders.includes('*') || includesAllUnsafeHeaders
        );
    }

    // Slight misnomer: really does it allow the credentials *we wanted to send* (i.e. always true if we send nothing)
    @computed get doesPreflightResponseAllowCredentials() {
        return !this.sendCredentials ||
            getHeaderValue(this.preflightResponseHeaders, 'access-control-allow-credentials') === 'true';
    }

    @computed get isPreflightSuccessful() {
        return this.doesPreflightResponseAllowOrigin &&
            this.doesPreflightResponseAllowMethod &&
            this.doesPreflightResponseAllowHeaders &&
            this.doesPreflightResponseAllowCredentials;
    }

    @computed get isServerResponseReadable() {
        if (this.sourceOrigin === undefined) return undefined;
        const allowedOrigin = getHeaderValue(this.serverResponseHeaders, 'access-control-allow-origin');
        const credentialsAllowed = getHeaderValue(this.serverResponseHeaders, 'access-control-allow-credentials') === 'true';

        return this.sendCredentials
            ? credentialsAllowed && allowedOrigin === this.sourceOrigin
            : allowedOrigin === '*' || allowedOrigin === this.sourceOrigin;
    }

    @computed get exampleCode() {
        return `\
// In your script on ${this.sourceUrl}
fetch("${ this.targetUrl }", ${
    JSON.stringify(Object.assign(
        { method: this.method },
        this.sendCredentials ? { credentials: 'include' } : {},
        !_.isEmpty(this.requestHeaders) ? {
            headers: _.mapValues(
                _.keyBy(this.requestHeaders, ([headerName]) => headerName),
                ([headerName, headerValue]) => headerValue
            )
        } : {},
    ), null, 4)
});

/*${
    !this.isSimpleCorsRequest ?
`
The server will receive an OPTIONS request to ${
    this.targetUrl
}, including headers:

Origin: ${this.sourceOrigin}
Access-Control-Request-Method: ${this.method}${
    this.unsafeHeaders.length ? `
Access-Control-Request-Headers: ${this.unsafeHeaders.join(', ')}` : ''}

The server's response headers should include:

${
    this.preflightResponseHeaders.map(([headerName, headerValue]) =>
        `${headerName}: ${headerValue}`
    ).join('\n')
}

Next, the `
: `
The `

}server will receive your ${this.method} request to ${this.targetUrl}, with an 'Origin: ${this.sourceOrigin}' header set by the browser.

The server's response headers should include:

${
    this.serverResponseHeaders.map(([headerName, headerValue]) =>
        `${headerName}: ${headerValue}`
    ).join('\n')
}
*/
`;
    }

    render() {
        const { navigate } = this.props;

        return <ThemeProvider theme={theme}>
            <Main>
                <GlobalStyles />
                <Helmet>
                    <html lang="en" />

                    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                    <link rel="manifest" href="/site.webmanifest" />
                    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#e1421f" />
                    <meta name="msapplication-TileColor" content="#da532c" />
                    <meta name="theme-color" content="#fafafa" />

                    <meta name="viewport" content="width=device-width, initial-scale=1" />

                    <title>{ PAGE_TITLE }</title>
                    <meta name="description" content={PAGE_DESCRIPTION} />

                    <meta property="og:url"         content="https://httptoolkit.com/will-it-cors/" />
                    <meta property="og:type"        content="website" />
                    <meta property="og:title"       content={PAGE_TITLE} />
                    <meta property="og:description" content={PAGE_DESCRIPTION} />
                    <meta property="og:image"       content="https://httptoolkit.com/logo-social.png" />

                    <meta name="twitter:card"        content="summary" />
                    <meta name="twitter:site"        content="@httptoolkit" />
                    <meta name="twitter:title"       content={PAGE_TITLE} />
                    <meta name="twitter:description" content={PAGE_DESCRIPTION} />
                    <meta name="twitter:image"       content="https://httptoolkit.com/logo-square.png" />

                    <link rel="alternate" type="application/rss+xml" href="https://httptoolkit.com/rss.xml" />
                </Helmet>

                <PageContent>
                    <Router basepath="/will-it-cors"><Breadcrumbs path="/*" /></Router>

                    <Router basepath="/will-it-cors">
                        <Intro path="/" onNext={() => navigate("./source-url")} />
                        <SourceUrlQuestion
                            path="/source-url"
                            value={this.sourceUrl}
                            onChange={(newValue) => { this.sourceUrl = newValue }}
                            onNext={() => navigate("./target-url")}
                        />
                        <TargetUrlQuestion
                            path="/target-url"
                            value={this.targetUrl}
                            onChange={(newValue) => { this.targetUrl = newValue }}
                            onNext={() => {
                                if (!this.isCorsRequest) {
                                    navigate("./not-cors");
                                } else if (this.isMixedContentRequest) {
                                    navigate("./mixed-content");
                                } else {
                                    navigate("./method");
                                }
                            }}
                        />
                        {
                            this.isCorsRequest === false && <NotCorsResult
                                path="/not-cors"
                                origin={this.sourceOrigin}
                            />
                        }
                        { this.isMixedContentRequest && <MixedContentResult
                                path="/mixed-content"
                                sourceOrigin={this.sourceOrigin}
                                targetOrigin={this.targetOrigin}
                            />
                        }
                        <MethodQuestion
                            path="/method"
                            sourceOrigin={this.sourceOrigin}
                            targetOrigin={this.targetOrigin}
                            value={this.method}
                            onChange={(newValue) => { this.method = newValue }}
                            onNext={() => navigate("./request-extras")}
                        />
                        <RequestExtrasQuestion
                            path="/request-extras"

                            sendCredentials={this.sendCredentials}
                            onSendCredentials={(newValue) => { this.sendCredentials = newValue }}

                            useStreaming={this.useStreaming}
                            onUseStreaming={(newValue) => { this.useStreaming = newValue }}

                            headers={this.requestHeaders}
                            onChangeHeaders={(newValue) => { this.requestHeaders = newValue }}

                            onNext={() => {
                                if (this.method === 'POST' && this.contentType === undefined) {
                                    navigate("./content-type");
                                } else if (this.isSimpleCorsRequest) {
                                    navigate("./simple-cors");
                                } else {
                                    navigate("./preflight");
                                }
                            }}
                        />
                        <ContentTypeQuestion
                            path="/content-type"
                            value={this.contentType}
                            onChange={(newValue) => {
                                if (newValue) {
                                    setHeader(this.requestHeaders, 'Content-Type', newValue)
                                } else {
                                    deleteHeader(this.requestHeaders, 'Content-Type');
                                }
                            }}
                            onNext={() => {
                                if (this.isSimpleCorsRequest) {
                                    navigate("./simple-cors");
                                } else {
                                    navigate("./preflight");
                                }
                            }}
                        />
                        { this.isSimpleCorsRequest &&
                            <SimpleCorsRequest
                                path="/simple-cors"
                                onNext={() => navigate("./server-response")}
                            />
                        }
                        <ServerResponseQuestion
                            path="/server-response"

                            sourceOrigin={this.sourceOrigin}
                            targetUrl={this.targetUrl}
                            method={this.method}
                            unsafeHeaders={this.unsafeHeaders}
                            sendCredentials={this.sendCredentials}
                            isServerResponseReadable={this.isServerResponseReadable}

                            value={this.serverResponseHeaders}
                            onChange={(newValue) => { this.serverResponseHeaders = newValue }}
                            onNext={() => {
                                if (this.isServerResponseReadable) {
                                    navigate("./request-success");
                                } else {
                                    navigate("./request-failure");
                                }
                            }}
                        />

                        { this.isServerResponseReadable &&
                            <ServerAllowsCorsRequest
                                path="/request-success"
                                sourceOrigin={this.sourceOrigin}
                                responseHeaders={this.serverResponseHeaders}
                                sendCredentials={this.sendCredentials}

                                onNext={() => navigate('./show-code')}
                            />
                        }

                        { this.isServerResponseReadable &&
                            <ShowCode
                                path="/show-code"
                                code={this.exampleCode}
                            />
                        }

                        { this.isServerResponseReadable === false &&
                            <ServerRejectsCorsRequest
                                path="/request-failure"

                                sourceOrigin={this.sourceOrigin}
                                sendCredentials={this.sendCredentials}
                                serverResponseHeaders={this.serverResponseHeaders}
                            />
                        }

                        { !this.isSimpleCorsRequest &&
                            <PreflightRequest
                                path="/preflight"
                                onNext={() => navigate("./preflight-response")}
                            />
                        }

                        <PreflightResponseQuestion
                            path="/preflight-response"

                            sourceOrigin={this.sourceOrigin}
                            targetUrl={this.targetUrl}
                            method={this.method}
                            unsafeHeaders={this.unsafeHeaders}
                            sendCredentials={this.sendCredentials}
                            isPreflightSuccessful={this.isPreflightSuccessful}

                            value={this.preflightResponseHeaders}
                            onChange={(newValue) => { this.preflightResponseHeaders = newValue }}
                            onNext={() => {
                                if (this.isPreflightSuccessful) {
                                    navigate("./preflight-success");
                                } else {
                                    navigate("./preflight-failure");
                                }
                            }}
                        />

                        { this.isPreflightSuccessful === false &&
                            <ServerRejectsPreflightRequest
                                path="/preflight-failure"

                                sourceOrigin={this.sourceOrigin}
                                method={this.method}
                                sendCredentials={this.sendCredentials}
                                unsafeHeaders={this.unsafeHeaders}
                                preflightResponseHeaders={this.preflightResponseHeaders}

                                originAllowed={this.doesPreflightResponseAllowOrigin}
                                methodAllowed={this.doesPreflightResponseAllowMethod}
                                headersAllowed={this.doesPreflightResponseAllowHeaders}
                                credentialsAllowed={this.doesPreflightResponseAllowCredentials}
                            />
                        }

                        { this.isPreflightSuccessful &&
                            <ServerAllowsPreflightRequest
                                path="/preflight-success"
                                onNext={() => navigate("./server-response")}
                            />
                        }
                    </Router>
                </PageContent>

                <Footer>
                    <ExternalLink href="/">Part of <img src={logo} alt="HTTP Toolkit" /></ExternalLink>
                </Footer>
            </Main>
        </ThemeProvider>;
    }
}

