<?php

namespace App\Services\Market\Contracts;

interface MarketDataProviderInterface
{
    /**
     * Fetch market overview containing indices and constituent quotes.
     */
    public function fetchMarketData(): array;

    /**
     * Get list of major indices quotes.
     */
    public function getIndices(): array;

    /**
     * Get a single quote for the given symbol.
     */
    public function getQuote(string $symbol): ?array;

    /**
     * Get quotes for multiple symbols.
     */
    public function getQuotes(array $symbols): array;

    /**
     * Get dynamically calculated top gainers.
     */
    public function getTopGainers(): array;

    /**
     * Get dynamically calculated top losers.
     */
    public function getTopLosers(): array;

    /**
     * Get market operational status (e.g., open, closed, pre-open, post-market).
     */
    public function getMarketStatus(): array;

    /**
     * Get ISO timestamp of the last data update from provider.
     */
    public function getLastUpdated(): ?string;

    /**
     * Return provider display name / attribution.
     */
    public function getProviderName(): string;

    /**
     * Return whether quotes provided are delayed.
     */
    public function isDelayed(): bool;

    /**
     * Return delay in minutes if delayed.
     */
    public function getDelayMinutes(): int;

    /**
     * Return whether the provider offers true real-time quotes.
     */
    public function isRealtime(): bool;
}
