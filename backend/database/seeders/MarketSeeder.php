<?php

namespace Database\Seeders;

use App\Models\MarketIndex;
use App\Models\MarketSymbol;
use Illuminate\Database\Seeder;

class MarketSeeder extends Seeder
{
    /**
     * Seed initial symbols registry without hardcoding production prices.
     */
    public function run(): void
    {
        // Core tracked indices definitions (metadata only)
        $indices = [
            ['symbol' => 'NIFTY 50', 'display_name' => 'NIFTY 50', 'name' => 'NSE Nifty 50', 'exchange' => 'NSE', 'instrument_type' => 'index', 'is_active' => true, 'sort_order' => 1],
            ['symbol' => 'SENSEX', 'display_name' => 'SENSEX', 'name' => 'BSE Sensex 30', 'exchange' => 'BSE', 'instrument_type' => 'index', 'is_active' => true, 'sort_order' => 2],
            ['symbol' => 'BANK NIFTY', 'display_name' => 'BANK NIFTY', 'name' => 'Nifty Bank Index', 'exchange' => 'NSE', 'instrument_type' => 'index', 'is_active' => true, 'sort_order' => 3],
            ['symbol' => 'NIFTY IT', 'display_name' => 'NIFTY IT', 'name' => 'Nifty IT Index', 'exchange' => 'NSE', 'instrument_type' => 'index', 'is_active' => true, 'sort_order' => 4],
        ];

        foreach ($indices as $idx) {
            MarketIndex::updateOrCreate(['symbol' => $idx['symbol']], [
                'symbol' => $idx['symbol'],
                'name' => $idx['name'],
                'is_active' => true,
            ]);

            MarketSymbol::updateOrCreate(['symbol' => $idx['symbol']], $idx);
        }

        // Active constituent stocks registry (metadata only - no hardcoded prices)
        $stocks = [
            ['symbol' => 'RELIANCE', 'display_name' => 'Reliance', 'name' => 'Reliance Industries Ltd.', 'exchange' => 'NSE', 'instrument_type' => 'stock', 'is_active' => true, 'sort_order' => 10],
            ['symbol' => 'TCS', 'display_name' => 'TCS', 'name' => 'Tata Consultancy Services', 'exchange' => 'NSE', 'instrument_type' => 'stock', 'is_active' => true, 'sort_order' => 11],
            ['symbol' => 'HDFCBANK', 'display_name' => 'HDFC Bank', 'name' => 'HDFC Bank Ltd.', 'exchange' => 'NSE', 'instrument_type' => 'stock', 'is_active' => true, 'sort_order' => 12],
            ['symbol' => 'INFY', 'display_name' => 'Infosys', 'name' => 'Infosys Ltd.', 'exchange' => 'NSE', 'instrument_type' => 'stock', 'is_active' => true, 'sort_order' => 13],
            ['symbol' => 'ICICIBANK', 'display_name' => 'ICICI Bank', 'name' => 'ICICI Bank Ltd.', 'exchange' => 'NSE', 'instrument_type' => 'stock', 'is_active' => true, 'sort_order' => 14],
            ['symbol' => 'BHARTIARTL', 'display_name' => 'Bharti Airtel', 'name' => 'Bharti Airtel Ltd.', 'exchange' => 'NSE', 'instrument_type' => 'stock', 'is_active' => true, 'sort_order' => 15],
            ['symbol' => 'SBIN', 'display_name' => 'SBI', 'name' => 'State Bank of India', 'exchange' => 'NSE', 'instrument_type' => 'stock', 'is_active' => true, 'sort_order' => 16],
            ['symbol' => 'ITC', 'display_name' => 'ITC', 'name' => 'ITC Limited', 'exchange' => 'NSE', 'instrument_type' => 'stock', 'is_active' => true, 'sort_order' => 17],
            ['symbol' => 'HINDUNILVR', 'display_name' => 'HUL', 'name' => 'Hindustan Unilever Ltd.', 'exchange' => 'NSE', 'instrument_type' => 'stock', 'is_active' => true, 'sort_order' => 18],
            ['symbol' => 'LT', 'display_name' => 'L&T', 'name' => 'Larsen & Toubro Ltd.', 'exchange' => 'NSE', 'instrument_type' => 'stock', 'is_active' => true, 'sort_order' => 19],
            ['symbol' => 'BAJFINANCE', 'display_name' => 'Bajaj Finance', 'name' => 'Bajaj Finance Ltd.', 'exchange' => 'NSE', 'instrument_type' => 'stock', 'is_active' => true, 'sort_order' => 20],
            ['symbol' => 'TATAMOTORS', 'display_name' => 'Tata Motors', 'name' => 'Tata Motors Ltd.', 'exchange' => 'NSE', 'instrument_type' => 'stock', 'is_active' => true, 'sort_order' => 21],
            ['symbol' => 'SUNPHARMA', 'display_name' => 'Sun Pharma', 'name' => 'Sun Pharmaceutical Industries', 'exchange' => 'NSE', 'instrument_type' => 'stock', 'is_active' => true, 'sort_order' => 22],
            ['symbol' => 'MARUTI', 'display_name' => 'Maruti Suzuki', 'name' => 'Maruti Suzuki India Ltd.', 'exchange' => 'NSE', 'instrument_type' => 'stock', 'is_active' => true, 'sort_order' => 23],
            ['symbol' => 'WIPRO', 'display_name' => 'Wipro', 'name' => 'Wipro Ltd.', 'exchange' => 'NSE', 'instrument_type' => 'stock', 'is_active' => true, 'sort_order' => 24],
            ['symbol' => 'TATASTEEL', 'display_name' => 'Tata Steel', 'name' => 'Tata Steel Ltd.', 'exchange' => 'NSE', 'instrument_type' => 'stock', 'is_active' => true, 'sort_order' => 25],
            ['symbol' => 'TECHM', 'display_name' => 'Tech Mahindra', 'name' => 'Tech Mahindra Ltd.', 'exchange' => 'NSE', 'instrument_type' => 'stock', 'is_active' => true, 'sort_order' => 26],
        ];

        foreach ($stocks as $sym) {
            MarketSymbol::updateOrCreate(['symbol' => $sym['symbol']], $sym);
        }
    }
}
