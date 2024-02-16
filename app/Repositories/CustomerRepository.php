<?php

namespace App\Repositories;

use App\Repositories\BaseRepository;
use App\Models\Customer;

class CustomerRepository extends BaseRepository
{
    protected $customer;

    public function __construct(Customer $customer)
    {
        $this->customer = $customer;

        parent::__construct($customer);
    }

    public function getAll($request = false)
    {
        $customers = $this->customer->select('customers.*', 'customer_types.name as customer_type')
            ->leftJoin('customer_types', 'customers.customer_type_id', '=', 'customer_types.id');

        return $customers->orderBy('customers.id', 'DESC')->paginate(10000000);
    }

    public function filter($query, $column, $value)
    {
    }
}
