<?php

namespace App\Services\Market\Providers;

use App\Services\Market\Exceptions\MarketProviderUnavailableException;

class DemoMarketProvider extends ProviderAdapter
{
    public function fetchMarketData(): array
    {
        if (app()->environment('production')) {
            throw new MarketProviderUnavailableException('Demo market provider is strictly forbidden in production environment.');
        }

        $now = now()->timezone('Asia/Kolkata');
        $marketStatus = $this->calculateMarketStatus();

        // Baseline Indian stock symbols from which quotes and percentage changes are dynamically calculated
        $stockTemplates = [
            ['symbol' => 'RELIANCE', 'name' => 'Reliance Industries Ltd.', 'base' => 3000.0, 'exchange' => 'NSE'],
            ['symbol' => 'TCS', 'name' => 'Tata Consultancy Services', 'base' => 4200.0, 'exchange' => 'NSE'],
            ['symbol' => 'HDFCBANK', 'name' => 'HDFC Bank Ltd.', 'base' => 1700.0, 'exchange' => 'NSE'],
            ['symbol' => 'INFY', 'name' => 'Infosys Ltd.', 'base' => 1900.0, 'exchange' => 'NSE'],
            ['symbol' => 'ICICIBANK', 'name' => 'ICICI Bank Ltd.', 'base' => 1250.0, 'exchange' => 'NSE'],
            ['symbol' => 'BHARTIARTL', 'name' => 'Bharti Airtel Ltd.', 'base' => 1650.0, 'exchange' => 'NSE'],
            ['symbol' => 'SBIN', 'name' => 'State Bank of India', 'base' => 800.0, 'exchange' => 'NSE'],
            ['symbol' => 'ITC', 'name' => 'ITC Limited', 'base' => 500.0, 'exchange' => 'NSE'],
            ['symbol' => 'HINDUNILVR', 'name' => 'Hindustan Unilever Ltd.', 'base' => 2800.0, 'exchange' => 'NSE'],
            ['symbol' => 'LT', 'name' => 'Larsen & Toubro Ltd.', 'base' => 3600.0, 'exchange' => 'NSE'],
            ['symbol' => 'BAJFINANCE', 'name' => 'Bajaj Finance Ltd.', 'base' => 7400.0, 'exchange' => 'NSE'],
            ['symbol' => 'TATAMOTORS', 'name' => 'Tata Motors Ltd.', 'base' => 990.0, 'exchange' => 'NSE'],
            ['symbol' => 'SUNPHARMA', 'name' => 'Sun Pharmaceutical Industries', 'base' => 1880.0, 'exchange' => 'NSE'],
            ['symbol' => 'MARUTI', 'name' => 'Maruti Suzuki India Ltd.', 'base' => 12400.0, 'exchange' => 'NSE'],
            ['symbol' => 'WIPRO', 'name' => 'Wipro Ltd.', 'base' => 540.0, 'exchange' => 'NSE'],
            ['symbol' => 'TATASTEEL', 'name' => 'Tata Steel Ltd.', 'base' => 155.0, 'exchange' => 'NSE'],
            ['symbol' => 'TECHM', 'name' => 'Tech Mahindra Ltd.', 'base' => 1630.0, 'exchange' => 'NSE'],
        ];

        $minuteSeed = (int) $now->format('i');
        $hourSeed = (int) $now->format('H');

        $stocks = [];
        foreach ($stockTemplates as $idx => $st) {
            $variancePercent = round(sin(($minuteSeed + $idx * 7) / 5) * 2.5 + cos(($hourSeed + $idx) / 3) * 0.8, 2);
            $prevClose = $st['base'];
            $currentVal = round($prevClose * (1 + ($variancePercent / 100)), 2);
            $absChange = round($currentVal - $prevClose, 2);
            $highVal = round(max($currentVal, $prevClose) * 1.008, 2);
            $lowVal = round(min($currentVal, $prevClose) * 0.992, 2);
            $openVal = round($prevClose * 1.001, 2);

            $stocks[] = [
                'symbol' => $st['symbol'],
                'name' => $st['name'],
                'display_name' => $st['name'],
                'ltp' => $currentVal,
                'value' => $currentVal,
                'change' => $absChange,
                'absolute_change' => $absChange,
                'change_percent' => $variancePercent,
                'percentage_change' => $variancePercent,
                'previous_close' => $prevClose,
                'open' => $openVal,
                'high' => $highVal,
                'low' => $lowVal,
                'market_status' => $marketStatus,
                'exchange' => $st['exchange'],
                'currency' => 'INR',
                'last_updated' => $now->toIso8601String(),
                'is_delayed' => true,
                'is_realtime' => false,
                'delay_minutes' => 15,
                'data_source' => $this->getProviderName(),
            ];
        }

        $indexTemplates = [
            ['symbol' => 'NIFTY 50', 'name' => 'NSE Nifty 50', 'base' => 25300.0, 'weight' => 0.8],
            ['symbol' => 'SENSEX', 'name' => 'BSE Sensex 30', 'base' => 82800.0, 'weight' => 0.75],
            ['symbol' => 'BANK NIFTY', 'name' => 'Nifty Bank Index', 'base' => 52200.0, 'weight' => 0.9],
            ['symbol' => 'NIFTY IT', 'name' => 'Nifty IT Index', 'base' => 41800.0, 'weight' => 1.1],
        ];

        $indices = [];
        foreach ($indexTemplates as $it) {
            $variance = round(cos(($minuteSeed + 3) / 7) * 0.6 * $it['weight'], 2);
            $prevClose = $it['base'];
            $currentVal = round($prevClose * (1 + ($variance / 100)), 2);
            $absChange = round($currentVal - $prevClose, 2);
            $highVal = round(max($currentVal, $prevClose) * 1.004, 2);
            $lowVal = round(min($currentVal, $prevClose) * 0.996, 2);
            $openVal = round($prevClose * 1.0005, 2);

            $indices[] = [
                'symbol' => $it['symbol'],
                'name' => $it['name'],
                'display_name' => $it['name'],
                'ltp' => $currentVal,
                'value' => $currentVal,
                'change' => $absChange,
                'absolute_change' => $absChange,
                'change_percent' => $variance,
                'percentage_change' => $variance,
                'previous_close' => $prevClose,
                'open' => $openVal,
                'high' => $highVal,
                'low' => $lowVal,
                'market_status' => $marketStatus,
                'exchange' => str_contains($it['symbol'], 'SENSEX') ? 'BSE' : 'NSE',
                'currency' => 'INR',
                'last_updated' => $now->toIso8601String(),
                'is_delayed' => true,
                'is_realtime' => false,
                'delay_minutes' => 15,
                'data_source' => $this->getProviderName(),
            ];
        }

        return [
            'provider_name' => $this->getProviderName(),
            'data_source' => $this->getProviderName(),
            'is_delayed' => true,
            'is_realtime' => false,
            'delay_minutes' => $this->getDelayMinutes(),
            'market_status' => $marketStatus,
            'currency' => 'INR',
            'last_updated' => $now->toIso8601String(),
            'indices' => $indices,
            'stocks' => $stocks,
            'is_demo' => true,
        ];
    }

    public function getProviderName(): string
    {
        return 'NSE / BSE Simulated Feed (Local Development Demo)';
    }

    public function isDelayed(): bool
    {
        return true;
    }

    public function getDelayMinutes(): int
    {
        return 15;
    }

    public function isRealtime(): bool
    {
        return false;
    }
}
