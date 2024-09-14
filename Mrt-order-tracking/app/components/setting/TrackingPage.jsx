import {
  Badge,
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  InlineStack,
  Modal,
  Text, TextField,
  Thumbnail
} from "@shopify/polaris";
import imageThumb from "../../images/trackingpage_thumb.png";
import {MenuVerticalIcon} from "@shopify/polaris-icons";
import {useCallback, useState} from 'react';
import {useAdminRequest} from '../../utils/app_bridge.js';

export function TrackingPage({pageList = [], changeOption}) {
  const redirectToCustomize = (pageHandle) => {
    const editorUrl = `https://admin.shopify.com/store/mrtos/themes/142843085023/editor?previewPath=/pages/${pageHandle}`;
    window.open(editorUrl,'_blank');
  }
  return (
    <BlockStack gap={500}>
      { pageList.map( (page,key) => (
        <Box borderColor="border" borderRadius="200" borderWidth="025" padding={300} key={key}>
          <InlineStack align="space-between" blockAlign="center">
            <InlineStack gap={500}>
              <Thumbnail source={imageThumb} alt="Order tracking page"/>
              <BlockStack gap={100}>
                <InlineStack align="start" gap={100}>
                  <Text variant="headingSm" as="h6">
                    {page.title}
                  </Text>
                  { page.using && <Badge tone="success">Active</Badge>}
                </InlineStack>
                <Text variant="bodyMd" as="p">
                  {page.admin_graphql_api_id}
                </Text>
              </BlockStack>
            </InlineStack>
            <ButtonGroup>
              <Button onClick={() => redirectToCustomize(page.handle)}>Customize</Button>
              <Button icon={MenuVerticalIcon} accessibilityLabel="Edit Tracking page" />
            </ButtonGroup>
          </InlineStack>
        </Box>
      ))}
      <NewTrackingPageModal pageList={pageList} changeOption={changeOption}/>
    </BlockStack>
  )
}

const NewTrackingPageModal = ({pageList,changeOption}) => {
  const [active, setActive] = useState(false);
  const [textField, setTextField]    = useState('');
  const request = useAdminRequest();
  const handleModal = useCallback(() => setActive(!active), [active]);
  const handleCreatePage = async () => {
    try{
      const postData = {pageTitle: textField}
      const response = await request.post("/api/setting/create-template",postData);
      console.log(response)
      // if ( !response.ok ){
      //   shopify.toast.show('Error', {duration: 1000})
      // }
      // const data = await response.json();
      // pageList = [...pageList, data]
      //
      // changeOption(pageList);
    }catch (e) {
      console.log(e)
    }
  };

  const handleTextField = (newValue) => {
    setTextField(newValue)
  }

  const activator = <Button onClick={handleModal}>New Page</Button>;

  return (

      <Box>
        <Modal
          activator={activator}
          open={active}
          onClose={handleModal}
          title="Create tracking page"
          primaryAction={{
            content: 'Create',
            onAction: handleCreatePage,
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: handleModal,
            },
          ]}
        >
          <Modal.Section>
            <BlockStack>
              <TextField
                label="Page title"
                type="text"
                helpText="URL will appear as https://."
                autoComplete="email"
                value={textField}
                onChange={handleTextField}
              />
            </BlockStack>
          </Modal.Section>
        </Modal>
      </Box>
  );
}

