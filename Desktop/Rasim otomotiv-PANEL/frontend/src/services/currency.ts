// Using exchangerate-api.com free tier (1,500 requests/month)
// Alternative: fawazahmed0 API (completely free, no limits)

export interface ExchangeRates {
  TRY: number;
  USD: number;
  EUR: number;
  timestamp: number;
}

const CACHE_KEY = 'exchange_rates_cache';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Free API with no authentication required
const FREE_API_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json';

// Fallback rates in case API is unavailable
const FALLBACK_RATES: ExchangeRates = {
  TRY: 34.20,
  USD: 1,
  EUR: 0.92,
  timestamp: Date.now(),
};

export const getCachedRates = (): ExchangeRates | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid (less than 1 hour old)
    if (now - data.timestamp < CACHE_DURATION) {
      return data;
    }

    return null;
  } catch (error) {
    console.error('Error reading cached rates:', error);
    return null;
  }
};

export const setCachedRates = (rates: ExchangeRates): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rates));
  } catch (error) {
    console.error('Error caching rates:', error);
  }
};

export const fetchExchangeRates = async (): Promise<ExchangeRates> => {
  // First, check cache
  const cached = getCachedRates();
  if (cached) {
    return cached;
  }

  try {
    // Try to fetch from free API
    const response = await fetch(FREE_API_URL);

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();

    // The API returns rates relative to USD
    const usdRates = data.usd;

    const rates: ExchangeRates = {
      TRY: usdRates.try || FALLBACK_RATES.TRY,
      USD: 1, // Base currency
      EUR: usdRates.eur || FALLBACK_RATES.EUR,
      timestamp: Date.now(),
    };

    // Cache the rates
    setCachedRates(rates);

    return rates;
  } catch (error) {
    console.error('Error fetching exchange rates, using fallback:', error);

    // Check cache even if expired, better than nothing
    const cached = getCachedRates();
    if (cached) {
      return cached;
    }

    // Use fallback rates
    setCachedRates(FALLBACK_RATES);
    return FALLBACK_RATES;
  }
};

export const convertCurrency = (
  amount: number,
  from: 'TRY' | 'USD' | 'EUR',
  to: 'TRY' | 'USD' | 'EUR',
  rates: ExchangeRates
): number => {
  if (from === to) return amount;

  // Convert to USD first (base currency)
  const amountInUSD = amount / rates[from];

  // Then convert to target currency
  const result = amountInUSD * rates[to];

  return Math.round(result * 100) / 100; // Round to 2 decimal places
};

export const formatCurrency = (
  amount: number,
  currency: 'TRY' | 'USD' | 'EUR'
): string => {
  const symbols = {
    TRY: '₺',
    USD: '$',
    EUR: '€',
  };

  const formatted = amount.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${symbols[currency]}${formatted}`;
};

// Hook for components to use currency conversion
export const useCurrencyConverter = () => {
  const convert = (
    amount: number,
    from: 'TRY' | 'USD' | 'EUR',
    to: 'TRY' | 'USD' | 'EUR',
    rates: ExchangeRates
  ) => convertCurrency(amount, from, to, rates);

  const format = (amount: number, currency: 'TRY' | 'USD' | 'EUR') =>
    formatCurrency(amount, currency);

  return { convert, format };
};
