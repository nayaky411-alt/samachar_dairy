<?php

namespace App\Services;

use App\Services\Market\MarketDataService as CoreMarketDataService;

/**
 * Service proxy for backward compatibility with PublicController dependency injection.
 */
class MarketDataService extends CoreMarketDataService
{
}
