import {authenticate} from '../shopify.server.js';
import {json} from '@remix-run/node';
import {useAppBridge} from '@shopify/app-bridge-react';
import EmailEditor from 'react-email-editor';
import {useCallback, useEffect, useRef, useState} from 'react';
import {ActionList, Badge, Box, Button, FullscreenBar, InlineStack, OptionList, Popover, Text, TextField,} from '@shopify/polaris';
import {Fullscreen} from '@shopify/app-bridge/actions';
import {useAdminRequest, useAppConfig} from '../utils/app_bridge.js';
import {
  useFetcher, useLoaderData, useNavigate, useNavigation,
} from '@remix-run/react';
import {loadShop} from '../models/shop.js';
import {getMergeTags} from '../utils/index.js';

export async function loader( {request,params} ) {
  const { session, admin } = await authenticate.admin( request );
  const shopData = await loadShop(session.shop);
  let settings = shopData.getSettings();
  const emailType = params.type;
  let template = settings[emailType] || null;
  return json({
    template:template,
    emailType
  })
}

export async function action({request, params}) {
  const { session, admin } = await authenticate.admin( request );
  switch ( params.type ) {
    case 'save-template':
      const shopData = await loadShop(session.shop);
      let settings = shopData.getSettings();
      const data = await request.json();
      const { emailType } = data;
      if ( emailType && settings[emailType] ) {
        settings[emailType] = {
          ...settings[emailType],
          subject: data.subject,
          design: data.design,
        }
      }
      shopData.settings = JSON.stringify(settings);
      await shopData.updateShop();
      return json({
        success: true,
        message: 'Email template updated successfully',
        template: data.template,
      })
  }
}

