<?php

namespace App\Repositories;

use App\Repositories\BaseRepository;
use App\Models\GoodSubstitute;

class GoodSubstituteRepository extends BaseRepository
{
    protected $goodSubstitute;

    public function __construct(GoodSubstitute $goodSubstitute)
    {
        $this->goodSubstitute = $goodSubstitute;
        parent::__construct($goodSubstitute);
    }

    public function filter($query, $column, $value)
    {
    }
}
