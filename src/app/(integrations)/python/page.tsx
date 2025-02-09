import type { Metadata } from 'next/types';

import { PythonLogo } from '@/components/elements/icon';
import { IntegrationCompatibility } from '@/components/sections/integration/single-page/compatibility';
import { IntegrationSinglePageHero } from '@/components/sections/integration/single-page/hero';
import { IntegrationSteps } from '@/components/sections/integration/single-page/steps';
import { IntegrationTextAppVideo } from '@/components/sections/integration/single-page/text-appvideo';
import { buildMetadata } from '@/lib/utils/build-metadata';

export const metadata: Metadata = buildMetadata({
  title: "Capture, debug and mock your Python code's HTTP traffic",
  description:
    'HTTP Toolkit includes built-in automatic setup and advanced support for Python, so you can debug and modify any HTTP(S) traffic in seconds.',
});

export default function PythonIntegrationPage() {
  return (
    <>
      <IntegrationSinglePageHero
        title="Intercept, view & edit Python HTTP traffic"
        text="HTTP Toolkit includes built-in automatic setup and advanced support for Python, so you can debug and modify any HTTP(S) traffic in seconds."
        icon={PythonLogo}
        breadcrumbText="python"
      />
      <IntegrationTextAppVideo
        title="HTTP Toolkit is an open-source tool for debugging, testing and building with HTTP on Windows, Linux & Mac."
        subtitle="what is http toolkit?"
        video={{id: "python"}}
      />
      <IntegrationSteps
        title="Getting *started*"
        steps={[
          [
            'Open a terminal via HTTP Toolkit',
            'Run any Python script, tool or server from that terminal',
            "Instantly see, debug & rewrite all Python's HTTP traffic",
          ],
        ]}
      />
      <IntegrationCompatibility
        title="Automatic setup & interception for Python"
        subtitle="Fully supported"
        tools={[
          'Python 2 & 3',
          'urllib.request',
          'urllib2',
          'Requests',
          'Boto',
          'Urlfetch',
          'httplib2',
          'Pip',
          'httpx',
          'grequests',
          'aiohttp',
        ]}
      />
    </>
  );
}