export default function EmailEditorPage() {
  const navigate = useNavigate();
  const nav = useNavigation();
  const {template, emailType} = useLoaderData();
  const request = useAdminRequest();
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const app = useAppConfig();
  const fullscreen = Fullscreen.create({...shopify, ...app});
  const [emailEditorEnable, setEmailEditorEnable] = useState(false);
  const emailEditorRef = useRef(null);
  const [emailSubject, setEmailSubject] = useState('default subject');
  const [emailLanguage, setEmailLanguage] = useState('en');
  const [languagePopover, setLanguagePopover] = useState(false);
  const [mergeTagsPopover, setShortcodesPopover] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleLanguagePopoverActive = useCallback(
    () => setLanguagePopover((languagePopover) => !languagePopover),
    [],
  );
  const toggleShortcodesPopover = useCallback(
    () => setShortcodesPopover((mergeTagsPopover) =>!mergeTagsPopover),
    [],
  );
  const redirectToSettings = useCallback(() => {
    navigate('/app/setting', {
      replace: false,
      relative: "route",
      state: {
        tab: 1 // notification tab index
      }
    })
  },[])

  const sendTestEmail = async () =>{
    const emailEditor = emailEditorRef.current?.editor;
    emailEditor?.exportHtml(async (data) => {
      const { html } = data;
      const response = await request.post('/api/setting/send-test-email',{
        emailSubject: emailSubject,
        html: html
      })
      const resData = await response.json();
      if( resData?.success ) {
        shopify.toast.show('Test email sent successfully',{duration: 1000});
      }else {
        shopify.toast.show('Failed to send test email',{duration: 1000, isError: true});
      }
    })
  }
  const saveTemplate = () => {
    const emailEditor = emailEditorRef.current?.editor;

    emailEditor?.exportHtml( async (data) => {
      const { design, html } = data;
      fetcher.submit({
        design: design,
        emailType: emailType,
        emailSubject: emailSubject,
        language: emailLanguage
      },{
        action: '/app/emaileditor/save-template',
        method: "POST",
        encType: "application/json"
      })
      shopify.toast.show('Templates saved',{duration: 1000});
    });
  };

  const onReady = (editorRef) => {
    // editor is ready
    // console.log(shopify);
  };

  const onLoad = (editorRef) => {
    if (template) {
      editorRef.loadDesign(template.design)
    }
    editorRef.setMergeTags(getMergeTags());
  };

  useEffect(() => {
    setEmailEditorEnable(true);
    shopify.loading(false);
  },[])

  useEffect(() => {
    if (nav.state === "loading") {
      shopify.loading(true);
    }else {
      shopify.loading(false);
    }
  },[nav.state])

  useEffect(() => {
    if ( fullscreen?.app?.hasOwnProperty('dispatch') && !isFullscreen) {
      fullscreen.dispatch(Fullscreen.Action.ENTER);
      app.subscribe(Fullscreen.Action.EXIT, () => {
        redirectToSettings();
      })
      setIsFullscreen(true)
    }
  }, [fullscreen]);

  return (
    <>
      <FullscreenBar onAction={() => {
        redirectToSettings();
        fullscreen.dispatch(Fullscreen.Action.EXIT);
      }}
      >
        <div className="vnot-flex-grow-1">
         <Box padding="400" >
           <InlineStack align="space-between" >
             <InlineStack gap="400" align="center">
               <Text variant="headingLg" as="h5">Info Received</Text>
               <Badge progress="complete" tone="info">Off</Badge>
               <Popover
                 active={languagePopover}
                 activator={(
                   <Button onClick={toggleLanguagePopoverActive}
                           disclosure={languagePopover ? 'up' : 'down'}>
                     Languages
                   </Button>
                 )}
                 autofocusTarget="first-node"
                 onClose={toggleLanguagePopoverActive}
               >
                 <OptionList
                   options={[
                     {
                       label: 'English',
                       value: 'en'
                     },
                     {
                       label: 'Spanish',
                       value: 'es'
                     },
                     {
                       label: 'French',
                       value: 'fr'
                     },
                   ]}
                   selected={emailLanguage}
                   onChange={(option) => setEmailLanguage(option)}
                 />
               </Popover>
             </InlineStack>

             <InlineStack gap="400" align="center">
               <Button variant="plain">
                 Reset to default
               </Button>
               <Button onClick={sendTestEmail}>
                 Send test email
               </Button>
               <Button
                 variant="primary"
                 onClick={saveTemplate}
               >
                 Save
               </Button>
             </InlineStack>
           </InlineStack>
         </Box>
        </div>
      </FullscreenBar>
      <Box padding="400" borderBlockEndWidth="025" borderColor="border" background="bg-surface">
        <InlineStack gap="400" blockAlign="baseline">
          <Text as="span" variant="bodyLg">Email subject</Text>
          <div className="vnot-flex-grow-1">
            <TextField
              label=""
              labelHidden
              value={emailSubject}
              onChange={setEmailSubject}
              autoComplete="off"
            />
          </div>
          <Popover
            active={mergeTagsPopover}
            activator={(<Button
              onClick={toggleShortcodesPopover}
              disclosure={mergeTagsPopover ? 'up' : 'down'}>
                Shortcodes
              </Button>)}
            onClose={toggleShortcodesPopover}>
            <ActionList
              actionRole="menuitem"
              filterLabel="Insert tags"
              sections={[
                {
                  title: 'File options',
                  items: [
                    {content: 'Import file'}, {content: 'Export file'},
                  ],
                }, {
                  title: 'Bulk actions',
                  items: [
                    {content: 'Edit'},
                    {
                      content: 'Delete',
                      destructive: true
                    },
                  ],
                },
              ]}
            />
          </Popover>
        </InlineStack>
      </Box>
      {emailEditorEnable && (<EmailEditor
          ref={emailEditorRef}
          onLoad={onLoad}
          onReady={onReady}
          minHeight="calc(100vh - 126px)"
          appearance={{
            theme: 'modern_light',
            panels: {
              tools: {
                dock: 'left'
              }
            }
          }}
        />)}
    </>
  )
}
