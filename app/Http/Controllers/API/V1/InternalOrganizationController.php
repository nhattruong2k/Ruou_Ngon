<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\InternalOrg\InternalOrgRequest;
use Illuminate\Http\Request;
use App\Repositories\InternalOrganizationRepository;
use App\Repositories\OrganizationTypeRepository;
use App\Traits\ResponseTrait;
use App\Imports\OrganiztionImport;
use Exception;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class InternalOrganizationController extends Controller
{
    /**
     * Response trait to handle return responses.
     */
    use ResponseTrait;

    protected $internalOrgRepository;


    public function __construct(InternalOrganizationRepository $internalOrg)
    {
        $this->internalOrgRepository = $internalOrg;
        $this->middleware('permission:internalorgs-list', ['only' => ['index', 'show']]);
        $this->middleware('permission:internalorgs-create', ['only' => ['create', 'store']]);
        $this->middleware('permission:internalorgs-edit', ['only' => ['edit', 'update']]);
        $this->middleware('permission:internalorgs-delete', ['only' => ['destroy']]);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Respmysqlonse
     */
    public function index(Request $request): JsonResponse
    {
        $organizations = $this->internalOrgRepository->getAll($request);

        return $this->responseSuccess([
            'internalOrgs' => $organizations
        ], 'List organizations success!');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(InternalOrgRequest $request)
    {
        $request->merge(['created_by' => Auth::user()->id]);
        $response = $this->internalOrgRepository->create($request);

        if (!$response['data']) {
            return $this->responseError($response, $response['message']);
        }

        return $this->responseSuccess($response, 'Create item success');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(InternalOrgRequest $request, $id)
    {
        $request->merge(['updated_by' => Auth::user()->id]);
        $data = $this->internalOrgRepository->update($request, $id);

        return $this->responseSuccess($data, 'Update item success');
    }


    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $response = $this->internalOrgRepository->removeItems($request);

        if (!($response['status'])) {
            return $this->responseError($response['status'], $response['data'], $response['message']);
        }

        return $this->responseSuccess($response, 'Remove item success!');
    }
}
