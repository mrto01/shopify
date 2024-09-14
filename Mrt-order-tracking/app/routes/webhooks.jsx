import { authenticate } from "../shopify.server";
import db from "../db.server";
import {Shipment} from '../models/shipment.js';

const processedFulfillments = new Set(
  process.env.PROCESSED_FULFILLMENTS ? process.env.PROCESSED_FULFILLMENTS.split(',') : []
);

const isFulfillmentProcessed = (fulfillmentID) => {
  return processedFulfillments.has(fulfillmentID);
};

const markFulfillmentAsProcessed = (fulfillmentID) => {
  processedFulfillments.add(fulfillmentID);
  process.env.PROCESSED_FULFILLMENTS = Array.from(processedFulfillments).join(',');
};

const removeFulfillmentProcessed = (fulfillmentID) => {
  processedFulfillments.delete(fulfillmentID)
  process.env.PROCESSED_FULFILLMENTS = Array.from(processedFulfillments).join(',');
}

export const action = async ({ request }) => {
  const { topic, shop, session, admin, payload } = await authenticate.webhook(request);

  if (!admin) {
    // The admin context isn't returned if the webhook fired after a shop was uninstalled.
    throw new Response();
  }
  const createShipmentsFromTrackingNumber = async ( trackingNumbers ) => {
    for ( let trackingNumber of trackingNumbers) {

      let trackingData = await Shipment.track(trackingNumber);
      let shipment = {
        orderID: payload.order_id ?? '',
        fulfillmentID: payload.id ?? '',
        orderNumber: payload.name?.split('.').shift().slice(1) ?? '',
        trackingNumber: trackingNumber,
        carrier: '',
        origin: trackingData?.data.origin?? null,
        destination: trackingData?.data.destination?? null,
        status: trackingData?.data?.status ?? 'unresolved',
        trackingData: {},
        shop: session.shop,
      };

      if (trackingData && !trackingData.data.error) {
        shipment.trackingData = trackingData.data;
        shipment.carrier = trackingData?.data.carriers?.[trackingData?.carrier ?? 0] ?? null;
      }

      await Shipment.create(shipment);

      // Avoid overload
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // The topics handled here should be declared in the shopify.app.toml.
  // More info: https://shopify.dev/docs/apps/build/cli-for-apps/app-configuration
  switch (topic) {
    case "APP_UNINSTALLED":
      if (session) {
        await db.session.deleteMany({ where: { shop } });
      }
      break;
    case "FULFILLMENT_EVENTS_CREATE":

      break;
    case "FULFILLMENT_EVENTS_DELETE":

      break;
    case "FULFILLMENTS_CREATE":
      {
        if (isFulfillmentProcessed(payload.id)) {
          break;
        }

        // We don't want to handle fulfillment from 3rd apps
        const countShipments = await Shipment.read({
          shop: session.shop,
          fulfillmentID: payload.id
        })
        if( payload.status === 'success' && !countShipments.length) {
          const trackingNumbers = payload.tracking_numbers;

          let newTrackingNumbers = trackingNumbers.filter(trackingNumber =>
            !countShipments.some(shipment => shipment.trackingNumber === trackingNumber)
          );
          // Add limit later...
          markFulfillmentAsProcessed(payload.id)
          await createShipmentsFromTrackingNumber(newTrackingNumbers)
          removeFulfillmentProcessed(payload.id)
        }
      }
      break;
    case "FULFILLMENTS_UPDATE":
      if ( payload.status === 'cancelled' ) {
        await Shipment.delete( { fulfillmentID: payload.id } );
      }else {

        if (isFulfillmentProcessed(payload.id)) {
          break;
        }

        let trackingNumbers = payload.tracking_number.split(',');

        // Some 3rd apps merge all tracking numbers in the same line, we should avoid that
        if ( trackingNumbers.length === 1 ) {
          trackingNumbers = payload.tracking_numbers;
          let existShipments = await Shipment.read({
            fulfillmentID: payload.id,
            shop: session.shop
          });

          for( let shipment of existShipments ) {
            if ( !trackingNumbers.includes(shipment.trackingNumber) ) {
              await Shipment.delete({
                fulfillmentID: payload.id,
                trackingNumber: shipment.trackingNumber
              })
            }
          }

          let newTrackingNumbers = trackingNumbers.filter(trackingNumber =>
            !existShipments.some(shipment => shipment.trackingNumber === trackingNumber)
          );

          if ( newTrackingNumbers.length) {
            markFulfillmentAsProcessed(payload.id)
            await createShipmentsFromTrackingNumber(newTrackingNumbers)
            removeFulfillmentProcessed(payload.id)
          }

        }
      }
      break;
    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
