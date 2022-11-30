import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { styled, media } from '../../styles';

const SupportedToolsContainer = styled.section`
    ${p => p.theme.fontSizeSubheading};
    text-align: center;
    line-height: 1.3;

    margin: 0 auto;

    ${media.mobileOrTablet`
        padding: 0 10px;
    `}
`;

const SupportedToolsList = styled.ul`
    display: flex;
    flex-wrap: wrap;

    align-items: center;

    ${media.desktopOrTablet`
        justify-content: space-evenly;
    `}
    ${media.mobile`
        justify-content: space-between;
    `}
`;

const GeneralSupport = styled.p`
    margin-top: 20px;
    opacity: 0.5;
`;

export const SupportedTools = (p) =>
    <SupportedToolsContainer>
        <SupportedToolsList>
            { p.children }
        </SupportedToolsList>
        <GeneralSupport>
            (and anything else that supports HTTP(S) proxies)
        </GeneralSupport>
    </SupportedToolsContainer>

const SupportedToolListItem = styled.li`
    margin: 20px;

    white-space: nowrap;
    ${media.mobile`
        flex: 1 0 30%;
    `}

    > svg {
        margin-right: 10px;
        color: #27bc17;
    }
`;

export const SupportedTool = (p) =>
    <SupportedToolListItem>
        <FontAwesomeIcon icon={['fas', 'check']} />
        { p.children }
    </SupportedToolListItem>