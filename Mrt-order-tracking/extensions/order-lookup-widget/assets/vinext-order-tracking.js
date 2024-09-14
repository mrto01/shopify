
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const settings = window.vnotTrackingBlock || {};
  const domResult = document.getElementById('vnot-tracking-result');
  if( !Shopify.designMode ) {
    domResult?.replaceChildren();
    domResult?.classList.remove('vnot-hidden-field');
  }else {
    domResult?.classList.remove('vnot-hidden-field');
  }

  /* Constant */
  const TIMELINE_EVENT_LIMIT = 4;

  const vnotF = {
    async httpRequest(method, endpoint, param = {}) {
      let options = {
        method: method,
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (method === 'POST') {
        options.body = JSON.stringify(param);
      }

      try {
        const response = await fetch(`/apps/vitracking/${endpoint}`, options);
        if (!response.ok) {
          throw new Error(`HTTP error! status ${response.status}`);
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching shipments:', error);
        return null;
      }
    },

    async getRequest(endpoint) {
      return await this.httpRequest('GET', endpoint);
    },

    async postRequest(endpoint, param) {
      return await this.httpRequest('POST', endpoint, param);
    },

    setCookie(cName, cValue, expire) {
      let d = new Date();
      d.setTime(d.getTime() + expire);
      let expires = 'expires=' + d.toUTCString();
      document.cookie = cName + '=' + cValue + ';' + expires + ';path=/';
    },

    setCookieNew(cname, expire, cvalue = '', isDate = false) {
      var d = new Date();
      var d_timestamp = d.getTime() + expire;
      if (isDate) {
        d_timestamp = expire;
      }
      d.setTime(d_timestamp);
      if (!cvalue) {
        cvalue = d_timestamp;
      }
      document.cookie = cname + '=' + cvalue + ';expires=' + d.toUTCString() + ';path=/';

    },

    getCookie(cName) {
      let name = cName + '=';
      let decodedCookie = decodeURIComponent(document.cookie);
      let ca = decodedCookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[ i ];
        while (c.charAt(0) === ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
          return c.substring(name.length, c.length);
        }
      }
      return '';
    },

    validateTrackingForm(trackingButton) {
      const trackingNumber = document.getElementById('vnot-tracking-number');
      const orderNumber = document.getElementById('vnot-order-number');
      const emailOrPhone = document.getElementById('vnot-email-phone');
      const errorMessageGeneral = document.getElementById('vnot-message-error-general')

      /* Decide which fields are using for tracking */
      let trackingMethod = 'both'

      // Validation flags
      let isValid = true;

      const validateTrackingNumber = () => {
        if (!trackingNumber?.value.trim()) {
          trackingNumber.setCustomValidity('Tracking number is required.')
          isValid = false;
        }
      }

      const validateOrderNumber = () => {
        if (!orderNumber?.value.trim()) {
          orderNumber.setCustomValidity('Order number is required.');
          isValid = false;
        } else if (!/^\d+$/.test(orderNumber.value.trim())) {
          orderNumber.setCustomValidity('Invalid order number format.');
          isValid = false;
        }
      }

      const validateEmailOrPhone = () => {
        if (!emailOrPhone?.value.trim()) {
          emailOrPhone.setCustomValidity('Email or phone number is required.');
          isValid = false;
        } else if (!this.validateEmailOrPhone(emailOrPhone.value.trim())) {
          emailOrPhone.setCustomValidity('Invalid email or phone number format.');
          isValid = false;
        }
      }

      // Clear previous error messages
      orderNumber?.setCustomValidity('');
      emailOrPhone?.setCustomValidity('');
      trackingNumber?.setCustomValidity('');
      errorMessageGeneral?.remove();


      // Validity process
      if( settings.vnot_tracking_form_option == 1 ) {
        validateOrderNumber();
        validateEmailOrPhone();
      }else if( settings.vnot_tracking_form_option == 2) {
        validateTrackingNumber();
      }else {
        if (settings.vnot_tracking_form_style == "show_all") {
          if( orderNumber?.value.trim() || emailOrPhone?.value.trim() ){
            validateOrderNumber();
            validateEmailOrPhone();
          }else if(!orderNumber?.value.trim() && !emailOrPhone?.value.trim() && !trackingNumber?.value.trim()) {
            let message = "Please provide either the Tracking Number or both Email/Phone and Order Number.";
            let errorEl = document.createElement('span');
            errorEl.id = 'vnot-message-error-general';
            errorEl.style.color = 'red';
            errorEl.textContent = message;
            document.querySelector('.vnot-tracking-form').insertBefore(errorEl,trackingButton)
            isValid = false;
          }
        }else {
          if(document.getElementById('vnot-track-by-order-info')?.checked) {
            validateOrderNumber();
            validateEmailOrPhone();
            trackingMethod = 'email_or_phone'
          }else {
            validateTrackingNumber();
            trackingMethod = 'tracking_number'
          }
        }
      }

      if (isValid) {
        return {
          orderNumber: orderNumber?.value,
          emailOrPhone: emailOrPhone?.value,
          trackingNumber: trackingNumber?.value,
          trackingMethod
        };
      }else {
        emailOrPhone?.reportValidity();
        orderNumber?.reportValidity();
        trackingNumber?.reportValidity();
        return false;
      }
    },

    validateEmailOrPhone(input) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phonePattern = /^\+?\d{10,14}$/;
      return emailPattern.test(input) || phonePattern.test(input);
    },

    formatStatus(status) {
      return (status.charAt(0).toUpperCase() + status.slice(1)).split("_").join(" ");
    },

    formatDate24( isoString ) {
      const date = new Date(isoString);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },

    formatDate12( isoString ) {
      const date = new Date(isoString);

      const year = date.getFullYear();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[date.getMonth()]; // Get month name
      const day = String(date.getDate()).padStart(2, '0');

      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';

      hours = hours % 12;
      hours = hours ? hours : 12;

      return `${month} ${day}, ${year} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

    },

    formatMapsUrl(address) {
      const fullAddress = `${address.city}, ${address.province}, ${address.country}`;

      const encodedAddress = encodeURIComponent(fullAddress);

      return `https://maps.google.com/maps?q=${encodedAddress}&z=7&output=embed`;

    },

    formatShippingAddress(address) {
      let shippingAddress = [address.address1, address.city,address.province, address.country].filter( value => !!value ).join(', ');
      return shippingAddress;
    },

    renderTrackingResult( shipments ) {
      let html = '';
      if (shipments?.length) {
        shipments = Array.from(shipments)
        html = `<div class="vnot-tracking-general-info">
                    ${vnotC.OrderNumber(shipments[0]?.orderNumber)}
                    ${vnotC.ShipmentTab(shipments.length)}
                 </div>`;
        for ( const[index, shipment] of shipments.entries() ) {
          html += vnotC.ShipmentInfo(shipment, index);
        }
      }else {
        html = `<h2 class="vnot-tracking-not-found">Could not find order</h2>`;
      }
      if ( domResult ) {
        domResult.innerHTML = html;

        /* Handle shipment tab change*/
        const tabs = Array.from(document.getElementsByClassName('vnot-shipment-tab-item'));
        const tabContents = Array.from(document.getElementsByClassName('vnot-tracking-shipment-info'));
        let currentTabIndex = 0;
        if (tabs.length && tabContents.length) {
          tabs.forEach( (tab, index) => {
            tab.onclick = (e) => {
              if ( currentTabIndex !== index ) {

                tabs[currentTabIndex].classList.remove('active')
                tabContents[currentTabIndex].classList.add('vnot-hidden-field')

                tabs[index].classList.add('active')
                tabContents[index].classList.remove('vnot-hidden-field')

                document.querySelector('.vnot-tracking-package-order-number').textContent = `Order: #${shipments[index].orderNumber}`

                currentTabIndex = index;

              }
            }
          })
        }

        /* Handle show all/show less timeline events*/
        const toggleShowTimelineEvents = Array.from(document.getElementsByClassName('vnot-tracking-timeline-view-all'));
        toggleShowTimelineEvents.forEach( showButton => {
          showButton.onclick = (e) => {
            const timelineContainer = showButton.closest('.vnot-tracking-timeline');
            const timelineEvents = Array.from(timelineContainer.getElementsByClassName('vnot-tracking-timeline-event')).slice(TIMELINE_EVENT_LIMIT - 1);
            const scrollMark = timelineEvents.shift();
            const hidden = timelineEvents.some( timelineEvent => timelineEvent.classList.contains('vnot-hidden-field'));
            if ( hidden ) {
              showButton.textContent = 'Show less';
            }else {
              showButton.textContent = 'Show all';
            }
            timelineEvents.forEach( timelineEvent => {
              timelineEvent.classList.toggle('vnot-hidden-field');
            })
            scrollMark.scrollIntoView({behavior: 'instant', block: 'center'});
          }
        })
      }
    },

  };

  const vnotC = {
    shipment: {},
    OrderNumber(val) {
      return `<h2 class="vnot-tracking-package-order-number">Order: #${val}</h2>`
    },
    ShipmentTab(len) {
      if ( len <=1 ) {
        return '';
      }

      let html = `<div class="vnot-shipment-tab">`;
      for( let i = 1 ; i <= len; i++ ) {
        html+= `<div class="vnot-shipment-tab-item ${ i === 1 ? 'active' : ''} "> Shipment #${i}</div>`;
      }
      html+= `</div>`;
      return html;
    },

    ShipmentProgress() {
      const statusPattern = ['unresolved','info_received','in_transit','delivered'];
      const statusPoint = statusPattern.indexOf(this.shipment.status);
      let html = `<div class="vnot-progress-bar-wrapper ">`;
      if (this.shipment.updatedDate) {
        html += `<p class="vnot-tracking-last-update"> <strong>Last updated:</strong> <span>${vnotF.formatDate12(this.shipment.updatedDate)}</span></p>`;
      }
      if (settings.vnot_show_progress_bar === "true") {
        html += `<ul class="vnot-progress-bar">
            <li>
              <span class="vnot-progress-icon">
                  <svg width="35px" height="35px" viewBox="0 0 1024 1024" fill="#000000" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="20.48"><path d="M300 462.4h424.8v48H300v-48zM300 673.6H560v48H300v-48z" fill=""></path><path d="M818.4 981.6H205.6c-12.8 0-24.8-2.4-36.8-7.2-11.2-4.8-21.6-11.2-29.6-20-8.8-8.8-15.2-18.4-20-29.6-4.8-12-7.2-24-7.2-36.8V250.4c0-12.8 2.4-24.8 7.2-36.8 4.8-11.2 11.2-21.6 20-29.6 8.8-8.8 18.4-15.2 29.6-20 12-4.8 24-7.2 36.8-7.2h92.8v47.2H205.6c-25.6 0-47.2 20.8-47.2 47.2v637.6c0 25.6 20.8 47.2 47.2 47.2h612c25.6 0 47.2-20.8 47.2-47.2V250.4c0-25.6-20.8-47.2-47.2-47.2H725.6v-47.2h92.8c12.8 0 24.8 2.4 36.8 7.2 11.2 4.8 21.6 11.2 29.6 20 8.8 8.8 15.2 18.4 20 29.6 4.8 12 7.2 24 7.2 36.8v637.6c0 12.8-2.4 24.8-7.2 36.8-4.8 11.2-11.2 21.6-20 29.6-8.8 8.8-18.4 15.2-29.6 20-12 5.6-24 8-36.8 8z" fill=""></path><path d="M747.2 297.6H276.8V144c0-32.8 26.4-59.2 59.2-59.2h60.8c21.6-43.2 66.4-71.2 116-71.2 49.6 0 94.4 28 116 71.2h60.8c32.8 0 59.2 26.4 59.2 59.2l-1.6 153.6z m-423.2-47.2h376.8V144c0-6.4-5.6-12-12-12H595.2l-5.6-16c-11.2-32.8-42.4-55.2-77.6-55.2-35.2 0-66.4 22.4-77.6 55.2l-5.6 16H335.2c-6.4 0-12 5.6-12 12v106.4z" ></path></svg>
              </span>
              <div class="vnot-progress one active">
                <span class="vnot-complete-icon"></span>
              </div>
              <p class="text">Ordered</p>
            </li>
            <li>
              <span class="vnot-progress-icon">
                  <svg fill="#000000" width="35px" height="35px" viewBox="0 0 100 100" data-name="Layer 1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="2"><path d="M56,81.29a1.5,1.5,0,0,1-.45-2.93l16.46-5.15a1.5,1.5,0,0,1,.9,2.86L56.49,81.22A1.41,1.41,0,0,1,56,81.29Z"></path><path d="M56,74.29a1.5,1.5,0,0,1-.45-2.93l10.53-3.29A1.5,1.5,0,1,1,67,70.93L56.49,74.22A1.41,1.41,0,0,1,56,74.29Z"></path><path d="M23.32,54.08h0Z"></path><path d="M23.26,30.08A.94.94,0,0,0,23,30a.05.05,0,0,0,0,0h.06A1.37,1.37,0,0,1,23.26,30.08Z"></path><path d="M37.74,35.48a1.41,1.41,0,0,0-.37.8,1,1,0,0,1,.05-.3,1.59,1.59,0,0,1,.22-.43Z"></path><path d="M89.37,28a.51.51,0,0,0,0-.17.84.84,0,0,0,0-.17,1.11,1.11,0,0,0-.07-.16,1.24,1.24,0,0,0-.31-.42L88.77,27a1.22,1.22,0,0,0-.29-.17l-.08,0-26.06-11L50.87,10.94l-.09,0a1.29,1.29,0,0,0-.26-.08,1.38,1.38,0,0,0-.64,0,1.29,1.29,0,0,0-.26.08l-.06,0-38,15.8h0a1.3,1.3,0,0,0-.26.14h0a.66.66,0,0,0-.15.14.24.24,0,0,0-.1.1,1.43,1.43,0,0,0-.34.6,1.34,1.34,0,0,0-.06.4V76.87A1.49,1.49,0,0,0,11.7,78.3L49.16,90h0l1.42.17L70,84.11h0l18.27-5.72a1.48,1.48,0,0,0,1-1.43V28.19A1.09,1.09,0,0,0,89.37,28ZM48.54,86.67l-34.9-10.9V30.14l7.28,2.28V52.66a1.51,1.51,0,0,0,1,1.42l.23.08.12,0h0l.1,0a1.09,1.09,0,0,0,.26,0h.11a.18.18,0,0,0,.1,0,.4.4,0,0,0,.15,0l.23-.07,0,0h0a.6.6,0,0,0,.15-.09.61.61,0,0,0,.16-.12l.08-.07,6.82-6,7,10.92.09.15a1.51,1.51,0,0,0,1,.68h.44a.28.28,0,0,0,.13,0,.19.19,0,0,0,.1,0l.12,0a1,1,0,0,0,.23-.12l0,0a1.24,1.24,0,0,0,.22-.18L40,59a1.09,1.09,0,0,0,.13-.17.94.94,0,0,0,.14-.26,1.31,1.31,0,0,0,.09-.28,1.53,1.53,0,0,0,0-.3V38.5l8.18,2.55ZM38.37,35l-.1.07-.53.4a1.41,1.41,0,0,0-.37.8,1.09,1.09,0,0,0,0,.18V52.88l-5.2-8.14a.25.25,0,0,0,0-.08,1,1,0,0,0-.13-.18,1.8,1.8,0,0,0-.21-.19.79.79,0,0,0-.23-.14l-.14-.07a.64.64,0,0,0-.18-.06L31,44a1.27,1.27,0,0,0-.39,0l-.21,0a1.19,1.19,0,0,0-.35.15l-.2.14,0,0-.12.11-5.83,5.16V32.81a.92.92,0,0,0,.27-.08l16.57-6.89,9.42,4.26Zm11.8,3.41-6.94-2.18,11.3-4.7.24-.13a1.24,1.24,0,0,0,.22-.18,1.39,1.39,0,0,0,.33-.46s0,0,0,0a1.13,1.13,0,0,0,.08-.24.15.15,0,0,0,0-.07,1.09,1.09,0,0,0,0-.26,1.47,1.47,0,0,0-.07-.46s0-.09-.05-.13a2,2,0,0,0-.1-.21l-.13-.18a1.26,1.26,0,0,0-.2-.2l-.07,0a.87.87,0,0,0-.26-.16L41.51,22.89h-.07a1.43,1.43,0,0,0-1.23,0L23.06,30a1.37,1.37,0,0,1,.2.13A.94.94,0,0,0,23,30a.05.05,0,0,0,0,0,.31.31,0,0,0-.13-.06l-6.33-2,33.66-14,11,4.63L83.52,28ZM86.38,75.85,69.16,81.24,51.54,86.75V41.13l34.84-10.9Z"></path><path d="M23.26,30.08A.94.94,0,0,0,23,30h0A1.37,1.37,0,0,1,23.26,30.08Z"></path><path d="M37.74,35.48a1.41,1.41,0,0,0-.37.8,1.09,1.09,0,0,0,0,.18v.27a1.46,1.46,0,0,1,.28-1.18Z"></path><path d="M23.31,54.08h0Z"></path></svg>
              </span>
              <div class="vnot-progress ${statusPoint >= 1 && 'active'}">
                <span class="vnot-complete-icon"></span>
              </div>
              <p class="text">Info received</p>
            </li>
            <li>
              <span class="vnot-progress-icon">
                  <svg width="35px" height="35px" viewBox="0 -1 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.31 16.826C12.2864 17.9963 11.3464 18.9278 10.2052 18.9118C9.06401 18.8957 8.14927 17.9382 8.15697 16.7676C8.16467 15.5971 9.09191 14.6522 10.2332 14.652C10.7897 14.6578 11.3212 14.8901 11.7106 15.2978C12.1001 15.7055 12.3157 16.2552 12.31 16.826V16.826Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M22.2014 16.826C22.1778 17.9963 21.2378 18.9278 20.0966 18.9118C18.9554 18.8957 18.0407 17.9382 18.0484 16.7676C18.0561 15.5971 18.9833 14.6522 20.1246 14.652C20.6811 14.6578 21.2126 14.8901 21.602 15.2978C21.9915 15.7055 22.2071 16.2552 22.2014 16.826V16.826Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M17.8032 17.576C18.2174 17.576 18.5532 17.2402 18.5532 16.826C18.5532 16.4118 18.2174 16.076 17.8032 16.076V17.576ZM12.31 16.076C11.8958 16.076 11.56 16.4118 11.56 16.826C11.56 17.2402 11.8958 17.576 12.31 17.576V16.076ZM17.0571 16.826C17.0571 17.2402 17.3928 17.576 17.8071 17.576C18.2213 17.576 18.5571 17.2402 18.5571 16.826H17.0571ZM18.5571 11.559C18.5571 11.1448 18.2213 10.809 17.8071 10.809C17.3928 10.809 17.0571 11.1448 17.0571 11.559H18.5571ZM17.8071 16.076C17.3928 16.076 17.0571 16.4118 17.0571 16.826C17.0571 17.2402 17.3928 17.576 17.8071 17.576V16.076ZM18.0518 17.576C18.466 17.576 18.8018 17.2402 18.8018 16.826C18.8018 16.4118 18.466 16.076 18.0518 16.076V17.576ZM22.189 16.0762C21.7749 16.0852 21.4465 16.4281 21.4555 16.8423C21.4644 17.2564 21.8074 17.5848 22.2215 17.5758L22.189 16.0762ZM24.4 14.485L25.1499 14.4718C25.1492 14.4331 25.1455 14.3946 25.1389 14.3565L24.4 14.485ZM24.63 11.4305C24.559 11.0224 24.1706 10.7491 23.7625 10.8201C23.3544 10.8911 23.0812 11.2794 23.1521 11.6875L24.63 11.4305ZM17.8031 6.127C17.3889 6.127 17.0531 6.46279 17.0531 6.877C17.0531 7.29121 17.3889 7.627 17.8031 7.627V6.127ZM21.2849 6.877L21.2849 7.62702L21.2897 7.62698L21.2849 6.877ZM22.8737 7.56387L22.327 8.07731L22.327 8.07731L22.8737 7.56387ZM23.4835 9.218L22.7342 9.18603C22.7319 9.23979 22.7354 9.29363 22.7446 9.34663L23.4835 9.218ZM23.1522 11.6876C23.2232 12.0957 23.6116 12.3689 24.0197 12.2979C24.4278 12.2268 24.701 11.8384 24.6299 11.4304L23.1522 11.6876ZM18.5531 6.877C18.5531 6.46279 18.2174 6.127 17.8031 6.127C17.3889 6.127 17.0531 6.46279 17.0531 6.877H18.5531ZM17.0531 11.559C17.0531 11.9732 17.3889 12.309 17.8031 12.309C18.2174 12.309 18.5531 11.9732 18.5531 11.559H17.0531ZM17.0531 6.877C17.0531 7.29121 17.3889 7.627 17.8031 7.627C18.2174 7.627 18.5531 7.29121 18.5531 6.877H17.0531ZM17.8031 6.077L17.0531 6.0722V6.077H17.8031ZM16.7657 5L16.77 4.25H16.7657V5ZM7.42037 5L7.42037 4.24999L7.41679 4.25001L7.42037 5ZM6.68411 5.31693L6.14467 4.79587L6.14467 4.79587L6.68411 5.31693ZM6.382 6.075L7.13201 6.075L7.13199 6.07158L6.382 6.075ZM6.382 15.75L7.132 15.7534V15.75H6.382ZM6.68411 16.5081L6.14467 17.0291L6.14467 17.0291L6.68411 16.5081ZM7.42037 16.825L7.41679 17.575H7.42037V16.825ZM8.1526 17.575C8.56681 17.575 8.9026 17.2392 8.9026 16.825C8.9026 16.4108 8.56681 16.075 8.1526 16.075V17.575ZM17.8051 10.808C17.3909 10.808 17.0551 11.1438 17.0551 11.558C17.0551 11.9722 17.3909 12.308 17.8051 12.308V10.808ZM23.893 12.308C24.3072 12.308 24.643 11.9722 24.643 11.558C24.643 11.1438 24.3072 10.808 23.893 10.808V12.308ZM1 6.25C0.585786 6.25 0.25 6.58579 0.25 7C0.25 7.41421 0.585786 7.75 1 7.75V6.25ZM4.05175 7.75C4.46596 7.75 4.80175 7.41421 4.80175 7C4.80175 6.58579 4.46596 6.25 4.05175 6.25V7.75ZM1.975 9.25C1.56079 9.25 1.225 9.58579 1.225 10C1.225 10.4142 1.56079 10.75 1.975 10.75V9.25ZM3.925 10.75C4.33921 10.75 4.675 10.4142 4.675 10C4.675 9.58579 4.33921 9.25 3.925 9.25V10.75ZM2.56975 12.25C2.15554 12.25 1.81975 12.5858 1.81975 13C1.81975 13.4142 2.15554 13.75 2.56975 13.75V12.25ZM3.925 13.75C4.33921 13.75 4.675 13.4142 4.675 13C4.675 12.5858 4.33921 12.25 3.925 12.25V13.75ZM17.8032 16.076H12.31V17.576H17.8032V16.076ZM18.5571 16.826V11.559H17.0571V16.826H18.5571ZM17.8071 17.576H18.0518V16.076H17.8071V17.576ZM22.2215 17.5758C23.8876 17.5397 25.1791 16.1341 25.1499 14.4718L23.6501 14.4982C23.6655 15.3704 22.9939 16.0587 22.189 16.0762L22.2215 17.5758ZM25.1389 14.3565L24.63 11.4305L23.1521 11.6875L23.6611 14.6135L25.1389 14.3565ZM17.8031 7.627H21.2849V6.127H17.8031V7.627ZM21.2897 7.62698C21.6768 7.62448 22.0522 7.7847 22.327 8.07731L23.4204 7.05042C22.8641 6.4581 22.0909 6.12177 21.28 6.12702L21.2897 7.62698ZM22.327 8.07731C22.6025 8.37065 22.7519 8.7712 22.7342 9.18603L24.2328 9.24997C24.2675 8.43728 23.976 7.642 23.4204 7.05042L22.327 8.07731ZM22.7446 9.34663L23.1522 11.6876L24.6299 11.4304L24.2224 9.08937L22.7446 9.34663ZM17.0531 6.877V11.559H18.5531V6.877H17.0531ZM18.5531 6.877V6.077H17.0531V6.877H18.5531ZM18.5531 6.0818C18.5562 5.60485 18.3745 5.14259 18.0422 4.79768L16.9619 5.83829C17.0188 5.8974 17.0537 5.98123 17.0532 6.0722L18.5531 6.0818ZM18.0422 4.79768C17.7094 4.45212 17.2522 4.25277 16.77 4.25001L16.7615 5.74999C16.8331 5.7504 16.9056 5.77984 16.9619 5.83829L18.0422 4.79768ZM16.7657 4.25H7.42037V5.75H16.7657V4.25ZM7.41679 4.25001C6.93498 4.25231 6.4778 4.45098 6.14467 4.79587L7.22355 5.83799C7.27989 5.77967 7.3524 5.75033 7.42396 5.74999L7.41679 4.25001ZM6.14467 4.79587C5.81216 5.1401 5.62983 5.60177 5.63201 6.07843L7.13199 6.07158C7.13158 5.98066 7.16659 5.89696 7.22355 5.83799L6.14467 4.79587ZM5.632 6.075V15.75H7.132V6.075H5.632ZM5.63201 15.7466C5.62983 16.2232 5.81216 16.6849 6.14467 17.0291L7.22355 15.987C7.16659 15.928 7.13158 15.8443 7.13199 15.7534L5.63201 15.7466ZM6.14467 17.0291C6.4778 17.374 6.93498 17.5727 7.41679 17.575L7.42396 16.075C7.3524 16.0747 7.27988 16.0453 7.22355 15.987L6.14467 17.0291ZM7.42037 17.575H8.1526V16.075H7.42037V17.575ZM17.8051 12.308H23.893V10.808H17.8051V12.308ZM1 7.75H4.05175V6.25H1V7.75ZM1.975 10.75H3.925V9.25H1.975V10.75ZM2.56975 13.75H3.925V12.25H2.56975V13.75Z" fill="#000000"></path></svg>
              </span>
              <div class="vnot-progress ${statusPoint >= 2 && 'active'}">
                <span class="vnot-complete-icon"></span>
              </div>
              <p class="text">In transit</p>
            </li>
            <li>
            <span class="vnot-progress-icon">
                <svg width="35px" height="35px" viewBox="-153.6 -153.6 2227.20 2227.20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M960 1807.059c-467.125 0-847.059-379.934-847.059-847.059 0-467.125 379.934-847.059 847.059-847.059 467.125 0 847.059 379.934 847.059 847.059 0 467.125-379.934 847.059-847.059 847.059M960 0C430.645 0 0 430.645 0 960s430.645 960 960 960 960-430.645 960-960S1489.355 0 960 0M854.344 1157.975 583.059 886.69l-79.85 79.85 351.135 351.133L1454.4 717.617l-79.85-79.85-520.206 520.208Z" fill-rule="evenodd"></path>
                </svg>
            </span>
              <div class="vnot-progress ${statusPoint >= 3 && 'active'}">
                <span class="vnot-complete-icon"></span>
              </div>
              <p class="text">Delevered</p>
            </li>
          </ul>`
      }else {
        html += `<div class="vnot-progress-button">${vnotF.formatStatus(this.shipment.status)}</div>`
      }
      html += `</div>`
      return html;
    },

    ShipmentMap() {
      if( !settings.vnot_show_map ) {
        return '';
      }else {
        let html = `<div class="vnot-map-container">`;
        html += `<iframe
                src="${vnotF.formatMapsUrl(this.shipment.shippingAddress)}"
                width="100%"
                height="100%"
                allowfullscreen
                id="vnot-map-iframe"
                frameborder="none"
              ></iframe>
              <div class="vnot-shipping-address">
                <h5>Shipping To</h5>
                <p>${vnotF.formatShippingAddress(this.shipment.shippingAddress)}</p>
              </div>`
        html += `</div>`
        return html;
      }
    },

    ShipmentTimeline() {
      let html = `<div class="vnot-tracking-timeline">`
      const states = Array.from(this.shipment.states);
      for (const [index, state] of states.entries() ) {
        if (index < TIMELINE_EVENT_LIMIT ) {
          html += `<div class="vnot-tracking-timeline-event ">
                <div class="vnot-tracking-timeline-icon">
                  <span class="vnot-tracking-timeline-icon-default"></span>
                </div>
                <div class="vnot-tracking-timeline-content">
                <span class="vnot-tracking-timeline-subject">${state.location ? state.location + ' |' : ''} ${state.status}</span>
                  <div class="vnot-tracking-timeline-desc">
                    <span class="vnot-tracking-timeline-time-event">${state.date ? vnotF.formatDate12(state.date) : ''}</span>
                  </div>
                </div>
              </div>`
        }else {
          html += `<div class="vnot-tracking-timeline-event vnot-hidden-field">
                <div class="vnot-tracking-timeline-icon">
                  <span class="vnot-tracking-timeline-icon-default"></span>
                </div>
                <div class="vnot-tracking-timeline-content">
                <span class="vnot-tracking-timeline-subject">${state.location ? state.location + ' |' : ''} ${state.status}</span>
                  <div class="vnot-tracking-timeline-desc">
                    <span class="vnot-tracking-timeline-time-event">${state.date ? vnotF.formatDate12(state.date) : ''}</span>
                  </div>
                </div>
              </div>`
        }
      }
      if (states.length >= TIMELINE_EVENT_LIMIT) {
        html += `<div class="vnot-tracking-timeline-view-all">Show all</div>`;
      }
      html += `</div>`
      return html;
    },

    PackageInfo() {
      let html = `<div class="vnot-tracking-package-info">`;

      /* shipment carrier info*/
      if (this.shipment.carrier) {
        html += ` <div class="vnot-tracking-shipping-carrier vnot-tracking-package-container">
                <span class="vnot-tracking-package-info-title">Carrier</span>
                <div class="vnot-tracking-package-info-content">
                  <div class="vnot-tracking-package-info-image"></div>
                  <div class="vnot-tracking-package-carrier-info">
                    <span class="vnot-tracking-carrier-name">${this.shipment.carrier}</span>
                    <span class="vnot-tracking-order-number">${this.shipment.trackingNumber}</span>
                  </div>
                </div>
              </div>`;
      }

      /* parcel info */
      html += `<div class="vnot-tracking-package-order-items vnot-tracking-package-container">
                <span class="vnot-tracking-package-info-title">Products</span>`
      this.shipment.parcel.forEach( product => {
        html+= `<div class="vnot-tracking-package-info-content">
                  <div class="vnot-tracking-package-info-image">
                    <img
                      src="${product.image}"
                      alt="Example T-Shirt"
                      loading="lazy"
                    />
                  </div>
                  <a class="vnot-tracking-package-item-info" href="${product.url}">
                    <span class="vnot-tracking-item-name">${product.title}</span>
                    <span class="vnot-tracking-item-variation">${product.variantTitle}</span>
                  </a>
                  <span class="vnot-tracking-item-quantity">x ${product.quantity}</span>
                </div>`
      })
      html += `</div>`;

      /* Order note*/
      if (this.shipment.note) {
        html += `<div class="vnot-tracking-package-container">
                  <span class="vnot-tracking-package-info-title">Note</span>
                  <div class="vnot-tracking-package-info-content">${this.shipment.note}</div>
              </div>`
      }

      html += `</div>`;
      return html;
    },

    ShipmentDetails(shipment) {
      let html = `<div class="vnot-tracking-details-wrapper">
                     <div class="vnot-tracking-details">
                            ${this.ShipmentMap()}
                          <div class="vnot-tracking-info-container">
                            ${this.ShipmentTimeline()}
                            ${this.PackageInfo()}
                          </div>
                     </div>
                  </div>`
      return html;
    },

    ShipmentInfo(shipment, index) {
      this.shipment = shipment;
      let html = `<div class="vnot-tracking-shipment-info ${index > 0 ? 'vnot-hidden-field' : ''}">`;
      html += this.ShipmentProgress();
      html += this.ShipmentDetails();
      html += `</div>`;
      return html;
    },

    Loading() {
      return `<div class="vnot-truck-wrapper">
            <div class="vnot-truck">
                <div class="vnot-truck-container"> </div>
                <div class="vnot-truck-glasses"> </div>
                <div class="vnot-truck-bonet"> </div>
                <div class="vnot-truck-base"> </div>
                <div class="vnot-truck-wheel-back"> </div>
                <div class="vnot-truck-wheel-front"> </div>
                <div class="vnot-truck-smoke"> </div>
            </div>
        </div>`
    }
  }

  document.querySelectorAll(
    '#vnot-order-number, #vnot-email-phone, #vnot-tracking-number').forEach((input) => {
    input.addEventListener('keydown', function(e) {
      this.setCustomValidity('');
      document.getElementById('vnot-message-error-general')?.remove();
      if( e.keyCode === 13 ) {
        trackingButton.click();
      }
    });
  });

  const trackingButton = document.getElementById('vnot-tracking-form-submit');
  trackingButton?.addEventListener('click', async (e) => {
    const formData = vnotF.validateTrackingForm(e.target);
    if(formData) {
      domResult.innerHTML = vnotC.Loading();
      const shipments = await vnotF.postRequest('track_shipment', formData );
      vnotF.renderTrackingResult(shipments);
    }
  });

})
