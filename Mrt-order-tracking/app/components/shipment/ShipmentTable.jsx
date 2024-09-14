import {
  Badge,
  EmptySearchResult,
  IndexTable,
  InlineStack,
  Link,
  useBreakpoints,
  useIndexResourceState,
  Text,
  Box,
  Icon,
  Tooltip, Checkbox,
} from '@shopify/polaris';
import {Modal, TitleBar} from '@shopify/app-bridge-react';
import {useShipmentStore} from '../../context/ShipmentContext.jsx';
import react, {useCallback, useState} from 'react';
import {useNavigate} from '@remix-run/react';
import { formatTime, getStatusBadge} from '../../utils/index.js';
import {useAdminRequest} from '../../utils/app_bridge.js';
import {AdjustIcon, ClockIcon} from '@shopify/polaris-icons';

export default function ShipmentTable() {
  react.useLayoutEffect = react.useEffect;
  const request = useAdminRequest();
  const navigate = useNavigate();
  const breakpoint = useBreakpoints();
  const {
    shipments,
    columnsShow,
    filterLoading,
    shopName,
    setRedirectShipmentDetail,
    pageSize,
    filterSelected,
    setFilterSelected,
    pagination,
    setPagination,
    setShipments,
    setFilterLoading
  } = useShipmentStore( state => state);
  const {selectedResources, allResourcesSelected, handleSelectionChange, clearSelection} = useIndexResourceState(shipments);
  const resourceName = {
    singular: 'shipment',
    plural: 'shipments',
  };
  const changePage = useCallback( (direction) => {
    (async () => {
      setFilterLoading(true);
      try {
        const payload = {
          ...filterSelected,
        };
        if (direction === 'next') {
          payload.page = ++pagination.currPage;
        } else {
          payload.page = --pagination.currPage;
        }

        setPagination({
          ...pagination,
          page: payload.page
        });

        const response = await request.post('/api/shipment/filter', payload);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setShipments(data.shipments);
      } catch (error) {
        console.error('Error fetching shipments:', error);
      } finally {
        setFilterLoading(false);
      }
    })();
  }, [request])
  const handleChangeShipmentStatus = useCallback( (status, triggerEmail) => {
    (async () => {
      setFilterLoading(true);
      try {
        const payload = {
          status,
          shipmentIds: selectedResources,
        };

        const response = await request.post('/api/shipment/change-shipment-status', payload);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if( data.success ) {
          shopify.toast.show(data.message, {duration: 1000});
          setFilterSelected({...filterSelected, reload:true});
          clearSelection();
        }else {
          shopify.toast.show(data.message, {duration: 1000, isError: true})
        }
      } catch (error) {
        console.error('Error changing shipment status:', error);
      } finally {
        setFilterLoading(false);
      }
    })();
  },[request,selectedResources])
  const [modalPromptData, setModalPromptData] = useState({
    message: '',
    confirmCallback: null
  })
  const bulkActions = [
    {
      content: 'Mark as in transit',
      onAction: () => {
        setModalPromptData({
          title: "Mark as in transit",
          message: (
            <Text as="p" variant="bodyMd">
              This shipment will be marked as in transit. This action can't be reversed. Please confirm your operation.
            </Text>

          ),
          confirmCallback: () => {
            handleChangeShipmentStatus('in_transit');
            shopify.modal.hide('vnot-shipment-action-prompt')
          },
        })
        shopify.modal.show('vnot-shipment-action-prompt');
      },
    },
    {
      content: 'Mark as delivered',
      onAction: () => {
        setModalPromptData({
          title: "Mark as delivered",
          message: (
            <>
              <Text as="p" variant="bodyMd">
                This shipment will be marked as delivered. This action can't be reversed. Please confirm your operation.
              </Text>
            </>
          ),
          confirmCallback: () => {
            handleChangeShipmentStatus('delivered', triggerEmail);
            shopify.modal.hide('vnot-shipment-action-prompt')
          },
        })
        shopify.modal.show('vnot-shipment-action-prompt');
      }
    },
    {
      content: 'Mark as unresolved',
      onAction: () => {
        setModalPromptData({
          title: "Mark as unresolved",
          message: (
            <Text as="p" variant="bodyMd">
              This shipment will be marked as unresolved. This action can't be reversed. Please confirm your operation.
            </Text>
          ),
          confirmCallback: () => {
            handleChangeShipmentStatus('unresolved');
            shopify.modal.hide('vnot-shipment-action-prompt')
          },
        })
        shopify.modal.show('vnot-shipment-action-prompt');
      },
    },
  ];

  const promotedBulkActions = [
    {
      content: 'Re track',
      disabled: filterLoading,
      onAction: async () => {
        try{
          setFilterLoading(true)
          const response = await request.post('/api/shipment/re-track-selection', {
            shipmentIds: selectedResources,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();

          shopify.toast.show('Re-track shipments in progress', {duration: 1000});

        }catch (error) {
          console.log('Re-track shipments failed', error)
        }finally {
          setFilterLoading(false);
          clearSelection();
        }
      },
    }, {
      content: 'Send customer email',
      disabled: filterLoading,
      onAction: async () => {
        setModalPromptData({
          title: "Send customer email",
          message: (
            <Text as="p" variant="bodyMd">
              This action will send emails to customers depending on the shipment's status.
            </Text>
          ),
          confirmCallback: async () => {
            try {
              const response = await request.post('/api/shipment/send-customer-email', {
                shipmentIds: selectedResources,
              });

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              const data = await response.json();
              console.log(data);
              shopify.toast.show('Customer emails sent successfully', {duration: 1000});
            }catch( error ) {
              console.error('Error sending email:', error);
            }
            shopify.modal.hide('vnot-shipment-action-prompt')
          },
        })
        await shopify.modal.show('vnot-shipment-action-prompt');
      },
    },
    {
      content: 'Enable Auto updated',
      disabled: filterLoading,
      onAction: async () => {
        try {
          setFilterLoading(true)
          const response = await request.post('/api/shipment/shipment-auto-update', {
            shipmentIds: selectedResources,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          shopify.toast.show(data.message, {duration: 1000});
          setFilterSelected({...filterSelected, reload:true});
          clearSelection();
        } catch( error ) {
          console.error('Error auto-updating:', error);
        }finally {
          setFilterLoading(false)
        }
      }
    }
  ];

  const goDetailShipment = (shipment) => {
    setRedirectShipmentDetail(true);
    navigate(`/app/shipmentdetail?id=${shipment.id}`);
  }

  const subDomain = shopName.split('.').shift()
  const rowMarkup = shipments.map((shipment, index) => {
    if (!shipment) {
      return <></>
    }
    return (
      <IndexTable.Row
        key={shipment.id}
        position={index}
        id={shipment.id}
        selected={selectedResources.includes(shipment.id)}
        onClick={() => goDetailShipment(shipment)}
      >
        {columnsShow.map((column, index) => {
          if (column.hidden) {
            return (<IndexTable.Cell key={index}/>);
          }
          let columnVal = shipment[column.id];
          switch (column.id) {
            case 'orderNumber':
              return (
                <IndexTable.Cell key={index}>
                <span onClick={(e) => e.stopPropagation()}>
                  <Link
                    url={`https://admin.shopify.com/store/${subDomain}/orders/${shipment.orderID}`}
                    removeUnderline
                    target="_blank"
                    dataPrimaryLink
                    onclick={() => console.log('click order')}
                    rel="noopener noreferrer"
                  >
                    #{shipment[ column.id ]}
                  </Link>
                </span>
                </IndexTable.Cell>
              );
            case 'trackingNumber':
              return (
                <IndexTable.Cell key={index}>
               <span onClick={(e) => e.stopPropagation()}>
                 {
                   shipment.externalTracking ?
                     (<Link
                       // url={`https://${shopName}/apps/vitracking?num=${shipment.orderID}`}
                       url={shipment.externalTracking}
                       removeUnderline
                       target="_blank"
                       dataPrimaryLink
                     >
                       {shipment[ column.id ]}
                     </Link>)
                     :
                     (shipment[ column.id ])
                 }
               </span>
                </IndexTable.Cell>
              );
            case 'status':
              const [tone,progress] = getStatusBadge(columnVal)
              return (
                <IndexTable.Cell key={index} >
                  <InlineStack gap="100" align="space-between">
                    <Badge tone={tone} progress={progress}>{( columnVal.charAt(0).toUpperCase() + columnVal.slice(1) ).split("_").join(" ")}</Badge>
                    <Tooltip content="Shipment updated manually">
                      {!shipment.autoUpdate && <Icon source={ClockIcon} tone="warning"/>}
                    </Tooltip>
                  </InlineStack>
                </IndexTable.Cell>
              );
            case 'transitTime':
              return (
                <IndexTable.Cell key={index}>
                  {shipment.transitTime}
                </IndexTable.Cell>
              )
            case 'customer':
              return (
                <IndexTable.Cell key={index}>
                <span onClick={(e) => e.stopPropagation()}>
                <Link url={columnVal.url} target="_blank" removeUnderline>{columnVal.name}</Link>
                </span>
                </IndexTable.Cell>
              );
            default:
              if ( column.id.indexOf('Date') !== -1) {
                columnVal = formatTime(columnVal, "MMM dd, hh:mm a");
              }
              return (
                <IndexTable.Cell key={index}>{columnVal}</IndexTable.Cell>
              );
          }
        })}
      </IndexTable.Row>
    )
  });

  const emptyStateMarkup = (
    <EmptySearchResult
      title={'No shipments found'}
      description={'Try changing the filters or search term'}
      withIllustration
    />
  );

  return (
    <>
    <IndexTable
      condensed={breakpoint.smDown}
      resourceName={resourceName}
      selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
      itemCount={shipments.length}
      headings={columnsShow}
      onSelectionChange={handleSelectionChange}
      bulkActions={bulkActions}
      promotedBulkActions={promotedBulkActions}
      sortable={[]}
      pagination={{
        hasPrevious: pagination.currPage > 1,
        onPrevious: () => {
          changePage('previous')
        },
        hasNext: pagination.currPage < Math.ceil(pagination.totalCount / pageSize),
        onNext: () => {
          changePage('next')
        },
        label: <InlineStack><Text as="p" variant="headingMd">{pagination.currPage} / {Math.ceil(pagination.totalCount / pageSize)}</Text> </InlineStack>,
      }}
      emptyState={emptyStateMarkup}
    >
      {rowMarkup}
    </IndexTable>
      <Modal id="vnot-shipment-action-prompt">
        <Box padding="300">
          {modalPromptData.message}
        </Box>
        <TitleBar title={modalPromptData.title}>
          <button onClick={()=> shopify.modal.hide('vnot-shipment-action-prompt')}>Cancel</button>
          <button variant="primary" onClick={modalPromptData.confirmCallback}>Confirm</button>
        </TitleBar>
      </Modal>
    </>
  );
}
