export const initialClients = [
  {
    id: '1',
    clientId: 'KKF000001',
    fullName: 'Rahul Sharma',
    mobile: '9876543210',
    email: 'rahul@email.com',
    dob: '1990-05-15',
    gender: 'Male',
    address: {
      address: '123, Park Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    bankDetails: {
      bankName: 'HDFC Bank',
      accountNumber: '1234567890',
      ifsc: 'HDFC0001234',
      branchName: 'Andheri'
    },
    nominee: {
      name: 'Priya Sharma',
      relationship: 'Wife',
      mobile: '9876543211'
    },
    kyc: {
      pan: 'pan123.jpg',
      aadhaar: 'aadhaar123.jpg',
      passport: 'passport123.jpg',
      addressProof: 'address123.jpg',
      cancelledCheque: 'cheque123.jpg'
    },
    loginDetails: {
      username: 'rahul123',
      password: 'Abcd@1234',
      status: 'Active'
    },
    investments: [
      {
        id: 'inv1',
        product: 'Falcon Hedge Fund',
        amount: 100000,
        roi: 4,
        monthlyROI: 4000,
        date: '2024-01-01',
        status: 'active',
        lockIn: '12 months'
      },
      {
        id: 'inv2',
        product: 'PMS',
        amount: 500000,
        roi: 12,
        monthlyROI: 5000,
        date: '2024-01-15',
        status: 'active',
        lockIn: '24 months',
        dematDetails: {
          dpId: 'DP12345',
          clientId: 'CL12345',
          depository: 'NSDL',
          brokerName: 'Zerodha',
          dematNumber: '1234567890'
        }
      }
    ],
    roiHistory: [
      { month: '2024-07', amount: 9000, status: 'paid', utr: 'UTR123', paymentDate: '2024-07-31' },
      { month: '2024-08', amount: 9000, status: 'pending' }
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-07-31'
  }
];

export const initialPartners = [
  {
    id: '1',
    type: 'referral',
    name: 'Referral Partner 1',
    mobile: '9876543212',
    email: 'referral@email.com',
    pan: 'ABCDE1234F',
    aadhaar: '123456789012',
    bankDetails: {
      bankName: 'ICICI Bank',
      accountNumber: '9876543210',
      ifsc: 'ICICI0001234'
    },
    referrals: 5,
    loginCount: 10,
    pointsEarned: 3000,
    monthlyEarnings: 5000,
    status: 'active'
  },
  {
    id: '2',
    type: 'authorized',
    name: 'Authorized Partner 1',
    mobile: '9876543213',
    email: 'auth@email.com',
    pan: 'FGHIJ5678K',
    aadhaar: '987654321098',
    investmentVolume: 5000000,
    commission: 50000,
    status: 'approved'
  },
  {
    id: '3',
    type: 'hni',
    name: 'HNI Partner 1',
    mobile: '9876543214',
    email: 'hni@email.com',
    pan: 'LMNOP9012Q',
    aadhaar: '567890123456',
    investmentVolume: 10000000,
    commission: 100000,
    monthlyEarnings: 80000,
    status: 'active'
  }
];

export const initialOffers = [
  {
    id: '1',
    type: 'cashback',
    banner: 'offer1.jpg',
    title: 'Summer Cashback',
    description: 'Get 10% cashback on all investments',
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    status: 'active'
  }
];

export const initialNotifications = [
  {
    id: '1',
    title: 'New Client Added',
    message: 'Rahul Sharma has been registered',
    type: 'push',
    date: '2024-07-31',
    status: 'sent'
  }
];

export const initialFundSettings = {
  falconHedge: {
    minInvestment: 100000,
    maxInvestment: 1000000,
    defaultROI: 4,
    status: 'active'
  },
  aif: {
    lockInPeriod: 36,
    roi: 12,
    status: 'active'
  },
  pms: {
    performanceFee: 25,
    defaultROI: 12,
    status: 'active'
  },
  sif: {
    minInvestment: 500000,
    roi: 8,
    status: 'active'
  }
};

export const companyInfo = {
  logo: 'logo.png',
  companyName: 'KK Finsure',
  address: '123, Business Park, Mumbai',
  phone: '9876543215',
  email: 'info@kkfinsure.com',
  website: 'www.kkfinsure.com',
  supportEmail: 'support@kkfinsure.com'
};

export const companyDocuments = [
  { name: 'SEBI Certificate', url: 'sebi.pdf', uploaded: true },
  { name: 'NSE Registration', url: 'nse.pdf', uploaded: true },
  { name: 'BSE Registration', url: 'bse.pdf', uploaded: false },
  { name: 'PMS License', url: 'pms.pdf', uploaded: false },
  { name: 'AIF License', url: 'aif.pdf', uploaded: false },
  { name: 'SIF License', url: 'sif.pdf', uploaded: false },
  { name: 'Company Registration', url: 'company.pdf', uploaded: true }
];