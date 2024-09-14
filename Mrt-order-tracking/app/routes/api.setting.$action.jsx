import {json} from '@remix-run/node';
import {authenticate} from '../shopify.server.js';
import {getReplaceMergeTags, sendTrackingMail} from '../utils/utils.server.js';
import Mustache from 'mustache';

export const loader = async ({request}) => {
  // Return some dummy data
  const {session,admin} = await authenticate.admin(request);

  return json({ message: "Hello from another route" });
};

export const action = async ({request, params}) => {

  const {session,admin} = await authenticate.admin(request);
  const data = await request.json();
  switch ( params.action ) {
    case 'create-page':
      {
        const response = await admin.graphql(
            `#graphql
          query {
            shopLocales {
              locale
              primary
              published
            }
          }`
        );
        return json( await response.json())
        const {pageTitle} = await request.json();
        const page = new admin.rest.resources.Page({session:session});
        page.title = pageTitle
        page.body_html = null
        await page.save({
          update: true,
        });
        return json(page)
      }
    case 'create-template': {
      const restResponse = await admin.rest.resources.Order.find({
        session: session,
        id: 5744887627999,
      });
      return restResponse;
    }
    case 'send-test-email':
      {
        const {emailSubject, html} = data;

        const replaceMergeTags = getReplaceMergeTags();
        let renderHtml = Mustache.render(html, replaceMergeTags )
        const mailOptions = {
          sender: 'Mrtos',
          from: 'lodaivlls01@gmail.com',
          to: 'lodaivlls01@gmail.com',
          subject: emailSubject,
          html: renderHtml,
        }

        const response = {
         success: true,
        }
        sendTrackingMail(mailOptions, (error, info) => {
          if (error) {
            response.success = false;
          }
          response.info = info;
          response.error = error;
        })

        return json(response);
      }
    default:
      return json({message: "Action invalid"})
  }
};
