/**
 * Payment Service
 * Handles payment gateway integration with retry logic and failover
 */

// Payment gateway configurations
const PAYMENT_GATEWAYS = {
  primary: {
    name: 'PrimaryGateway',
    baseUrl: process.env.PRIMARY_PAYMENT_GATEWAY_URL || 'https://primary-gateway.example.com',
    apiKey: process.env.PRIMARY_PAYMENT_API_KEY || 'primary-key',
    timeout: 30000, // 30 seconds
  },
  backup: {
    name: 'BackupGateway',
    baseUrl: process.env.BACKUP_PAYMENT_GATEWAY_URL || 'https://backup-gateway.example.com',
    apiKey: process.env.BACKUP_PAYMENT_API_KEY || 'backup-key',
    timeout: 30000, // 30 seconds
  },
};

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryMultiplier: 2, // Exponential backoff
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Make HTTP request with timeout
 */
const makeRequest = async (url, options, timeout) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

/**
 * Process payment with a specific gateway
 */
const processPaymentWithGateway = async (gateway, paymentData) => {
  const { transactionId, amount, method } = paymentData;

  try {
    const response = await makeRequest(
      `${gateway.baseUrl}/api/payments/initiate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${gateway.apiKey}`,
        },
        body: JSON.stringify({
          transactionId,
          amount,
          method,
        }),
      },
      gateway.timeout
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Gateway returned status ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      gateway: gateway.name,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      gateway: gateway.name,
      error: error.message,
    };
  }
};

/**
 * Initiate payment with retry logic and automatic failover
 */
export const initiatePaymentWithRetry = async (paymentData) => {
  const errors = [];
  let currentGateway = PAYMENT_GATEWAYS.primary;
  let retryCount = 0;
  let delay = RETRY_CONFIG.retryDelay;

  // Try primary gateway with retries
  while (retryCount < RETRY_CONFIG.maxRetries) {
    const result = await processPaymentWithGateway(currentGateway, paymentData);

    if (result.success) {
      return {
        success: true,
        gateway: result.gateway,
        data: result.data,
        attempts: retryCount + 1,
        errors: errors.length > 0 ? errors : undefined,
      };
    }

    // Log error
    errors.push({
      gateway: result.gateway,
      attempt: retryCount + 1,
      error: result.error,
      timestamp: new Date().toISOString(),
    });

    retryCount++;

    // If max retries reached on primary, try backup
    if (retryCount >= RETRY_CONFIG.maxRetries) {
      if (currentGateway === PAYMENT_GATEWAYS.primary) {
        console.log('Primary gateway failed, switching to backup gateway');
        currentGateway = PAYMENT_GATEWAYS.backup;
        retryCount = 0; // Reset retry count for backup gateway
        delay = RETRY_CONFIG.retryDelay; // Reset delay
        continue;
      } else {
        // Both gateways failed
        break;
      }
    }

    // Wait before retry with exponential backoff
    await sleep(delay);
    delay *= RETRY_CONFIG.retryMultiplier;
  }

  // All attempts failed
  return {
    success: false,
    errors,
    message: 'Payment processing failed after all retry attempts',
  };
};

/**
 * Verify payment with gateway
 */
export const verifyPaymentWithGateway = async (transactionId, gateway = 'primary') => {
  const gatewayConfig = PAYMENT_GATEWAYS[gateway] || PAYMENT_GATEWAYS.primary;

  try {
    const response = await makeRequest(
      `${gatewayConfig.baseUrl}/api/payments/verify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${gatewayConfig.apiKey}`,
        },
        body: JSON.stringify({ transactionId }),
      },
      gatewayConfig.timeout
    );

    if (!response.ok) {
      throw new Error(`Verification failed with status ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get user-friendly error message
 */
export const getPaymentErrorMessage = (errors) => {
  if (!errors || errors.length === 0) {
    return 'Payment processing failed. Please try again.';
  }

  const lastError = errors[errors.length - 1];

  // Map technical errors to user-friendly messages
  const errorMessages = {
    'Request timeout': 'Payment gateway is not responding. Please try again in a few moments.',
    'Network error': 'Unable to connect to payment service. Please check your internet connection.',
    'Invalid credentials': 'Payment configuration error. Please contact support.',
    'Insufficient funds': 'Insufficient funds in your account. Please use a different payment method.',
    'Card declined': 'Your card was declined. Please try a different card or payment method.',
    'Invalid card': 'Invalid card information. Please check your card details.',
  };

  // Check if error message contains known patterns
  for (const [pattern, message] of Object.entries(errorMessages)) {
    if (lastError.error && lastError.error.includes(pattern)) {
      return message;
    }
  }

  // Default message
  return 'Payment processing failed. Please try again or use a different payment method.';
};

/**
 * Mock payment processing (for development/testing)
 * Simulates gateway behavior with configurable success/failure
 */
export const mockPaymentProcess = async (paymentData, shouldFail = false) => {
  // Simulate network delay
  await sleep(1000);

  if (shouldFail) {
    return {
      success: false,
      errors: [{
        gateway: 'MockGateway',
        attempt: 1,
        error: 'Mock payment failure',
        timestamp: new Date().toISOString(),
      }],
      message: 'Payment processing failed',
    };
  }

  const { method, transactionId, amount } = paymentData;

  return {
    success: true,
    gateway: 'MockGateway',
    data: {
      transactionId,
      amount,
      method,
      qrCode: method === 'qr_code' 
        ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${transactionId}`
        : undefined,
      paymentUrl: method === 'debit_card'
        ? `https://payment-gateway.example.com/pay/${transactionId}`
        : undefined,
    },
    attempts: 1,
  };
};

export default {
  initiatePaymentWithRetry,
  verifyPaymentWithGateway,
  getPaymentErrorMessage,
  mockPaymentProcess,
};
