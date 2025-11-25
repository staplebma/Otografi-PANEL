import React, { useState, useEffect } from 'react';
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { fetchExchangeRates, convertCurrency, formatCurrency } from '../services/currency';
import type { ExchangeRates } from '../services/currency';
import { useSettings } from '../contexts/SettingsContext';

const CurrencyConverter: React.FC = () => {
  const { currency: defaultCurrency } = useSettings();
  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState<'TRY' | 'USD' | 'EUR'>(defaultCurrency);
  const [toCurrency, setToCurrency] = useState<'TRY' | 'USD' | 'EUR'>('USD');
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    setLoading(true);
    try {
      const exchangeRates = await fetchExchangeRates();
      setRates(exchangeRates);
      setLastUpdated(new Date(exchangeRates.timestamp));
    } catch (error) {
      console.error('Error loading rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getConvertedAmount = (): number => {
    if (!rates || !amount) return 0;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return 0;
    return convertCurrency(numAmount, fromCurrency, toCurrency, rates);
  };

  const currencies: Array<'TRY' | 'USD' | 'EUR'> = ['TRY', 'USD', 'EUR'];
  const currencyNames = {
    TRY: 'Türk Lirası',
    USD: 'US Dollar',
    EUR: 'Euro',
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Döviz kurları yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Döviz Çevirici</h2>
        {lastUpdated && (
          <div className="text-xs text-gray-500">
            Son güncelleme: {lastUpdated.toLocaleTimeString('tr-TR')}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* From Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Miktar
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field flex-1"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value as 'TRY' | 'USD' | 'EUR')}
              className="input-field w-32"
            >
              {currencies.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {currencyNames[fromCurrency]}
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSwap}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Swap currencies"
          >
            <ArrowsRightLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* To Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sonuç
          </label>
          <div className="flex gap-2">
            <div className="input-field flex-1 bg-gray-50 font-semibold text-lg">
              {formatCurrency(getConvertedAmount(), toCurrency).replace(/^[^\d-]+/, '')}
            </div>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value as 'TRY' | 'USD' | 'EUR')}
              className="input-field w-32"
            >
              {currencies.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {currencyNames[toCurrency]}
          </div>
        </div>

        {/* Exchange Rate Info */}
        {rates && (
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-500 text-xs mb-1">USD</div>
                <div className="font-semibold">₺{rates.TRY.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">EUR</div>
                <div className="font-semibold">₺{(rates.TRY / rates.EUR).toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">EUR/USD</div>
                <div className="font-semibold">${rates.EUR.toFixed(4)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="pt-2">
          <button
            onClick={loadRates}
            className="text-sm text-primary hover:text-primary-600 font-medium"
          >
            Kurları Yenile
          </button>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;
