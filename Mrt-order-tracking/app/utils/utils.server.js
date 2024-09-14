import nodemailer from 'nodemailer';

let mailTransporter = null;

export function sendTrackingMail( mailOptions, callback = null ) {
  if (!mailTransporter) {
    mailTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'lodaivlls01@gmail.com',
        pass: process.env.SMTP_PASSWORD
      },
    })
  }

  mailTransporter.sendMail(mailOptions, callback);
}

export function getReplaceMergeTags( shipmentId = null ) {
  if (shipmentId) {

  }else {
    return {
      order: {
        number: '1000',
        date: new Date('2024-09-09 15:04:05'),
      },
      carrier: {
        name: 'UPS',
      },
      shipment: {
        tracking_number: '1Z234567890123456789',
        status: 'In Transit',
        transit_time: '5days',
        latest_update_time: new Date('2024-09-09 19:01:05'),
        latest_tracking_event: "Package scanned at facility",
        shipping_country: "Viet Nam",
        tracking_link: "https://track.ups.com/track/details/1Z234567890123456789"
      },
      store: {
        name: 'Vinext Store',
        url: 'mrtos.myshopify.com'
      },
      customer: {
        buyer_name: 'Vinext buyer',
        buyer_first_name: 'ViNext',
        recipient_name: 'Villtheme recipient',
        recipient_first_name: 'Villatheme'
      },
    }
  }
}
