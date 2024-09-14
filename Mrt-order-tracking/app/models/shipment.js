import db from '../db.server.js';
import crypto from "crypto";
import {
  getTimeGapLabel,
  parseBigInt,
} from '../utils/index.js';
import {defaultShipmentStatuses, shipmentPageSize} from '../define.js';

export const Shipment = {
  admin: null,
  session: null,

  loadAdmin(admin, session){
    this.admin = admin
    this.session = session
  },

  async getStatusCounts(condition = {}) {
    let statusCounts = await db.shipment.groupBy({
      by: ['status'],
      where: {
        shop: this.session.shop,
        status: {
          not: 'null',
        },
        ...condition
      },
      _count: {
        _all: true,
      }
    })

    statusCounts = statusCounts.map(group => ({
      count: group._count._all,
      status: group.status,
    }))

    return statusCounts
  },

  async getFieldGroups() {

    let [carrierCounts,originCounts, destinationCounts] = await Promise.all([
      db.shipment.groupBy({
        by: ['carrier'],
        where: {
          shop: this.session.shop,
          carrier: {
            not: 'null'
          }
        },
      }),
      db.shipment.groupBy({
        by: ['origin'],
        where: {
          shop: this.session.shop,
          origin: {
            not: 'null'
          }
        },
      }),
      db.shipment.groupBy({
        by: ['destination'],
        where: {
          shop: this.session.shop,
          destination: {
            not: 'null'
          }
        },
      })
    ]);

    return {carrierCounts, originCounts, destinationCounts}
  },

  async getShipments(shop = '', page = 1,  pageSize = shipmentPageSize, condition = {}, orderBy = { orderBy: {orderID: 'desc'} } ) {
    const skip = (page - 1) * pageSize;

    let [totalCount, shipments] = await Promise.all([
      db.shipment.count({
        where: {
          shop: shop,
          ...condition,
        },
      }),
      db.shipment.findMany({
        where: {
          shop: {
            equals: shop,
          },
          ...condition
        },
        take: pageSize,
        skip: skip,
        ...orderBy
      })
    ]);
    shipments = await Promise.all(shipments.map(async (shipment) => {
      return await this.collectInfo(shipment);
    }));

    return {shipments, totalCount}
  },

  async collectInfo(shipment) {
    if( this.admin != null && this.session != null ) {

      const graphResponse = await this.admin.graphql(
        `#graphql
        query {
          order: node(id: "gid://shopify/Order/${shipment.orderID}") {
            id ... on Order {
              name
              customer {
                id
                displayName
              }
              email
              phone
              processedAt
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
            }
          }
          fulfillment: node(id: "gid://shopify/Fulfillment/${shipment.fulfillmentID}") {
            id ... on Fulfillment {
              createdAt
              fulfillmentLineItems(first: 100) {
                edges {
                  node {
                    lineItem {
                      name
                      title
                      variantTitle
                      quantity
                      image {
                        url
                        altText
                      }
                      product {
                        id
                        onlineStorePreviewUrl
                        onlineStoreUrl
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
        }`
      )
      const graphData = await graphResponse.json();
      const order = graphData?.data?.order;
      const fulfillment = graphData?.data?.fulfillment;
      shipment = {
        ...shipment,
        orderNumber: order?.name?.slice(1)  || '-',
        // carrier: shipment?.trackingData?.carriers?.[shipment.trackingData?.carrier  || 0] ?? '-',
        carrier: shipment.carrier || '-',
        origin: shipment?.trackingData?.origin || '-',
        destination: shipment?.trackingData?.destination  || '-',
        customer: {
          name: order?.customer?.displayName || '-',
          url:  `https://admin.shopify.com/store/${this.session?.shop?.split('.').shift()}/customers/${order?.customer?.id?.replace('gid://shopify/Customer/','')}`
        },
        email: order?.email  || '-',
        phone: order?.phone  || '-',
        orderDate: order?.processedAt  || '-',
        fulfillmentDate: fulfillment?.createdAt  || '-',
        parcel: fulfillment?.fulfillmentLineItems?.edges?.map( data => ({
          title: data.node.lineItem.title,
          variantTitle: data.node.lineItem.variantTitle,
          quantity: data.node.lineItem.quantity,
          image: data.node.lineItem.image.url,
          url: data.node.lineItem.product.onlineStorePreviewUrl || '#',
          editUrl: `https://admin.shopify.com/store/${this.session?.shop?.split('.').shift()}/products/${data.node.lineItem.product.id.replace('gid://shopify/Product/','')}/variants/${data.node.lineItem.variant.id.replace('gid://shopify/ProductVariant/','')}`,
        })) || [],
        shippingAddress: order?.shippingAddress  || '-',
        externalTracking: '',
        states: shipment.trackingData?.states  || [],
      }

      // External tracking url
      if ( shipment.trackingData.externalTracking?.length ) {
        shipment.externalTracking = shipment.trackingData.externalTracking[0].url;
      }

      // Detect carrier
      // if ( shipment.trackingData?.detected?.length ) {
      //   let carriers = shipment.trackingData.detected.map( index => shipment.trackingData.carriers[index])
      //   shipment.carrier = carriers.join(", ")
      // }

      if ( shipment.states.length ) {
        shipment.transitTime = getTimeGapLabel(shipment.states[0].date  || '', shipment.trackingData?.states[shipment.trackingData.states.length - 1 ].date  || '', false);
      }else {
        shipment.transitTime = '-';
        shipment.states.push( {
          location: 'Shop',
          date: new Date(),
          status: "No information is available."
        })
      }
      shipment = this.validateStatus(shipment);
      // Delete trackingData field
      delete shipment.trackingData;
      return parseBigInt(shipment)
    }else {
      return shipment;
    }
  },

  async create( shipment ) {
    shipment = this.validateStatus(shipment);
    const id = await db.shipment.create({data: shipment});
    return id;
  },
  async read(condition) {
    if (typeof condition === 'object' && condition !== null) {
      const shipments = await db.shipment.findMany({
        where: {
          ...condition
        }
      })
      return shipments
    }
  },
  async update( condition, data ) {
    if (typeof condition === 'object' && condition !== null) {
      await db.shipment.updateMany({
        where: {
          ...condition
        },
        data
      })
    }
  },
  async delete( condition ) {
    if (typeof condition === 'object' && condition !== null) {
      await db.shipment.deleteMany({
        where: {
          ...condition
        }
      })
    }
  },


  async track(trackingCode) {
    const secret = process.env.TRACKING_API_KEY;
    const url = process.env.TRACKING_URL;

    let data = {
      tracking_number: trackingCode,
      time: Date.now()
    }
    const hash = generateHMAC(JSON.stringify(data), secret);
    const options = {
      method: "POST",
      headers: {
        "Authorization": hash,
        "Content-type": "application/json"
      },
      body: JSON.stringify(data),
      timeout: 600,
    }
    try {
      const response = await fetch(`${url}/tracking-api`, options)
      if ( response.status !== 200 ) {
        return null;
      }
      return await response.json();

    }catch (err) {
      console.error("Error:", err)
    }

  },

  async reTrack( shipment ) {
    const trackingCode = shipment?.trackingNumber;
    if ( trackingCode ) {
      const trackingData = await this.track(trackingCode);
      const dataUpdate = this.validateStatus({
        trackingData: {},
        status: shipment.autoUpdate && ( trackingData?.data?.status || 'unresolved' ) || shipment.status,
        carrier: trackingData?.data?.carriers?.[trackingData?.data?.carrier || 0]  || null,
        origin: trackingData?.data?.origin || null,
        destination: trackingData?.data?.destination || null,
      })

      if (trackingData && !trackingData.data.error) {
        dataUpdate.trackingData = trackingData.data;
      }

      await db.shipment.update({
        where:{
          id: shipment.id
        },
        data: {
          ...dataUpdate,
          updatedDate: new Date()
        }
      })
      /* Update shopify shipment if setting option is on...*/
    }
  },

  async bulkReTrack( shipments ){
    if(Array.isArray(shipments)) {
      for ( const shipment of shipments) {
        await this.reTrack(shipment);
        // Avoid overload
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
  },

  async findById( id ) {
    const shipment = await db.shipment.findUnique({where: {id: id}});
    if ( shipment ) {
      return this.collectInfo(shipment);
    }else {
      return null;
    }
  },

  async countShipmentsNeedUpdate(daysAgo = 30) {
    const shipmentDate = new Date();
    shipmentDate.setDate(shipmentDate.getDate() - daysAgo);
    const shipmentCount = await db.shipment.count({
      where: {
        AND: [
          {
            createdDate: {
              gte: shipmentDate,
            },
          },
          {
            status: {
              not: 'delivered',
            },
            autoUpdate: true
          },
        ],
      },
    })

    return shipmentCount;
  },

  async getShipmentsNeedUpdate( skip, size, daysAgo = 30){
    const shipmentDate = new Date();
    shipmentDate.setDate(shipmentDate.getDate() - daysAgo);

    const shipments = await db.shipment.findMany({
      where: {
        AND: [
          {
            createdDate: {
              gte: shipmentDate,
            },
          },
          {
            status: {
              not: 'delivered',
            },
            autoUpdate: true
          },
        ],
      },
      take: size,
      skip: skip,
    })

    return shipments;
  },

  async reTrackShipments ( daysAgo = 30) {
    const total = await Shipment.countShipmentsNeedUpdate();
    if (total === 0) return;

    const chunkSize = 10000; // Number of shipments handled per process
    const maxConcurrent = 3; // Number of process

    const tasks = [];
    for (let i = 0; i < total; i += chunkSize) {
      if (tasks.length >= maxConcurrent) {
        await Promise.all(tasks);
        tasks.length = 0;
      }

      tasks.push((async () => {
        let shipments = await Shipment.getShipmentsNeedUpdate(i, chunkSize, daysAgo);
        await Shipment.bulkReTrack(shipments)
      })());
    }

    await Promise.all(tasks);
  },

  async reTrackSelectedShipments(shipmentIds) {
    const shipments = await Shipment.read({
      id: {
        in : shipmentIds
      }
    })
    await Shipment.bulkReTrack(shipments);

  },

  validateStatus(shipment) {
      if ( defaultShipmentStatuses.includes(shipment.status)) {
        return shipment;
      }
      switch (shipment.status) {
        case 'transit':
          const states = shipment.trackingData?.states || [];
          if (states.length === 1) {
            shipment.status = 'info_received';
          }else {
            shipment.status = 'in_transit';
          }
          break;
        case 'archive':
        case 'delivered':
          shipment.status = 'delivered';
          break;
        default:
          shipment.status = 'unresolved';
      }
     return shipment;
    }
};

const generateHMAC = (message, secret) => {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(message);
  return hmac.digest('hex');
};

