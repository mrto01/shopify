import {
  Button, ChoiceList,
  Filters,
  IndexFilters,
  IndexFiltersMode,
  Modal,
  TextField,
  useSetIndexFiltersMode,
} from '@shopify/polaris';
import {useCallback, useEffect, useState} from 'react';
import {useShipmentStore} from '../../context/ShipmentContext.jsx';
import {useAdminRequest} from '../../utils/app_bridge.js';
import {getFilterViews} from '../../utils/index.js';

export function ShipmentFilter() {
  const request = useAdminRequest();
  const {
    filterViews,
    setFilterViews,
    setShipments,
    filterSelected,
    setFilterSelected,
    setPagination,
    filterLoading,
    setFilterLoading,
    carrierCounts,
    originCounts,
    destinationCounts,
  } = useShipmentStore( state => state);

  /* Query and filters */
  const handleFilterSelectedChange = useCallback( (key, value) => {
    setFilterLoading(true)
    if( !value || value.length === 0) {
      value = '';
    }
    setFilterSelected({
      ...filterSelected,
      [key]: value,
    })
  },[filterSelected])

  const disambiguateLabel = (key, value) => {
    switch (key) {
      case 'status':
        return `${value.map(status => {
          return (status.charAt(0).toUpperCase() + status.slice(1)).split("_").join(" ");
        })}`;
      default:
        return `${value}`;
    }
  }

  let appliedFilters = [];

  for( let [key,value] of Object.entries(filterSelected) ) {
    const excludeFilters = ['sortOption','status']
    if( value && !excludeFilters.includes(key) ) {
        appliedFilters.push({
        key,
        label: disambiguateLabel(key,value),
        unsavedChanges: false,
        onRemove: ()=> handleFilterSelectedChange(key,'')
      })
    }
  }

  useEffect(() => {
    (async () => {
      try{
        const response = await request?.post('/api/shipment/filter',filterSelected)

        if ( !response ) {
          return;
        }

        const data  = await response.json();
        const { shipments, totalCount, statusCounts } = data;
        setPagination({
          totalCount,
          currPage: totalCount ? 1 : 0
        })
        setShipments(shipments);

        const filterViews = getFilterViews( statusCounts )
        setFilterViews( filterViews );
      }catch(err) {
        console.error('Error fetching shipments:', err);
      }finally {
        setFilterLoading(false)
      }
    })()
  }, [filterSelected]);

  const filters = [
    {
      key: "carrier",
      label: "Carriers",
      value: filterSelected.carrier,
      filter:(
        <ChoiceList
          title="Carriers"
          choices={carrierCounts.map( carrier => ({
            value: carrier.carrier,
            label: carrier.carrier,
          }))}
          selected={filterSelected.carrier}
          onChange={value => handleFilterSelectedChange('carrier', value)}
          allowMultiple
        />
      ),
      pinned: true
    },
    {
      key: "origin",
      label: "Origins",
      value: filterSelected.origin,
      filter:(
        <ChoiceList
          title="Origins"
          choices={originCounts.map( origin => ({
            value: origin.origin,
            label: origin.origin,
          }))}
          selected={filterSelected.origin}
          onChange={value => handleFilterSelectedChange('origin', value)}
          allowMultiple
        />
      ),
      pinned: true
    },
    {
      key: "destination",
      label: "Destinations",
      value: filterSelected.destination,
      filter:(
        <ChoiceList
          title="Origins"
          choices={destinationCounts.map( destination => ({
            value: destination.destination,
            label: destination.destination,
          }))}
          selected={filterSelected.destination}
          onChange={value => handleFilterSelectedChange('destination', value)}
          allowMultiple
        />
      ),
      pinned: true
    },
  ];
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /*Sort row*/
  const sortOptions = [
    {
      label: 'Order date',
      value: 'orderID asc',
      directionLabel: 'Oldest to newest',
    }, {
      label: 'Order date',
      value: 'orderID desc',
      directionLabel: 'Newest to oldest',
    }, {
      label: 'Fulfillment date',
      value: 'fulfillmentID asc',
      directionLabel: 'Oldest to newest',
    }, {
      label: 'Fulfillment date',
      value: 'fulfillmentID desc',
      directionLabel: 'Newest to oldest',
    },
  ];

  /* Tabs handle */
  const [selected, setSelected] = useState(0);

  const tabs = filterViews.map((item, index) => ({
    content: `${item.label} (${item.count})`,
    index,
    view: item, /*Save item to use later*/
    id: item.id,
    onAction: () => {
      handleFilterSelectedChange('status', [item.id])
    },
    isLocked: index === 0,
    actions: item.primary ? [] : [
      {
        type: 'rename',
        onAction: () => {
        },
        onPrimaryAction: async (value) => {
          const newItemsStrings = tabs.map((it, idx) => {
            if (idx === index) {
              return value;
            }
            return it.content;
          });
          await sleep(1);
          return true;
        },
      }, {
        type: 'duplicate',
        onPrimaryAction: async (value) => {
          await sleep(1);
          return true;
        },
      }, {
        type: 'edit',
      }, {
        type: 'delete',
        onPrimaryAction: async () => {
          await sleep(1);
          return true;
        },
      },
    ],
  }));

  const handleFiltersClearAll = useCallback(() => {
    setFilterLoading(true)
    setFilterSelected({
      ...filterSelected,
      search: '',
      carrier: '',
      origin: '',
      destination: '',
    })
  }, [filterSelected]);

  const {mode, setMode} = useSetIndexFiltersMode(IndexFiltersMode.Default);

  return (
    <>
      <IndexFilters
        mode={mode}
        setMode={setMode}
        sortOptions={sortOptions}
        sortSelected={filterSelected.sortOption}
        onSort={(value) => {
          handleFilterSelectedChange('sortOption', value)
        }}
        cancelAction={{
          onAction: () => {
          },
          disabled: false,
          loading: false,
        }}
        tabs={tabs}
        selected={selected}
        onSelect={setSelected}
        canCreateNewView
        showEditColumnsButton
        queryValue=""
        onQueryChange={() => {}}
        onQueryClear={() => {}}
        filters={[]}
        appliedFilters={[]}
        onClearAll={() => {}}
        hideFilters
        hideQueryField
        loading={filterLoading}
      />
      <Filters
        filters={filters}
        queryPlaceholder="Order, tracking number"
        queryValue={filterSelected.search}
        onQueryChange={value => handleFilterSelectedChange('search', value)}
        onQueryClear={() => handleFilterSelectedChange('search', '')}
        onClearAll={handleFiltersClearAll}
        appliedFilters={appliedFilters}
      >
        <SaveViewModal/>
      </Filters>
    </>);
}

const SaveViewModal = ({handlePrimaryAction}) => {
  const [open, setOpen] = useState(false);
  const [viewName, setViewName] = useState("")
  const handleChange = () => setOpen(!open);
  const activator = <Button onClick={handleChange}>Save view</Button>
  return (
    <Modal
      activator={activator}
      open={open}
      title="Save view as"
      onClose={handleChange}
      primaryAction={
        {
          disabled: !viewName,
          content: "Save",
          onAction: handlePrimaryAction,
        }
      }
      secondaryActions={[
        {
          content: "Cancel",
          onAction: handleChange
        }
      ]}
    >
    <Modal.Section>
      <TextField
        label="View name"
        value={viewName}
        onChange={setViewName}
        placeholder="Enter your view name"
        autoComplete="off"
      />
    </Modal.Section>
    </Modal>
  )
}
