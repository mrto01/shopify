import {
  useLoaderData,
} from '@remix-run/react';
import {
  Badge,
  BlockStack,
  Box,
  Button,
  Card,
  Icon,
  InlineStack,
  Layout,
  Link,
  Page,
  ProgressBar,
  Text,
  Thumbnail,
  Tooltip,
} from '@shopify/polaris';
import {authenticate} from '../shopify.server.js';
import {json, redirect} from '@remix-run/node';
import '../components/setting/styles.css'
import {
  ClipboardIcon, ExternalIcon, ReceiptIcon,PaymentIcon,PackageFulfilledIcon,DeliveryIcon,ClipboardCheckIcon
} from '@shopify/polaris-icons';
import {Shipment} from '../models/shipment.js';
import {
  formatAddress, formatTime, getStatusBadge, getTimeGapLabel,
} from '../utils/index.js';

export async function loader({request}){
  const {session, admin} = await authenticate.admin(request);
  const url = new URL( request.url );
  const params = new URLSearchParams(url.search);
  const shipmentId = Number.parseInt( params.get('id') );
  Shipment.loadAdmin(admin,session);
  const shipment = await Shipment.findById( shipmentId );
  if ( shipment == null) {
    return redirect("/app/setting")
  }
  const response = await admin.graphql(
      `#graphql
    query {
      node(id: "gid://shopify/Order/5723308785887") {
        id
        ... on Order {
          name
        }
      }
    }`,
  );
  const data = await response.json();
  console.log(data)
  return json({shipment})
}

