// Plan limits and feature configuration
const PLAN_LIMITS = {
  free: {
    name: 'Free',
    price: 0,
    filesPerMonth: 10,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    storageLimit: 100 * 1024 * 1024, // 100MB
    aiOperations: 0, // No AI operations in free version
    apiCalls: 0, // No API access
    batchOperations: 1, // Single file operations only
    features: [
      'basic_pdf_ops',
      'file_organization',
      'basic_compression'
    ],
    restrictions: {
      maxFilesPerBatch: 1,
      ocrPages: 0, // No OCR in free version
      ocrFilesPerMonth: 0, // No OCR operations in free version
      summaryLength: 'none', // No AI summaries
      chatMessages: 0, // No AI chat in free version
      aiChatAccess: false, // AI chat moved to paid only
      ocrAccess: false, // OCR moved to paid only
      advancedTools: false // Advanced tools restricted
    }
  },
  basic: {
    name: 'Basic',
    price: 1,
    filesPerMonth: 100,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    storageLimit: 500 * 1024 * 1024, // 500MB
    aiOperations: 50,
    apiCalls: 100,
    batchOperations: 10,
    features: [
      'basic_pdf_ops',
      'file_organization',
      'basic_compression',
      'advanced_compression',
      'ai_features',
      'batch_processing',
      'ocr_processing',
      'pdf_chat',
      'summaries',
      'search',
      'advanced_tools'
    ],
    restrictions: {
      maxFilesPerBatch: 10,
      ocrPages: 50,
      ocrFilesPerMonth: 100,
      summaryLength: 'detailed',
      chatMessages: 50,
      aiChatAccess: true,
      ocrAccess: true,
      advancedTools: true
    }
  },
  pro: {
    name: 'Pro',
    price: 10,
    filesPerMonth: -1, // unlimited
    maxFileSize: 200 * 1024 * 1024, // 200MB
    storageLimit: -1, // unlimited
    aiOperations: -1, // unlimited
    apiCalls: 10000,
    batchOperations: -1, // unlimited
    features: [
      'all_features',
      'api_access',
      'priority_support',
      'advanced_analytics',
      'custom_workflows',
      'white_label',
      'advanced_settings'
    ],
    restrictions: {
      maxFilesPerBatch: -1, // unlimited
      ocrPages: -1, // unlimited
      ocrFilesPerMonth: -1, // unlimited
      summaryLength: 'comprehensive',
      chatMessages: -1, // unlimited
      aiChatAccess: true,
      ocrAccess: true,
      advancedTools: true,
      advancedSettings: true
    }
  }
};

// Feature definitions
const FEATURES = {
  basic_pdf_ops: {
    name: 'Basic PDF Operations',
    description: 'Merge, split, rotate, and basic editing'
  },
  file_organization: {
    name: 'File Organization',
    description: 'Folders, tags, and file management'
  },
  basic_compression: {
    name: 'Basic Compression',
    description: 'Standard PDF compression'
  },
  advanced_compression: {
    name: 'Advanced Compression',
    description: 'High-quality compression with optimization'
  },
  ai_features: {
    name: 'AI Features',
    description: 'AI-powered document analysis'
  },
  batch_processing: {
    name: 'Batch Processing',
    description: 'Process multiple files simultaneously'
  },
  ocr_processing: {
    name: 'OCR Processing',
    description: 'Extract text from scanned documents'
  },
  pdf_chat: {
    name: 'PDF Chat',
    description: 'Chat with your PDF documents'
  },
  summaries: {
    name: 'Document Summaries',
    description: 'AI-generated document summaries'
  },
  search: {
    name: 'Advanced Search',
    description: 'Search within document content'
  },
  api_access: {
    name: 'API Access',
    description: 'Programmatic access to all features'
  },
  priority_support: {
    name: 'Priority Support',
    description: '24/7 priority customer support'
  },
  advanced_analytics: {
    name: 'Advanced Analytics',
    description: 'Detailed usage analytics and insights'
  },
  custom_workflows: {
    name: 'Custom Workflows',
    description: 'Create custom automation workflows'
  },
  white_label: {
    name: 'White Label',
    description: 'Remove branding and customize interface'
  },
  all_features: {
    name: 'All Features',
    description: 'Access to all current and future features'
  }
};

// Helper functions
const getPlanLimits = (plan) => {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
};

const hasFeature = (plan, feature) => {
  const planLimits = getPlanLimits(plan);
  return planLimits.features.includes(feature) || planLimits.features.includes('all_features');
};

const isWithinLimit = (plan, limitType, currentValue) => {
  const planLimits = getPlanLimits(plan);
  const limit = planLimits[limitType];
  
  // -1 means unlimited
  if (limit === -1) return true;
  
  return currentValue < limit;
};

const getRemainingLimit = (plan, limitType, currentValue) => {
  const planLimits = getPlanLimits(plan);
  const limit = planLimits[limitType];
  
  // -1 means unlimited
  if (limit === -1) return -1;
  
  return Math.max(0, limit - currentValue);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  if (bytes === -1) return 'Unlimited';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatNumber = (num) => {
  if (num === -1) return 'Unlimited';
  return num.toLocaleString();
};

// Stripe price IDs (to be set in environment variables)
const STRIPE_PRICE_IDS = {
  basic: process.env.STRIPE_PRICE_ID_BASIC || 'price_basic_monthly',
  pro: process.env.STRIPE_PRICE_ID_PRO || 'price_pro_monthly'
};

// Plan comparison data for frontend
const PLAN_COMPARISON = [
  {
    feature: 'Files per month',
    free: '10',
    basic: '100',
    pro: 'Unlimited'
  },
  {
    feature: 'Max file size',
    free: '10 MB',
    basic: '50 MB',
    pro: '200 MB'
  },
  {
    feature: 'Storage',
    free: '100 MB',
    basic: '500 MB',
    pro: 'Unlimited'
  },
  {
    feature: 'OCR Pages',
    free: 'None',
    basic: '50',
    pro: 'Unlimited'
  },
  {
    feature: 'AI Chat Messages',
    free: 'None',
    basic: '50',
    pro: 'Unlimited'
  },
  {
    feature: 'AI Summary',
    free: 'None',
    basic: '50',
    pro: 'Unlimited'
  },
  {
    feature: 'Advanced Tools',
    free: false,
    basic: true,
    pro: true
  },
  {
    feature: 'Advanced Settings',
    free: false,
    basic: false,
    pro: true
  },
  {
    feature: 'Priority Support',
    free: false,
    basic: false,
    pro: true
  },
  {
    feature: 'API Access',
    free: false,
    basic: false,
    pro: true
  }
];

// CommonJS exports for backend
module.exports = {
  PLAN_LIMITS,
  FEATURES,
  getPlanLimits,
  hasFeature,
  isWithinLimit,
  getRemainingLimit,
  formatFileSize,
  formatNumber,
  STRIPE_PRICE_IDS,
  PLAN_COMPARISON
};

// ES6 exports for frontend (if needed)
if (typeof window !== 'undefined') {
  window.PLAN_LIMITS = PLAN_LIMITS;
  window.FEATURES = FEATURES;
}