<?php

namespace App\Http\Controllers\API\V1;

use Illuminate\Http\Request;
use App\Traits\ResponseTrait;
use Illuminate\Http\JsonResponse;
use App\Exports\CustomerCareExport;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;
use App\Repositories\CustomerCareRepository;

class CustomerCareController extends Controller
{
    use ResponseTrait;

    protected $customerCareRepository;

    public function __construct(CustomerCareRepository $customerCareRepository)
    {
        $this->customerCareRepository = $customerCareRepository;
    }

    public function exportExcel(Request $request)
    {
        $customerCare = $this->customerCareRepository->getAll($request);

        return Excel::download(new CustomerCareExport($customerCare), 'export.xlsx');
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $customerCare = $this->customerCareRepository->getAll($request);

        return $this->responseSuccess([
            'customerCare' => $customerCare,
        ], 'Customer Care List Successfully!');
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {

        $response = $this->customerCareRepository->delete($id);

        return $this->responseSuccess($response, 'Remove item success!');
    }
}
