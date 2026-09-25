<?php

namespace App\Services\Market\DTO;

use InvalidArgumentException;

class MarketQuoteDTO
{
    public string $symbol;
    public string $name;
    public string $exchange;
    public string $currency;
    public ?float $ltp;
    public ?float $previousClose;
    public ?float $change;
    public ?float $changePercent;
    public ?float $open;
    public ?float $high;
    public ?float $low;
    public ?int $volume;
    public ?float $yearHigh;
    public ?float $yearLow;
    public string $marketStatus;
    public bool $isRealtime;
    public bool $isDelayed;
    public ?int $delayMinutes;
    public string $dataSource;
    public string $lastUpdated;

    public function __construct(array $data)
    {
        if (empty($data['symbol']) || !is_string($data['symbol'])) {
            throw new InvalidArgumentException('MarketQuoteDTO requires a valid string symbol.');
        }

        $rawPrice = $data['ltp'] ?? $data['value'] ?? $data['price'] ?? null;
        if ($rawPrice === null || !is_numeric($rawPrice) || (float)$rawPrice <= 0) {
            throw new InvalidArgumentException("MarketQuoteDTO for symbol '{$data['symbol']}' requires a positive numeric price/ltp.");
        }

        $this->symbol = trim($data['symbol']);
        $this->name = !empty($data['name'])
            ? trim($data['name'])
            : (!empty($data['display_name']) ? trim($data['display_name']) : $this->symbol);

        $this->exchange = !empty($data['exchange']) ? strtoupper(trim($data['exchange'])) : 'NSE';
        $this->currency = !empty($data['currency']) ? strtoupper(trim($data['currency'])) : 'INR';
        $this->ltp = round((float)$rawPrice, 2);

        $prevClose = $data['previous_close'] ?? $data['chartPreviousClose'] ?? null;
        $this->previousClose = (isset($prevClose) && is_numeric($prevClose))
            ? round((float)$prevClose, 2)
            : null;

        $rawChange = $data['change'] ?? $data['absolute_change'] ?? null;
        if (isset($rawChange) && is_numeric($rawChange)) {
            $this->change = round((float)$rawChange, 2);
        } elseif ($this->previousClose && $this->previousClose > 0) {
            $this->change = round($this->ltp - $this->previousClose, 2);
        } else {
            $this->change = 0.0;
        }

        $rawChangePct = $data['change_percent'] ?? $data['percentage_change'] ?? null;
        if (isset($rawChangePct) && is_numeric($rawChangePct)) {
            $this->changePercent = round((float)$rawChangePct, 2);
        } elseif ($this->previousClose && $this->previousClose > 0) {
            $this->changePercent = round((($this->ltp - $this->previousClose) / $this->previousClose) * 100, 2);
        } else {
            $this->changePercent = 0.0;
        }

        $open = $data['open'] ?? null;
        $this->open = (isset($open) && is_numeric($open)) ? round((float)$open, 2) : null;

        $high = $data['high'] ?? $data['day_high'] ?? null;
        $this->high = (isset($high) && is_numeric($high)) ? round((float)$high, 2) : null;

        $low = $data['low'] ?? $data['day_low'] ?? null;
        $this->low = (isset($low) && is_numeric($low)) ? round((float)$low, 2) : null;

        $vol = $data['volume'] ?? null;
        $this->volume = (isset($vol) && is_numeric($vol)) ? (int)$vol : null;

        $yHigh = $data['year_high'] ?? $data['fiftyTwoWeekHigh'] ?? null;
        $this->yearHigh = (isset($yHigh) && is_numeric($yHigh)) ? round((float)$yHigh, 2) : null;

        $yLow = $data['year_low'] ?? $data['fiftyTwoWeekLow'] ?? null;
        $this->yearLow = (isset($yLow) && is_numeric($yLow)) ? round((float)$yLow, 2) : null;

        $this->marketStatus = !empty($data['market_status']) ? strtolower(trim($data['market_status'])) : 'closed';
        $this->isDelayed = isset($data['is_delayed']) ? (bool)$data['is_delayed'] : true;
        $this->isRealtime = isset($data['is_realtime']) ? (bool)$data['is_realtime'] : !$this->isDelayed;
        $this->delayMinutes = isset($data['delay_minutes']) ? (int)$data['delay_minutes'] : ($this->isDelayed ? 15 : 0);
        $this->dataSource = !empty($data['data_source']) ? trim($data['data_source']) : 'Financial Market Feed';
        $this->lastUpdated = !empty($data['last_updated']) ? $data['last_updated'] : now()->toIso8601String();
    }

    public static function fromArray(array $data): self
    {
        return new self($data);
    }

    public function toArray(): array
    {
        return [
            // Exact Section 7 Normalized Data Format
            'symbol' => $this->symbol,
            'name' => $this->name,
            'exchange' => $this->exchange,
            'currency' => $this->currency,
            'ltp' => $this->ltp,
            'previous_close' => $this->previousClose,
            'change' => $this->change,
            'change_percent' => $this->changePercent,
            'open' => $this->open,
            'high' => $this->high,
            'low' => $this->low,
            'volume' => $this->volume,
            'year_high' => $this->yearHigh,
            'year_low' => $this->yearLow,
            'market_status' => $this->marketStatus,
            'is_realtime' => $this->isRealtime,
            'is_delayed' => $this->isDelayed,
            'delay_minutes' => $this->delayMinutes,
            'data_source' => $this->dataSource,
            'last_updated' => $this->lastUpdated,

            // Backwards-compatible convenience aliases for existing frontend components
            'display_name' => $this->name,
            'value' => $this->ltp,
            'absolute_change' => $this->change,
            'percentage_change' => $this->changePercent,
            'day_high' => $this->high,
            'day_low' => $this->low,
        ];
    }
}