export default function Shipmentdetail() {
  const {shipment} = useLoaderData();
  const shipmentStatuses = ["unresolved", "info_received", "in_transit", "delivered"];

  const shipmentStates = [
    ...shipment.states,
    {
      date: shipment.fulfillmentDate,
      status: "Fulfilled",
    },
    {
      date: shipment.orderDate,
      status: "Ordered",
    }
  ]

  const copyToClipboard = (text) =>{
    navigator.clipboard.writeText(text)
      .then(()=> {
        shopify.toast.show('Copied to clipboard', {duration: 1000})
    })
  }

  let statusIndex = shipmentStatuses.findIndex( status => status === shipment.status );
  let progressTone = "highlight";
  let progress = statusIndex * 33.33;
  const [statusTone, statusProgress] = getStatusBadge( shipment.status )
  if (shipment.status === "delivered"){
    progressTone = "success";
  }
  return (
    <Page
      backAction={{content: 'shipments', url: '/app/shipment'}}
      title={shipment.trackingNumber}
      titleMetadata={<Badge tone={statusTone} progress={statusProgress}>{( shipment?.status.charAt(0).toUpperCase() + shipment?.status.slice(1) ).split("_").join(" ")}</Badge>}
      subtitle={formatTime(shipment.createdDate,"MMMM dd, hh:mm a")}
      compactTitle
      secondaryActions={[
        {
          content: "View order",
          accessibilityLabel: "View order",
          onAction: ()=>{}
        }
      ]}
      pagination={{
        hasPrevious: true,
        hasNext: true,
      }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400" inlineAlign="right">
            <Card sectioned>
              <BlockStack gap="500">
                <Text as="span" variant="headingLg" alignment="center">
                  { ( shipment?.status.charAt(0).toUpperCase() + shipment?.status.slice(1) ).split("_").join(" ") }
                </Text>
                <Box >
                  <ProgressBar progress={progress} size="small" tone={progressTone}/>
                </Box>
                <Box>
                  <div className="vnot-tracking-timeline">
                    { shipmentStates.map( (state, index) => {
                      let stateIcon = null;
                      let stateTone = "base";
                      if (state.status === "Ordered") {
                        stateIcon = PaymentIcon;
                      }else if (state.status === 'Fulfilled'){
                        stateIcon = PackageFulfilledIcon;
                      }else {
                        if (!state.location && index > ( shipmentStates.length - 4 )) {
                          stateIcon = ReceiptIcon;
                          stateTone = "info"
                        }else {
                          if( shipment.status === 'in_transit' && index === 0 || shipment.status === 'delivered' && index === 1) {
                            stateIcon = DeliveryIcon;
                            stateTone = "interactive";
                          }else if( shipment.status === 'delivered' && index === 0 ) {
                            stateIcon = ClipboardCheckIcon;
                            stateTone = "success";
                          }
                        }
                      }
                      return (
                        <div className="vnot-tracking-timeline-event" key={index}>
                          <Box maxWidth="95px" minWidth="95px">
                            <Text as="span" variant="bodyMd">{formatTime(state.date)} </Text>
                          </Box>
                          <div className="vnot-tracking-timeline-icon">
                            {
                              stateIcon ?
                                ( <Icon source={stateIcon} tone={stateTone}/> )
                                :
                                (<span className="vnot-tracking-timeline-icon-default"></span>)
                            }
                          </div>
                          <div className="vnot-tracking-timeline-content">
                            <Text as="span" variant="bodyMd">{state.location && `[${state.location}]`} {state.status}</Text>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Box>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <BlockStack gap="500">
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between">
                  <BlockStack gap="150">
                    <Text as="h5" variant="headingMd">
                      Carrier: {shipment.carrier}
                    </Text>
                    {
                      shipment.externalTracking ?
                        (
                          <Link
                            url={shipment.externalTracking}
                            target="_blank"
                          >
                            {shipment.trackingNumber}
                            <div className="vnot-polaris-icon">
                              <Icon source={ExternalIcon} />
                            </div>
                          </Link>
                        )
                        :
                        (
                          <Text as="span" variant="bodyMd" tone="subdued">
                            {shipment.trackingNumber}
                          </Text>
                        )
                    }
                  </BlockStack>
                  <BlockStack gap="150" inlineAlign="end" align="end">
                    <Tooltip  content={
                      <InlineStack gap="200" >
                        <Text as="span" variant="bodyMd" tone="subdued">
                          Copy tracking number
                        </Text>
                      </InlineStack>
                    }
                    >
                      <Button icon={ClipboardIcon} variant="monochromePlain" onClick={() => copyToClipboard(shipment.trackingNumber)}/>
                    </Tooltip>
                  </BlockStack>
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span" variant="bodyMd">Order number</Text>
                  <Link to="/order" removeUnderline target="_blank">#{shipment.orderNumber}</Link>
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span" variant="bodyMd">Order date</Text>
                  <Text as="span" variant="bodyMd">{formatTime(shipment.orderDate, "MMM dd, hh:mm a")}</Text>
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span" variant="bodyMd">Destination</Text>
                  <Text as="span" variant="bodyMd">{shipment.destination}</Text>
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span" variant="bodyMd">Transit time</Text>
                  <Text as="span" variant="bodyMd">{shipment.transitTime}</Text>
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span" variant="bodyMd">Last updated</Text>
                  <Text as="span" variant="bodyMd">{getTimeGapLabel(new Date(), shipment.updatedDate)}</Text>
                </InlineStack>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="300">
                <BlockStack gap="200">
                  <Text as="h5" variant="headingMd"> Customer </Text>
                  <Link url={shipment.customer.url} target="_blank" removeUnderline> {shipment.customer.name}</Link>
                </BlockStack>
                <BlockStack gap="200">
                  <Text as="h5" variant="headingMd"> Contact information </Text>
                  <Text as="span" variant="bodyMd">{shipment.email}</Text>
                </BlockStack>
                <BlockStack gap="200">
                  <Text as="h5" variant="headingMd"> Shipping address </Text>
                  <Text as="p" variant="bodyMd">
                    {formatAddress(shipment.shippingAddress).map( (addressLine ) => (
                      <>{addressLine}<br/> </>
                    ))}
                  </Text>
                </BlockStack>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="300">
                <Text as="h5" variant="headingMd"> Parcel </Text>
                {shipment.parcel.map( (item, index) => (
                  <InlineStack gap="200" key={index} wrap={false}>
                    <Box>
                      <Thumbnail source={item.image} alt="Parcel name" size="small"/>
                    </Box>
                    <Box width="100%">
                      <InlineStack wrap={false} align="space-between" >
                        <BlockStack gap="150" >
                          <Link url={item.editUrl} target="_blank">
                            {item.title}
                          </Link>
                          <Badge> {item.variantTitle}</Badge>
                        </BlockStack>
                        <Text as="span" variant="bodySm" id="vnot-parcel-item-quantity">  × {item.quantity} </Text>
                      </InlineStack>
                    </Box>
                  </InlineStack>
                ))}
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  )
}

