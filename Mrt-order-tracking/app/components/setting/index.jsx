import {
  Card,
  Checkbox,
  InlineStack,
  Link,
  RadioButton,
  Tabs,
  TextField,
} from '@shopify/polaris';
import {useCallback, useState} from 'react';
import {TabContent} from './TabContent.jsx';
import {TrackingPage} from './TrackingPage.jsx';
import {useLocation} from '@remix-run/react';

export function TabPanel({settings, shortSetSettings}) {
  const location = useLocation();
  const [selected, setSelected] = useState(location?.state?.tab || 0);
  const handleTabChange = useCallback(
  (selectedTabIndex) => setSelected(selectedTabIndex),
  [],
  );

  const [
    generalSections,
    advancedSections,
    notificationSections,
    integrationSections
  ] = settingSections(settings);

  const tabs = [
    {
      id: 'general',
      accessibilityLabel: 'General',
      panelID: 'general',
      content: 'General',
      sections: generalSections,
    },
    {
      id: 'notification',
      panelID: 'notification',
      content: 'Notification',
      sections: notificationSections,
    },
    {
      id: 'integration',
      panelID: 'integration',
      content: 'Integration',
      sections: integrationSections,
    },
    {
      id: 'advanced',
      panelID: 'advanced',
      content: 'Advanced',
      sections: advancedSections,
    },
  ];
  return (
    <>
      <Card padding={0}>
        <Tabs tabs={tabs} onSelect={handleTabChange} selected={selected} fitted/>
      </Card>
      <TabContent tab={tabs[selected]} shortSetSettings={shortSetSettings}/>
    </>
  )
}

