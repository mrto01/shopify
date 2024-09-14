import {json} from '@remix-run/node';
import {authenticate} from '../shopify.server.js';
import {Shipment} from '../models/shipment.js';
import {parseBigInt} from '../utils/index.js';

export async function loader({request}) {
  return json({
    message: 'get shipment',
  });
}

export async function action({request}) {
  const {
    admin,
    session,
  } = await authenticate.public.appProxy(request);

  const params = await request.json();
  const trackingMethod = params?.trackingMethod || 'both';

  /* Validate fields */
  let trackingNumber = params?.trackingNumber || '';
  let orderNumber = params?.orderNumber || '';
  let emailOrPhone = params?.emailOrPhone || '';

  Shipment.loadAdmin(admin, session);
  let {
    shipments,
    totalCount,
  } = await Shipment.getShipments(session.shop, 1, 100, {
    shop: session.shop,
    OR: [
      {
        trackingNumber: trackingNumber,
      }, {
        orderNumber: orderNumber,
      },
    ],
  }, {
    orderBy: {
      orderID: 'asc',
    },
  });

  /* Handle if order number */
  if (!shipments.length && orderNumber && (trackingMethod === 'email_or_phone' || trackingMethod === 'both')) {
    const graphResponse = await admin.graphql(`
      #graphql
      query {
        orders(first: 1, query: "name:#${orderNumber}") {
          edges {
            node {
              id
              name
              phone
              email
              note
              shippingAddress {
                address1
                address2
                city
                province
                country
                zip
                firstName
                lastName
              }
              lineItems( first: 10) {
                edges {
                  node {
                    name
                    title
                    variantTitle
                    quantity
                    image {
                      url
                      altText
                    }
                    product {
                      onlineStorePreviewUrl
                    }
                    variant {
                      id
                      title
                    }
                  }
                }
              }
            }
          }
        }
      }
    `);

    const body = await graphResponse.json();
    let orderNoShipment = body?.data?.orders?.edges || [];
    for ( let order of orderNoShipment ) {
      const shipment = shipmentNoInfo(order);
      if ( shipment.email === emailOrPhone || shipment.phone === emailOrPhone ) {
        shipments.push(shipment);
      }
    }
  }else {
    shipments = Array.from(shipments).filter(shipment => {
      if (trackingMethod === 'tracking_number') {
        return shipment.trackingNumber === trackingNumber;
      } else if (trackingMethod === 'email_or_phone') {
        return (shipment.email === emailOrPhone || shipment.phone ===
          emailOrPhone);
      } else {
        return (shipment.email === emailOrPhone || shipment.phone ===
          emailOrPhone || shipment.trackingNumber === trackingNumber);
      }
    });
  }

  return parseBigInt(shipments);
}

function shipmentNoInfo(order) {
  order = order.node;
  const shipment = {
    orderNumber: order.name.slice(1),
    shippingAddress: order.shippingAddress,
    email: order.email,
    phone: order.phone,
    states: [
      {
        status: "These items have not yet shipped."
      }
    ],
    parcel: order.lineItems.edges.map( data => {
      return {
        title: data.node.title,
        variantTitle: data.node.variantTitle,
        quantity: data.node.quantity,
        image: data.node.image.url,
        url: data.node.product.onlineStorePreviewUrl || '#',
      }
    }),
    note: order.note || 'No notes.',
  }

  return shipment;
}
