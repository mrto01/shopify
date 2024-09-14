import { create } from 'zustand';
import {useAppBridge} from '@shopify/app-bridge-react';
import {useEffect} from 'react';

export const useShipmentStore = create((set, get) => ({
  // Define initial state
  filterViews: [],
  pagination: { totalCount: 0, currPage: 1 },
  filterSelected: {
    search: '',
    status: '',
    carrier: '',
    origin: '',
    destination: '',
    sortOption: ['orderID desc'],
  },
  filterLoading: false,
  pageSize: 0,
  shipments: [],
  columnsShow: [
    { title: "Order Number", id: "orderNumber", hidden: false },
    { title: "Tracking Number", id: "trackingNumber", hidden: false },
    { title: "Carrier", id: "carrier", hidden: false },
    { title: "Status", id: "status", hidden: false },
    { title: "Destination", id: "destination", hidden: false },
    { title: "Created Date", id: "createdDate", hidden: true },
    { title: "Order Date", id: "orderDate", hidden: true },
    { title: "Transit Time", id: "transitTime", hidden: false },
    { title: "Customer", id: "customer", hidden: false },
    { title: "Email", id: "email", hidden: false },
    { title: "Fulfillment Date", id: "fulfillmentDate", hidden: false },
  ].map(column => ({ ...column, alignment: "start" })),
  redirectShipmentDetail: false,
  shopName: '',
  defaultShipmentStatuses: [],
  totalShipment: 0,
  carrierCounts: [],
  originCounts: [],
  destinationCounts: [],

  // Define actions
  setFilterViews: (filterViews) => set({ filterViews }),
  setPagination: (pagination) => set({ pagination }),
  setFilterSelected: (filterSelected) => set({ filterSelected }),
  setFilterLoading: (filterLoading) => set({ filterLoading }),
  setPageSize: (pageSize) => set({ pageSize }),
  setShipments: (shipments) => set({ shipments }),
  setColumnsShow: (columnsShow) => set({ columnsShow }),
  setRedirectShipmentDetail: (redirectShipmentDetail) => set({ redirectShipmentDetail }),
  setCarrierCounts: (carrierCounts) => set({ carrierCounts }),
  setOriginCounts: (originCounts) => set({ originCounts }),
  setDestinationCounts: (destinationCounts) => set({ destinationCounts }),
  setShopName: (shopName) => set({ shopName }),
  setDefaultShipmentStatuses: (defaultShipmentStatuses) => set({ defaultShipmentStatuses }),
  setTotalShipment: (totalShipment) => set({ totalShipment }),
}));

export const ShipmentProvider = ({ data, children }) => {
  const shipmentStore = useShipmentStore(state => state)
  const shopify = useAppBridge();
  useEffect(() => {
    shopify.loading(false);
    shipmentStore.setFilterViews(data.filterViews);
    shipmentStore.setPagination({
      totalCount: data.totalCount,
      currPage: 1,
    });
    shipmentStore.setPageSize(data.shipmentPageSize);
    shipmentStore.setShipments(data.shipments);
    shipmentStore.setCarrierCounts(data.carrierCounts);
    shipmentStore.setOriginCounts(data.originCounts);
    shipmentStore.setDestinationCounts(data.destinationCounts);
    shipmentStore.setShopName(data.shopName);
    shipmentStore.setDefaultShipmentStatuses(data.defaultShipmentStatuses);
    shipmentStore.setTotalShipment(data.totalShipment);
    shipmentStore.setRedirectShipmentDetail(false);
  }, [data]);

  return <> {shipmentStore.shipments.length && children } </>;
};