const settingSections = ( settings ) => {
  const generalSections = [
    {
      title: 'Shopify related',
      subTitle: '',
      callback: null,
      options: [
        {
          type: 'toggle',
          label: 'Use native tracking link',
          name: 'use_native_tracking_link',
          desc: "Replace Shopify's native tracking links (which direct to the carrier's website) with your store's default tracking page's URL.",
          enable: settings['use_native_tracking_link'],
          render: null,
          learnMore: ''
        },
        {
          type: 'toggle',
          label: 'Auto update Shopify shipment',
          name: 'auto_update_shopify_shipment',
          desc: "Auto-send shipping tracking events to Shopify to update the shipment status of your Shopify Order.",
          enable: settings['auto_update_shopify_shipment'],
          render: (changeOption) => {
            const optionName = 'trigger_shopify_native_notification'
            const optionEnable = settings['auto_update_shopify_shipment']
            return (
              <Checkbox
                label={<>
                  Trigger Shopify's native <Link
                  to="/notifications/customer">Out for delivery & Delivered</Link> notifications
                </>}
                name={optionName}
                checked={settings[optionName]}
                onChange={(value) => changeOption(value, optionName)}
                disabled={!optionEnable}
              />
            )
          }
        },
        {
          type: 'toggle',
          label: 'Add tracking link/button to order status page',
          name: 'tracking_in_order_status_page',
          desc: 'Add a tracking link or button to the order status page for customers to track their orders, even before fulfillment.',
          enable: settings['tracking_in_order_status_page'],
          render: (changeOption) => {
            const trackingType= settings['tracking_in_order_status_page_type'];
            const trackingLabel= settings['tracking_in_order_status_page_label'];
            let fieldEnable = {
              disabled : true
            }
            if (settings['tracking_in_order_status_page']) {
              fieldEnable.disabled = false
            }
            const handleChange = (value, option) => {
              changeOption( value, option );
            }
            return (
              <>
                <InlineStack gap={500} >
                  <RadioButton
                    label="Tracking link"
                    checked={trackingType === 'tracking_link'}
                    id="tracking_link"
                    name="tracking_in_order_status_page_type"
                    onChange={(_,value) => (handleChange(value,'tracking_in_order_status_page_type'))}
                    {...fieldEnable}
                  />
                  <RadioButton
                    label="Tracking button"
                    id="tracking_button"
                    name="tracking_in_order_status_page_type"
                    checked={trackingType === 'tracking_button'}
                    onChange={(_,value) => (handleChange(value,'tracking_in_order_status_page_type'))}
                    {...fieldEnable}
                  />
                </InlineStack>
                <TextField
                  className={"vi"}
                  value={trackingLabel}
                  name="tracking_in_order_status_page_label"
                  onChange={( value) => (handleChange(value,'tracking_in_order_status_page_label'))}
                  label="Link text"
                  type="text"
                  autoComplete="label"
                  {...fieldEnable}
                />
              </>
            )
          }
        },
        {
          type: 'toggle',
          label: 'Dropshiping mode',
          name: 'dropshiping_mode',
          desc: 'Hide chinese origins to create a consistent branded shopping experience for your customers.',
          enable: settings['dropshiping_mode'],
        }
      ],
    },
    {
      title: 'Order tracking page',
      subTitle: '',
      callback: null,
      options: [
        {
          type: 'custom',
          name: 'tracking_pages',
          render: (changeOption) => {
            return (
              <TrackingPage pageList={settings['tracking_pages']} changeOption={changeOption}/>
            )
          }
        }
      ]
    }
  ]

  const notificationSections = [{
    title: 'Emails',
    subTitle: 'Automatically notify your customers or yourself via emails',
    callback: null,
    options: [
      {
        type: 'tab',
        label: '',
        tabs: [
          {
            id: 'notification-to-customer',
            content: 'Customer notifications',
            accessibilityLabel: 'Notification to customer'
          },
          {
            id: 'notification-to-seller',
            content: 'Seller notification',
            accessibilityLabel: 'Notification to seller',
          }
        ],
        tabContent: [
          {
            options: [
              {
                type: 'input',
                inputType: 'text',
                label: 'Sender name',
                name: 'customer_notification_sender',
                desc: 'The name that represents the emails sent to the customers.',
                value: settings['customer_notification_sender']
              },
              {
                type: 'input',
                label: 'Sender Email',
                inputType: 'email',
                name: 'customer_notification_email',
                desc: 'The email your store uses to send emails to your customers.',
                value: settings['customer_notification_email']
              },
              {
                type: 'toggle',
                label: 'Info received',
                name: 'customer_info_received_email',
                desc: 'Enable or disable email notifications sent to the customer when their shipment information is received.',
                editUrl: '',
                enable: settings['customer_info_received_email'].enable,
                render: () => (
                  <Link url="/app/emaileditor/customer_info_received_email" removeUnderline>
                    Edit template
                  </Link>
                )
              },
              {
                type: 'toggle',
                label: 'In transit',
                name: 'customer_in_transit_email',
                desc: 'Toggle email notifications for the customer when their package is in transit.',
                editUrl: '',
                enable: settings['customer_in_transit_email'].enable,
                render: () => (
                  <Link url="/app/emaileditor/customer_in_transit_email" removeUnderline>
                    Edit template
                  </Link>
                )
              },
              {
                type: 'toggle',
                label: 'Delivered',
                name: 'customer_delivered_email',
                desc: 'Control whether the customer receives an email notification when their package has been delivered.',
                editUrl: '',
                enable: settings['customer_delivered_email'].enable,
                render: () => (
                  <Link url="/app/emaileditor/customer_delivered_email" removeUnderline>
                    Edit template
                  </Link>
                )
              }
            ]
          },
          {
            options: [
              {
                type: 'input',
                inputType: 'email',
                label: 'Recipient',
                name: 'seller_notification_email',
                desc: 'Enter the email address where seller notifications should be sent.',
                value: settings['seller_notification_email']
              },
              {
                type: 'toggle',
                label: 'Info received',
                name: 'seller_info_received_email',
                desc: 'Enable or disable email notifications sent to the seller when their shipment information is received.',
                editUrl: '',
                enable: settings['seller_info_received_email'].enable,
                render: () => (
                  <Link url="/app/emaileditor/seller_info_received_email" removeUnderline>
                    Edit template
                  </Link>
                )
              },
              {
                type: 'toggle',
                label: 'In transit',
                name: 'seller_in_transit_email',
                desc: 'Toggle email notifications for the seller when their package is in transit.',
                editUrl: '',
                enable: settings['seller_in_transit_email'].enable,
                render: () => (
                  <Link url="/app/emaileditor/seller_in_transit_email" removeUnderline>
                    Edit template
                  </Link>
                )
              },
              {
                type: 'toggle',
                label: 'Delivered',
                name: 'seller_delivered_email',
                desc: 'Control whether the seller receives an email notification when their package has been delivered.',
                editUrl: '',
                enable: settings['seller_delivered_email'].enable,
                render: () => (
                  <Link url="/app/emaileditor/seller_delivered_email" removeUnderline>
                    Edit template
                  </Link>
                )
              }
            ]
          }
        ]
      }
    ]
  }];

  const integrationSections = [];

  const advancedSections = [];

  return [generalSections, advancedSections, notificationSections, integrationSections]
}
