import React, {createContext, useContext, useEffect, useState} from 'react';

const AdminApiContext = createContext();

export const AdminApiProvider = ({apiKey, children}) => {
  const [AdminApiConfig, setAdminApiConfig] = useState({
    apiKey: apiKey,
    host: "",
  });

  const setHost = (host) => {
    setAdminApiConfig((prevConfig) => ({
      ...prevConfig,
      host,
    }));
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const host = params.get("host");
    if (host) {
      setHost(host);
    }
  }, []);

  return (
    <AdminApiContext.Provider value={{ AdminApiConfig, setHost }}>
      {children}
    </AdminApiContext.Provider>
  );
}


export const useAdminApi = () => {
  return useContext(AdminApiContext);
};
