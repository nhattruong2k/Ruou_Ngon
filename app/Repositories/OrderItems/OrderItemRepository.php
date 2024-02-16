<?php

namespace App\Repositories\OrderItems;

use App\Repositories\BaseRepository;
use App\Models\OrderItem;
use App\Repositories\DailyProductBalanceRepository;

class OrderItemRepository extends BaseRepository
{
    protected $orderItem;

    public function __construct(OrderItem $orderItem)
    {
        $this->orderItem = $orderItem;

        parent::__construct($orderItem);
    }
}
