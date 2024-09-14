import { authenticatedFetch } from "@shopify/app-bridge/utilities";
import createApp from "@shopify/app-bridge";
import deepMerge from "@shopify/app-bridge/actions/merge";
import {useAdminApi} from '../context/AdminApiContext.jsx';

let adminRequest = null;
let app = null;

const createAdminRequest = (apiKey, host) => {
  if (!app) {
    app = createApp({
      apiKey: apiKey,
      host: host,
    });
  }

  return adminRequest = {
    async get(uri) {
      const customFetch = ( uri, options) => {
        const {headers} = options;
        const aggregateOptions = deepMerge(headers, {
          method: 'GET',
          headers: {"Content-Type": "application/json"},
        });
        return fetch(uri, aggregateOptions);
      }
      const fetchWithAuth = authenticatedFetch(app, customFetch);
      try {
        return await fetchWithAuth(uri);
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Re-throw the error after logging it
      }
    },

    async post(uri,data){
      const customFetch = ( uri, options) => {
        const {headers, ...body} = options;
        const aggregateOptions = deepMerge(headers, {
          method: 'POST',
          body: JSON.stringify(body),
          headers: {"Content-Type": "application/json"},
        });
        return fetch(uri, aggregateOptions);
      }
      const fetchWithAuth = authenticatedFetch(app, customFetch);
      try {
        return  await fetchWithAuth(uri,data);
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Re-throw the error after logging it
      }
    }
  }

};

export const useAdminRequest = () => {
  const { AdminApiConfig } = useAdminApi();
  const { apiKey, host } = AdminApiConfig;

  if (!adminRequest && apiKey && host) {
    adminRequest = createAdminRequest(apiKey, host);
  }

  return adminRequest;
};

export const useAppConfig = () => {
  const { AdminApiConfig } = useAdminApi();
  const { apiKey, host } = AdminApiConfig;
  if (!app && apiKey && host) {
    app = createApp({
      apiKey: apiKey,
      host: host,
    });
  }

  return app;
}
