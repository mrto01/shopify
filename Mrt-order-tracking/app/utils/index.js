import { parseISO, isValid, format as dateFormat } from 'date-fns';
import { enUS, vi, fr, de, es, it, ja, ko, zhCN, zhTW, pt, ru, nl } from 'date-fns/locale';
import {defaultShipmentStatuses} from '../define.js';

const localeMap = {
  en: enUS,
  vi: vi,
  fr: fr,
  de: de,
  es: es,
  it: it,
  ja: ja,
  ko: ko,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  pt: pt,
  ru: ru,
  nl: nl,
};

export function formatTime( isoDate, format = 'yyyy-MM-dd HH:mm:ss', localeCode = 'en') {
  const date = parseISO(isoDate);

  if ( !isValid(date) ) {
    return '-';
  }
  const locale = localeMap[localeCode] || enUS;
  return dateFormat(date, format, {locale})
}

export function parseBigInt(obj) {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

export function formatAddress(address) {
  const lines = [];

  // Name line
  const name = address?.name ?? '';
  if (name) lines.push(name);

  // Address lines
  const address1 = address?.address1 ?? '';
  const address2 = address?.address2 ?? '';
  if (address1) lines.push(address1);
  if (address2) lines.push(address2); // Include address2 if it is not empty

  // City, State, ZIP line
  const city = address?.city ?? '';
  const province = address?.province_code ?? '';
  const zip = address?.zip ?? '';
  if (city || province || zip) {
    lines.push([city, province, zip].filter(part => part).join(' '));
  }

  // Country line
  const country = address?.country ?? '';
  if (country) lines.push(country);

  return lines
}


export function getTimeGap(now, past) {
  const date1 = new Date(now);
  const date2 = new Date(past);

  // Calculate the difference in milliseconds
  const differenceInMilliseconds = date1 - date2;

  // Convert milliseconds to days
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const differenceInDays = differenceInMilliseconds / millisecondsPerDay;

  return Math.ceil(differenceInDays)
}

export function getTimeGapLabel(now, past, suffix = true) {
  const date1 = new Date(now);
  const date2 = new Date(past);

  const differenceInMilliseconds = date1 - date2;

  // Calculate milliseconds per unit
  const millisecondsPerMinute = 60 * 1000;
  const millisecondsPerHour = 60 * millisecondsPerMinute;
  const millisecondsPerDay = 24 * millisecondsPerHour;

  let timeDifference = '';
  let unit = '';

  if (differenceInMilliseconds < millisecondsPerHour) {
    const differenceInMinutes = differenceInMilliseconds / millisecondsPerMinute;
    timeDifference = Math.floor(differenceInMinutes);
    unit = 'minute';
  } else if (differenceInMilliseconds < millisecondsPerDay) {
    const differenceInHours = differenceInMilliseconds / millisecondsPerHour;
    timeDifference = Math.floor(differenceInHours);
    unit = 'hour';
  } else {
    const differenceInDays = differenceInMilliseconds / millisecondsPerDay;
    timeDifference = Math.floor(differenceInDays);
    unit = 'day';
  }

  if ( timeDifference !== 0 ) {
    return `${timeDifference} ${unit}${timeDifference > 1 ? 's' : ''} ${suffix ? 'ago' : ''}`;
  }else {
    return '-'
  }
}

export function getStatusBadge(status){
  let tone = 'base'
  let progress = 'incomplete'
  switch(status) {
    case 'pending':
      break;
    case 'info_received':
    case 'in_transit':
      tone = 'info';
      progress = 'partiallyComplete';
      break;
    case 'delivered':
      tone = 'success';
      progress = 'complete';
      break;
    default:
      tone='warning'
  }

  return [tone,progress]
}

export const getFilterViews = (statusCounts) => {
  let totalStatusCounts = statusCounts.reduce( (total, status) => {
    return total + status.count;
  }, 0)

  let filterViews = defaultShipmentStatuses.map( (status) => {
    const count = statusCounts.find( count => count.status === status)?.count?? 0;
    return {
      id: status,
      label: (status.charAt(0).toUpperCase() + status.slice(1) ).split("_").join(" "),
      count: count,
      primary: true,
    }
  })

  filterViews = [ {
    id: 'all',
    label: 'All',
    count: totalStatusCounts,
    primary: true
  }, ...filterViews];

  return filterViews;
}

export function getMergeTags() {
  return {
    sort: true,
    order: {
      name: "Order",
      mergeTags: {
        number:{
          name: "Order number",
          value: "{{order.number}}",
          sample: "123456"
        },
        date: {
          name: "Order date",
          value: "{{order.date}}",
          sample: "2023-09-01"
        }
      }
    },
    carrier: {
      name: "Carrier",
      mergeTags: {
        name:{
          name: "Carrier name",
          value: "{{carrier.name}}",
          sample: "UPS"
        }
      }
    },
    shipment: {
      name: "Shipment",
      mergeTags: {
        tracking_number:{
          name: "Shipment tracking number",
          value: "{{shipment.tracking_number}}",
          sample: "1Z234567890123456789"
        },
        status: {
          name: "Shipment status",
          value: "{{shipment.status}}",
          sample: "In Transit"
        },
        transit_time: {
          name: "Transit time",
          value: "{{shipment.transit_time}}",
          sample: "5 days"
        },
        // estimated_delivery_date: {
        //   name: "Estimated delivery date",
        //   value: "{{shipment.estimated_delivery_date}}",
        //   sample: "2023-09-10"
        // },
        latest_update_time: {
          name: "Latest update time",
          value: "{{shipment.latest_update_time}}",
          sample: "2023-09-07 10:00"
        },
        latest_tracking_event: {
          name: "Latest tracking event",
          value: "{{shipment.latest_tracking_event}}",
          sample: "Package scanned at facility"
        },
        shipping_country: {
          name: "Shipping country",
          value: "{{shipment.shipping_country}}",
          sample: "United States"
        },
        tracking_link: {
          name: "Tracking link",
          value: "{{shipment.tracking_link}}",
          sample: "https://track.ups.com/track/details/1Z234567890123456789"
        }
      }
    },
    store: {
      name: "Store",
      mergeTags: {
        name:{
          name: "Store name",
          value: "{{store.name}}",
          sample: "Mrtos"
        },
        url:{
          name: "Store url",
          value: "{{store.url}}",
          sample: "shop link"
        }
      }
    },
    customer: {
      name: "Customer",
      mergeTags: {
        buyer_name:{
          name: "Buyer name",
          value: "{{customer.buyer_name}}",
          sample: "John Doe"
        },
        buyer_first_name:{
          name: "Buyer first name",
          value: "{{customer.buyer_first_name}}",
          sample: "John"
        },
        recipient_name:{
          name: "Recipient name",
          value: "{{customer.recipient_name}}",
          sample: "Alex Smith"
        },
        recipient_first_name:{
          name: "Recipient first name",
          value: "{{customer.recipient_first_name}}",
          sample: "Alex"
        },
      }
    }
  }
}


