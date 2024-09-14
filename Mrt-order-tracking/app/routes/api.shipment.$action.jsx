import {authenticate} from '../shopify.server.js';
import {json} from '@remix-run/node';
import {Shipment} from '../models/shipment.js';
import {defaultShipmentStatuses, shipmentPageSize} from '../define.js';
import {parseBigInt} from '../utils/index.js';

export async function action({request, params,}) {
  const {
    session,
    admin,
  } = await authenticate.admin(request);

  switch (params.action) {
    case 're-track':
      {
        const {daysAgo} = await request.json();
        await Shipment.reTrackShipments(daysAgo);
        return json({success: true});
      }
    case 're-track-selection':
    {
      const data = await request.json();
      const shipmentIds = data.shipmentIds ? Array.from(data.shipmentIds) : [];
      let response = {
        success: true,
      };
      if( shipmentIds.length) {
       setTimeout(async () => {
         await Shipment.reTrackSelectedShipments(shipmentIds);
       },0)
      }
      return json(parseBigInt(response));
    }
    case 'change-shipment-status':
    {
      const data = await request.json();
      const shipmentIds = data.shipmentIds ? Array.from(data.shipmentIds) : [];
      const status = data.status || '';
      if (shipmentIds.length && defaultShipmentStatuses.includes(status)) {
        await Shipment.update({
          id: { in: shipmentIds }
        }, {
          status: status,
          autoUpdate: false,
        })
        return json({success: true, message: 'Success'})
      }
      return json({success: false, message: 'Failed'});
    }
    case 'shipment-auto-update':
    {
      const data = await request.json();
      const shipmentIds = data.shipmentIds ? Array.from(data.shipmentIds) : [];
      if (shipmentIds.length ) {
        await Shipment.update({
          id: { in: shipmentIds },
          autoUpdate: false
        }, {
          autoUpdate: true,
        })
        return json({success: true, message: 'Shipments are auto updated'})
      }
      return json({success: false, message: 'Failed'});
    }
    case 'filter':
      {
        let filter = await request.json();

        /* Validate status */
        let statuses = filter?.status ?? [];
        if (statuses.includes('all') || statuses.length === 0) {
          statuses = defaultShipmentStatuses;
        }
        /* Validate carriers */
        let carriers = filter?.carrier ?? [];
        carriers = Array.from(carriers).filter(item => item != null);
        /* Validate origins */
        let origins = filter?.origin ?? [];
        origins = Array.from(origins).filter(item => item != null);
        /* Validate destinations */
        let destinations = filter?.destination ?? [];
        destinations = Array.from(destinations).filter(item => item != null);
        /* Validate search key*/
        let search = filter?.search ?? '';
        /* Validate sort option*/
        let sortOption = Array.from(filter?.sortOption ?? ['orderID desc']).pop();
        let [sortField, sortType] = sortOption.split(" ");
        const validSortFields = ['orderID', 'fulfillmentID']
        sortField = validSortFields.includes(sortField) ? sortField : 'orderID';
        sortType = sortType === 'desc' ? sortType : 'asc';

        const condition = {
          AND: [
            {
              status: {
                in: statuses,
              },
            },
            ...(carriers.length ? [{carrier: {in: carriers}}] : []),
            ...(origins.length ? [{origin: {in: origins}}] : []),
            ...(destinations.length ? [{destination: {in: destinations}}] : []),
          ],
          OR: [
            {
              trackingNumber: {
                contains: search,
              }
            }, {
              orderNumber: {
                contains: search,
              }
            }
          ]
        }

        const orderBy = {
          orderBy: {
            [ sortField ]: sortType
          }
        }
        const data = await Shipment.getShipments(session.shop, filter.page,
          shipmentPageSize, condition, orderBy);
        const statusCounts = await Shipment.getStatusCounts({
          ...condition,
          AND: condition.AND.slice(1)
        });
        return parseBigInt({
          ...data,
          statusCounts
        });
    }
  }
}
