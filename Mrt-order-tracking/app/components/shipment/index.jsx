import {
  BlockStack,
  Button,
  Card,
  InlineStack,
  Layout,
  Modal,
  Page,
  Popover,
  RangeSlider,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
  Text,
} from '@shopify/polaris';
import {ShipmentFilter} from './ShipmentFilter.jsx';
import ShipmentTable from './ShipmentTable.jsx';
import {useShipmentStore} from '../../context/ShipmentContext.jsx';
import {useCallback, useState} from 'react';
import {useAdminRequest} from '../../utils/app_bridge.js';

export default function ShipmentLayout () {
  const {redirectShipmentDetail} = useShipmentStore( state => state);
  const [popoverActive, setPopoverActive] = useState(false);
  const [daysAgo, setDaysAgo] = useState(7);
  const request = useAdminRequest();

  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );

  const reTrackShipments = async () => {
    shopify.toast.show("Re-tracking in progress", {duration: 2000});
    try{
      const response = await request.post('/api/shipment/re-track',{
        daysAgo
      })
    }catch(err) {
      console.log(err)
    }
  }

  const activator = (
    <Button onClick={togglePopoverActive}
            disclosure="select"
    >
      Re-track
    </Button>
  );
  return redirectShipmentDetail ?
    (<ShipmentDetailSkeleton/>)
    :
    (
      <Page
        fullWidth
        title="Shipments"
        secondaryActions={
        <InlineStack gap={100}>
          <Popover
            active={popoverActive}
            activator={activator}
            onClose={togglePopoverActive}
          >
            <Card>
             <BlockStack gap="300" inlineAlign="center" >
               <RangeSlider
                 output
                 label={<Text as="h5" variant="headingSm">Days before</Text>}
                 min={2}
                 max={60}
                 step={1}
                 value={daysAgo}
                 suffix={daysAgo}
                 onChange={(value)=>{setDaysAgo(value)}}
               />
               <ReTrackWarningModal handlePrimaryAction={reTrackShipments}/>
             </BlockStack>
            </Card>
          </Popover>
        </InlineStack>
      }
      >
        <Layout>
          <Layout.Section>
            <Card padding="100">
              <ShipmentFilter/>
              <ShipmentTable/>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    )
}

const ShipmentDetailSkeleton = () => {
  return (
    <SkeletonPage primaryAction>
      <Layout>
        <Layout.Section>
          <Card >
            <SkeletonBodyText lines={10} />
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <BlockStack gap="500">
            <Card>
              <SkeletonBodyText lines={6} />
            </Card>
            <Card>
              <SkeletonBodyText lines={3} />
            </Card>
            <Card>
              <SkeletonDisplayText size="medium"/>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </SkeletonPage>
  )
}

const ReTrackWarningModal = ({handlePrimaryAction}) => {
  const [active, setActive] = useState(false);

  const handleChange = useCallback(() => setActive(!active), [active]);

  const activator = <Button fullWidth onClick={handleChange}>Track</Button>;

  return (
    <Modal
      activator={activator}
      open={active}
      onClose={handleChange}
      title="Re-track shipments"
      primaryAction={
        {
          content: 'Re-track',
          onAction: handlePrimaryAction,
        }
      }
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: handleChange,
        }
      ]}
    >
      <Modal.Section>
        <Text as="p" variant="bodyMd">
          Re-tracking Shipments may take a few minutes or longer, depending on the number of shipments. Please be patient during this process.
        </Text>
      </Modal.Section>
    </Modal>
  );
}
