import { isRouteErrorResponse, useActionData, useLoaderData, useNavigation, useRouteError, useSubmit} from '@remix-run/react';
import {BlockStack, Box, Layout, Page, PageActions, Text,} from '@shopify/polaris';
import { TabPanel} from '../components';
import {authenticate} from '../shopify.server.js';
import {loadShop} from '../models/shop.js';
import {json} from '@remix-run/node';
import {defaultSettings} from '../define.js';
import {useEffect, useState} from 'react';
import {useAppBridge} from '@shopify/app-bridge-react';
import '../components/setting/styles.css'
import {validationError} from 'remix-validated-form';
import {withZod} from '@remix-validated-form/with-zod';
import {z} from "zod";

export async function loader({request}){
  const {session} = await authenticate.admin(request);
  const shopData = await loadShop(session.shop);
  let settings = shopData.getSettings();
  return json({
    settings,
    defaultSettings,
  });
}

export async function action({request}){
  const {session} = await authenticate.admin(request);
  let shopData = await loadShop(session.shop);
  let settings = await request.json();
  let validatorPattern = {};

  if (settings?.tracking_in_order_status_page) {
    validatorPattern.tracking_in_order_status_page_label = z.string().min(5, { message: "Required" });
  }

  const validator = withZod(z.object(validatorPattern));

  const result = await validator.validate(settings);

  if (result.error) {
    return validationError(result.error);
  }

  shopData.settings = JSON.stringify(settings);
  await shopData.updateShop();

  return json({success: true});
}

export default function SettingPage() {
  const {settings, defaultSettings} = useLoaderData();
  const [settingState, setSettings] = useState(settings);
  const nav = useNavigation();
  const submit = useSubmit();
  const shopify = useAppBridge();
  const actionData = useActionData();
  const handleSubmit = () => submit(settingState, {replace: true, method: "POST", encType: "application/json"});
  const resetSettings = () => {
    if (confirm('Are you sure you want to reset settings to default?')) {
      setSettings(defaultSettings);
    }
  };
  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        shopify.toast.show('Saved successfully', {duration: 1000})
      } else {
        shopify.toast.show('Saved fail. Please try again', {isError: true, duration: 1000})
      }
    }
  }, [actionData]);
  const shortSetSettings = (option) => setSettings((prev) => ({...prev, ...option}));
  const isLoading = ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";
  useEffect(() => {
    if (nav.state === "loading") {
      shopify.loading(true);
    }else {
      shopify.loading(false);
    }
  },[nav.state])
  return (
    <Page title="Settings">
      <Layout>
        <Layout.Section>
          <BlockStack gap="500" inlineAlign="right">
              <TabPanel settings={settingState} shortSetSettings={shortSetSettings} />
            <PageActions
              primaryAction={{
                content: 'Save',
                loading: isLoading,
                onAction: handleSubmit,
              }}
              secondaryActions={[
                {
                  content: 'reset',
                  onAction: resetSettings,
                }
              ]}
            />
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}

