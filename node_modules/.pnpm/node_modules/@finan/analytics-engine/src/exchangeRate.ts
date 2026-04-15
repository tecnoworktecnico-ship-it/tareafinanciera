import { Currency } from '@finan/shared';

// Uses ExchangeRate-API para conversión multi-moneda en tiempo real
export async function convertCurrency(
  amount: number,
  from: Currency | string,
  to: Currency | string,
  apiKey: string = process.env.EXCHANGE_RATE_API_KEY || ''
): Promise<number> {
  if (from === to) return amount;
  
  // Utiliza la API real. En modo sin token, puede requerir fallback manual o mock.
  const url = `https://v6.exchangerate-api.com/v6/${apiKey || 'dummy'}/pair/${from}/${to}/${amount}`;
  try {
    if (apiKey && apiKey !== 'your_free_api_key_here') {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      
      const data = await response.json();
      if (data.result === 'success') {
        return data.conversion_result;
      }
    } else {
        console.warn('⚠️ No API Key provided for ExchangeRate-API. Using offline fallback rates.');
    }
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
  }
  
  // Offline / Fallback rates
  const mockRates: Record<string, number> = {
    'USD_EUR': 0.92,
    'EUR_USD': 1.09,
    'USD_ARS': 850.0,
    'ARS_USD': 0.00117,
    'USD_PEN': 3.73,
    'PEN_USD': 0.27
  };
  
  const rate = mockRates[`${from}_${to}`] || 1;
  return amount * rate;
}
