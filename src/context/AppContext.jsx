import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  initialClients, 
  initialPartners, 
  initialOffers, 
  initialNotifications,
  initialFundSettings,
  companyInfo,
  companyDocuments 
} from '../data/initialData';

// Create context
const AppContext = createContext(null);

// Custom hook for using the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// Provider component
export const AppProvider = ({ children }) => {
  const [clients, setClients] = useState(() => {
    const stored = localStorage.getItem('clients');
    return stored ? JSON.parse(stored) : initialClients;
  });

  const [partners, setPartners] = useState(() => {
    const stored = localStorage.getItem('partners');
    return stored ? JSON.parse(stored) : initialPartners;
  });

  const [offers, setOffers] = useState(() => {
    const stored = localStorage.getItem('offers');
    return stored ? JSON.parse(stored) : initialOffers;
  });

  const [notifications, setNotifications] = useState(() => {
    const stored = localStorage.getItem('notifications');
    return stored ? JSON.parse(stored) : initialNotifications;
  });

  const [fundSettings, setFundSettings] = useState(() => {
    const stored = localStorage.getItem('fundSettings');
    return stored ? JSON.parse(stored) : initialFundSettings;
  });

  const [company, setCompany] = useState(() => {
    const stored = localStorage.getItem('company');
    return stored ? JSON.parse(stored) : companyInfo;
  });

  const [documents, setDocuments] = useState(() => {
    const stored = localStorage.getItem('documents');
    return stored ? JSON.parse(stored) : companyDocuments;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('partners', JSON.stringify(partners));
  }, [partners]);

  useEffect(() => {
    localStorage.setItem('offers', JSON.stringify(offers));
  }, [offers]);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('fundSettings', JSON.stringify(fundSettings));
  }, [fundSettings]);

  useEffect(() => {
    localStorage.setItem('company', JSON.stringify(company));
  }, [company]);

  useEffect(() => {
    localStorage.setItem('documents', JSON.stringify(documents));
  }, [documents]);

  // CRUD operations
  const addClient = (client) => {
    setClients([...clients, client]);
  };

  const updateClient = (id, updatedClient) => {
    setClients(clients.map(client => 
      client.id === id ? { ...updatedClient, updatedAt: new Date().toISOString() } : client
    ));
  };

  const deleteClient = (id) => {
    setClients(clients.filter(client => client.id !== id));
  };

  const addInvestment = (clientId, investment) => {
    setClients(clients.map(client => {
      if (client.id === clientId) {
        return {
          ...client,
          investments: [...(client.investments || []), investment],
          updatedAt: new Date().toISOString()
        };
      }
      return client;
    }));
  };

  const updateROI = (clientId, month, roiData) => {
    setClients(clients.map(client => {
      if (client.id === clientId) {
        const roiHistory = client.roiHistory || [];
        const index = roiHistory.findIndex(r => r.month === month);
        if (index !== -1) {
          roiHistory[index] = { ...roiHistory[index], ...roiData };
        } else {
          roiHistory.push({ month, ...roiData });
        }
        return { ...client, roiHistory };
      }
      return client;
    }));
  };

  const addPartner = (partner) => {
    setPartners([...partners, partner]);
  };

  const updatePartner = (id, updatedPartner) => {
    setPartners(partners.map(partner => 
      partner.id === id ? updatedPartner : partner
    ));
  };

  const deletePartner = (id) => {
    setPartners(partners.filter(partner => partner.id !== id));
  };

  const addOffer = (offer) => {
    setOffers([...offers, offer]);
  };

  const updateOffer = (id, updatedOffer) => {
    setOffers(offers.map(offer => 
      offer.id === id ? updatedOffer : offer
    ));
  };

  const deleteOffer = (id) => {
    setOffers(offers.filter(offer => offer.id !== id));
  };

  const addNotification = (notification) => {
    setNotifications([notification, ...notifications]);
  };

  const updateFundSettings = (fund, settings) => {
    setFundSettings({
      ...fundSettings,
      [fund]: settings
    });
  };

  const updateCompanyInfo = (info) => {
    setCompany(info);
  };

  const updateDocument = (docName, updatedDoc) => {
    setDocuments(documents.map(doc => 
      doc.name === docName ? { ...doc, ...updatedDoc } : doc
    ));
  };

  const login = (username, password) => {
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  const getDashboardStats = () => {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.loginDetails?.status === 'Active').length;
    const inactiveClients = totalClients - activeClients;
    
    let totalInvestment = 0;
    let falconInvestment = 0;
    let aifInvestment = 0;
    let pmsInvestment = 0;
    let sifInvestment = 0;
    let totalMonthlyROI = 0;

    clients.forEach(client => {
      client.investments?.forEach(inv => {
        totalInvestment += inv.amount;
        if (inv.product === 'Falcon Hedge Fund') falconInvestment += inv.amount;
        if (inv.product === 'Alternative Investment Fund') aifInvestment += inv.amount;
        if (inv.product === 'PMS') pmsInvestment += inv.amount;
        if (inv.product === 'SIF') sifInvestment += inv.amount;
        totalMonthlyROI += inv.monthlyROI || 0;
      });
    });

    const totalActiveInvestments = clients.reduce((sum, client) => {
      return sum + (client.investments?.filter(i => i.status === 'active').length || 0);
    }, 0);

    let monthlyROIPaid = 0;
    let monthlyROIPending = 0;
    const currentMonth = new Date().toISOString().slice(0, 7);

    clients.forEach(client => {
      client.roiHistory?.forEach(roi => {
        if (roi.month === currentMonth) {
          if (roi.status === 'paid') monthlyROIPaid += roi.amount;
          else monthlyROIPending += roi.amount;
        }
      });
    });

    const upcomingMaturity = clients.reduce((sum, client) => {
      return sum + (client.investments?.filter(i => {
        const date = new Date(i.date);
        date.setMonth(date.getMonth() + (parseInt(i.lockIn) || 0));
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return date > today && date <= thirtyDaysFromNow;
      }).length || 0);
    }, 0);

    return {
      totalClients,
      activeClients,
      inactiveClients,
      totalInvestment,
      falconInvestment,
      aifInvestment,
      pmsInvestment,
      sifInvestment,
      totalMonthlyROI,
      monthlyROIPaid,
      monthlyROIPending,
      upcomingMaturity,
      totalActiveInvestments
    };
  };

  const value = {
    clients,
    partners,
    offers,
    notifications,
    fundSettings,
    company,
    documents,
    isAuthenticated,
    addClient,
    updateClient,
    deleteClient,
    addInvestment,
    updateROI,
    addPartner,
    updatePartner,
    deletePartner,
    addOffer,
    updateOffer,
    deleteOffer,
    addNotification,
    updateFundSettings,
    updateCompanyInfo,
    updateDocument,
    login,
    logout,
    getDashboardStats
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;