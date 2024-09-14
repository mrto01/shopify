export const defaultSettings = {
  "use_native_tracking_link": false,
  "auto_update_shopify_shipment": false,
  "trigger_shopify_native_notification": false,
  "tracking_in_order_status_page": false,
  "tracking_in_order_status_page_type": "tracking_link",
  "tracking_in_order_status_page_label": "Click to check your order",
  "dropshiping_mode": true,
  "tracking_pages": [],
  "cron_update_tracking": "",
  "cron_update_tracking_interval": "1",
  "cron_update_tracking_hour": "0",
  "cron_update_tracking_minute": "0",
  "cron_update_tracking_second": "0",
  "cron_update_tracking_range": "60",
  "customer_notification_sender": "Villatheme",
  "customer_notification_email": "support@villatheme.com",
  "customer_info_received_email": {
    "enable": false,
    "subject": "Your shipment from order #1006 is about to ship",
    "design": {
      "counters": {
        "u_column": 1,
        "u_row": 1,
        "u_content_text": 3,
        "u_content_heading": 2,
        "u_content_button": 1,
        "u_content_image": 1
      },
      "body": {
        "id": "LUXM7HH-dA",
        "rows": [
          {
            "id": "9x2ut1wL6U",
            "cells": [
              1
            ],
            "columns": [
              {
                "id": "gVjEHb5xf6",
                "contents": [
                  {
                    "id": "xtT4wQgFrF",
                    "type": "heading",
                    "values": {
                      "containerPadding": "10px",
                      "anchor": "",
                      "headingType": "h1",
                      "fontFamily": {
                        "label": "Open Sans",
                        "value": "'Open Sans',sans-serif",
                        "url": "https://fonts.googleapis.com/css?family=Open+Sans:400,700",
                        "defaultFont": true,
                        "weights": [
                          400,
                          700
                        ]
                      },
                      "fontWeight": 700,
                      "fontSize": "24px",
                      "textAlign": "center",
                      "lineHeight": "140%",
                      "linkStyle": {
                        "inherit": true,
                        "linkColor": "#0000ee",
                        "linkHoverColor": "#0000ee",
                        "linkUnderline": true,
                        "linkHoverUnderline": true
                      },
                      "displayCondition": null,
                      "_meta": {
                        "htmlID": "u_content_heading_1",
                        "htmlClassNames": "u_content_heading"
                      },
                      "selectable": true,
                      "draggable": true,
                      "duplicatable": true,
                      "deletable": true,
                      "hideable": true,
                      "text": "<span>mrtos</span>",
                      "_languages": {}
                    }
                  },
                  {
                    "id": "hQz7_KbvtB",
                    "type": "heading",
                    "values": {
                      "containerPadding": "10px",
                      "headingType": "h1",
                      "fontFamily": {
                        "label": "Open Sans",
                        "value": "'Open Sans',sans-serif",
                        "url": "https://fonts.googleapis.com/css?family=Open+Sans:400,700",
                        "defaultFont": true,
                        "weights": [
                          400,
                          700
                        ]
                      },
                      "fontWeight": 400,
                      "fontSize": "24px",
                      "textAlign": "center",
                      "lineHeight": "140%",
                      "linkStyle": {
                        "inherit": true,
                        "linkColor": "#0000ee",
                        "linkHoverColor": "#0000ee",
                        "linkUnderline": true,
                        "linkHoverUnderline": true
                      },
                      "displayCondition": null,
                      "_meta": {
                        "htmlID": "u_content_heading_2",
                        "htmlClassNames": "u_content_heading"
                      },
                      "selectable": true,
                      "draggable": true,
                      "duplicatable": true,
                      "deletable": true,
                      "hideable": true,
                      "text": "<span>Your order is about to ship🚀</span>",
                      "_languages": {}
                    }
                  },
                  {
                    "id": "8xtORuj84H",
                    "type": "text",
                    "values": {
                      "containerPadding": "10px",
                      "anchor": "",
                      "fontFamily": {
                        "label": "Open Sans",
                        "value": "'Open Sans',sans-serif",
                        "url": "https://fonts.googleapis.com/css?family=Open+Sans:400,700",
                        "defaultFont": true,
                        "weights": [
                          400,
                          700
                        ]
                      },
                      "fontSize": "16px",
                      "textAlign": "center",
                      "lineHeight": "150%",
                      "linkStyle": {
                        "inherit": true,
                        "linkColor": "#0000ee",
                        "linkHoverColor": "#0000ee",
                        "linkUnderline": true,
                        "linkHoverUnderline": true
                      },
                      "displayCondition": null,
                      "_meta": {
                        "htmlID": "u_content_text_2",
                        "htmlClassNames": "u_content_text"
                      },
                      "selectable": true,
                      "draggable": true,
                      "duplicatable": true,
                      "deletable": true,
                      "hideable": true,
                      "text": "<p style=\"line-height: 150%;\">Hi Tom,<br />your order is now ready for shipping and will be picked up by the carrier soon. Thanks for shopping with us.</p>",
                      "_languages": {}
                    }
                  },
                  {
                    "id": "pB0CIdO892",
                    "type": "button",
                    "values": {
                      "containerPadding": "10px",
                      "anchor": "",
                      "href": {
                        "name": "web",
                        "values": {
                          "href": "",
                          "target": "_blank"
                        }
                      },
                      "buttonColors": {
                        "color": "#FFFFFF",
                        "backgroundColor": "#3AAEE0",
                        "hoverColor": "#FFFFFF",
                        "hoverBackgroundColor": "#3AAEE0"
                      },
                      "size": {
                        "autoWidth": true,
                        "width": "100%"
                      },
                      "fontSize": "14px",
                      "textAlign": "center",
                      "lineHeight": "120%",
                      "padding": "10px 20px",
                      "border": {},
                      "borderRadius": "4px",
                      "displayCondition": null,
                      "_meta": {
                        "htmlID": "u_content_button_1",
                        "htmlClassNames": "u_content_button"
                      },
                      "selectable": true,
                      "draggable": true,
                      "duplicatable": true,
                      "deletable": true,
                      "hideable": true,
                      "text": "Track your order",
                      "_languages": {},
                      "calculatedWidth": 142,
                      "calculatedHeight": 37
                    }
                  },
                  {
                    "id": "jzD9U8Zbtd",
                    "type": "text",
                    "values": {
                      "containerPadding": "10px",
                      "fontFamily": {
                        "label": "Open Sans",
                        "value": "'Open Sans',sans-serif",
                        "url": "https://fonts.googleapis.com/css?family=Open+Sans:400,700",
                        "defaultFont": true,
                        "weights": [
                          400,
                          700
                        ]
                      },
                      "fontSize": "16px",
                      "textAlign": "center",
                      "lineHeight": "150%",
                      "linkStyle": {
                        "inherit": true,
                        "linkColor": "#0000ee",
                        "linkHoverColor": "#0000ee",
                        "linkUnderline": true,
                        "linkHoverUnderline": true
                      },
                      "displayCondition": null,
                      "_meta": {
                        "htmlID": "u_content_text_3",
                        "htmlClassNames": "u_content_text"
                      },
                      "selectable": true,
                      "draggable": true,
                      "duplicatable": true,
                      "deletable": true,
                      "hideable": true,
                      "text": "<p style=\"line-height: 150%;\">Tracking number : SPXVN044657567338 </p>\n<p style=\"line-height: 150%;\">                        Carrier : Shopee Express Vietnam</p>",
                      "_languages": {}
                    }
                  },
                  {
                    "id": "Tx_klkE41J",
                    "type": "image",
                    "values": {
                      "containerPadding": "10px",
                      "anchor": "",
                      "src": {
                        "url": "https://assets.unlayer.com/projects/0/1725680807398-logo-villatheme.png",
                        "width": 3612,
                        "height": 3611,
                        "contentType": "image/png",
                        "size": 71688,
                        "autoWidth": false,
                        "maxWidth": "22%"
                      },
                      "textAlign": "center",
                      "altText": "",
                      "action": {
                        "name": "web",
                        "values": {
                          "href": "",
                          "target": "_blank"
                        }
                      },
                      "displayCondition": null,
                      "_meta": {
                        "htmlID": "u_content_image_1",
                        "htmlClassNames": "u_content_image"
                      },
                      "selectable": true,
                      "draggable": true,
                      "duplicatable": true,
                      "deletable": true,
                      "hideable": true,
                      "pending": false
                    }
                  }
                ],
                "values": {
                  "backgroundColor": "#ffffff",
                  "padding": "0px",
                  "border": {},
                  "borderRadius": "0px",
                  "_meta": {
                    "htmlID": "u_column_1",
                    "htmlClassNames": "u_column"
                  }
                }
              }
            ],
            "values": {
              "displayCondition": null,
              "columns": false,
              "backgroundColor": "",
              "columnsBackgroundColor": "",
              "backgroundImage": {
                "url": "",
                "fullWidth": true,
                "repeat": "no-repeat",
                "size": "custom",
                "position": "center",
                "customPosition": [
                  "50%",
                  "50%"
                ]
              },
              "padding": "0px",
              "anchor": "",
              "hideDesktop": false,
              "_meta": {
                "htmlID": "u_row_1",
                "htmlClassNames": "u_row"
              },
              "selectable": true,
              "draggable": true,
              "duplicatable": true,
              "deletable": true,
              "hideable": true
            }
          }
        ],
        "headers": [],
        "footers": [],
        "values": {
          "popupPosition": "center",
          "popupWidth": "600px",
          "popupHeight": "auto",
          "borderRadius": "10px",
          "contentAlign": "center",
          "contentVerticalAlign": "center",
          "contentWidth": "500px",
          "fontFamily": {
            "label": "Arial",
            "value": "arial,helvetica,sans-serif"
          },
          "textColor": "#000000",
          "popupBackgroundColor": "#FFFFFF",
          "popupBackgroundImage": {
            "url": "",
            "fullWidth": true,
            "repeat": "no-repeat",
            "size": "cover",
            "position": "center"
          },
          "popupOverlay_backgroundColor": "rgba(0, 0, 0, 0.1)",
          "popupCloseButton_position": "top-right",
          "popupCloseButton_backgroundColor": "#DDDDDD",
          "popupCloseButton_iconColor": "#000000",
          "popupCloseButton_borderRadius": "0px",
          "popupCloseButton_margin": "0px",
          "popupCloseButton_action": {
            "name": "close_popup",
            "attrs": {
              "onClick": "document.querySelector('.u-popup-container').style.display = 'none';"
            }
          },
          "language": {},
          "backgroundColor": "#F7F8F9",
          "preheaderText": "",
          "linkStyle": {
            "body": true,
            "linkColor": "#0000ee",
            "linkHoverColor": "#0000ee",
            "linkUnderline": true,
            "linkHoverUnderline": true
          },
          "backgroundImage": {
            "url": "",
            "fullWidth": true,
            "repeat": "no-repeat",
            "size": "custom",
            "position": "center"
          },
          "_meta": {
            "htmlID": "u_body",
            "htmlClassNames": "u_body"
          }
        }
      },
      "schemaVersion": 16
    },
    "html": ""
  },
  "customer_in_transit_email":  {
    "enable": false,
    "subject": "Your shipment from order #1006 is in transit",
    "design": {},
    "html": ""
  },
  "customer_delivered_email":  {
    "enable": false,
    "subject": "Your shipment from order #1006 has been delivered",
    "design": {},
    "html": ""
  },
  "seller_notification_email": "seller@villatheme.com",
  "seller_info_received_email":  {
    "enable": false,
    "subject": "Your shipment from order #1006 is about to ship",
    "design": {},
    "html": ""
  },
  "seller_in_transit_email":  {
    "enable": false,
    "subject": "Your shipment from order #1006 is in transit",
    "design": {},
    "html": ""
  },
  "seller_delivered_email":  {
    "enable": false,
    "subject": "Your shipment from order #1006 has been delivered",
    "design": {},
    "html": ""
  },
}

export const defaultShipmentStatuses = ['unresolved','info_received','in_transit','delivered']

export const shipmentPageSize = 15;
