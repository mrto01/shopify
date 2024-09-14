
import {authenticate} from '../shopify.server.js';
import {json} from '@remix-run/node';
import {Shipment} from '../models/shipment.js';
import {ShipmentProvider} from '../context/ShipmentContext.jsx';
import {useLoaderData} from '@remix-run/react';
import ShipmentLayout from '../components/shipment/index.jsx';
import {defaultShipmentStatuses, shipmentPageSize} from '../define.js';
import {getFilterViews, parseBigInt} from '../utils/index.js';

export async function loader({request, params}) {
  const { session, admin } = await authenticate.admin(request);
  Shipment.loadAdmin( admin, session );
  const { shipments, totalCount } = await Shipment.getShipments(session.shop);
  const statusCounts = await Shipment.getStatusCounts();
  const {carrierCounts,originCounts,destinationCounts} = await Shipment.getFieldGroups();
  const filterViews = getFilterViews(statusCounts);

  return json(parseBigInt({
    shipments,
    totalCount,
    shopName: session.shop,
    filterViews,
    defaultShipmentStatuses,
    totalShipment: totalCount,
    shipmentPageSize,
    carrierCounts,
    originCounts,
    destinationCounts
  }));
}


export default function ShipmentPage() {
  const data = useLoaderData();
  return (
    <ShipmentProvider data={data}>
      <ShipmentLayout/>
    </ShipmentProvider>
  );

}
