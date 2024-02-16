<?php

namespace App\Repositories;

use App\Models\FileManagement;
use App\Repositories\BaseRepository;
use App\Services\UploadFileManagement;
use App\Services\UploadService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Exception;

class FileManagementRepository extends BaseRepository
{
    protected $fileManagement;

    public function __construct(FileManagement $fileManagement)
    {
        $this->fileManagement = $fileManagement;
        parent::__construct($fileManagement);
    }


    public function getAll($request = null)
    {
        $rowsPerPage = 0;

        if (isset($request['rows_per_page'])) $rowsPerPage = $request->get('rows_per_page');
        // dd($request->get('type'));
        $query = $this->fileManagement->with(['user'])
            ->when($request->get('name'), function ($query) use ($request) {

                return $query->where('name', 'like', '%' . $request->get('name') . '%');
            })
            ->when($request->get('type'), function ($query) use ($request) {

                return $query->whereIn('type', $request->get('type'));
            });
        if (isset($request['folder_id']) && !empty($request['folder_id']) && empty($request['name']) && empty($request['type'])) {
            $query = $query->where('parent_id', $request['folder_id']);
        } else {
            $query = $query->whereNull('parent_id');
        }

        $path = $this->getParentPath($request['folder_id']);

        if ($rowsPerPage) {
            return array('data' => $query->paginate($rowsPerPage), 'path' =>  $path);
        }

        return array('data' => $query->get(), 'path' =>  $path);
    }

    public function getParentPath($id)
    {
        $parents = [];
        $item = $this->fileManagement::find($id);

        while ($item && $item->parent_id !== null) {

            $parents[] = $item;
            $item = $this->fileManagement::find($item->parent_id);
        }

        if ($item) $parents[] = $item;

        $parents = array_reverse($parents);

        return $parents;
    }

    public function getParentPath_Bak($id)
    {
        $parents = [];
        $item = $this->fileManagement::find($id);

        while ($item && $item->parent_id !== null) {

            $parents[] = $item;
            $item = $this->fileManagement::find($item->parent_id);
        }

        $parents = array_reverse($parents);

        $path = '/';
        foreach ($parents as $parent) {
            $path =  $path . $parent->name . '/';
        }

        if ($item) $path = '/' . $item->name . $path;
        return $path;
    }

    public function create($request)
    {
        DB::beginTransaction();
        try {
            $uploadService = app(UploadFileManagement::class);
            switch ($request['type_upload']) {
                case 'NewFolder':

                    if (isset($request['folder_name']) && !empty($request['folder_name'])) {
                        $fileData = $uploadService->handleNewFolder($request);
                        $request->merge([
                            'name' => $fileData->filename,
                            'path' => $fileData->path,
                            'created_by' => auth()->user()->id,
                            'type' => $fileData->type,
                            'created_at' => Carbon::now()
                        ]);
                        $this->fileManagement->create($request->all());
                    } else {
                        throw new \Exception("Không có nhập tên thư mục.", 404);
                    }
                    break;
                default:
                    if ($request->hasFile('file_uploads')) {

                        foreach ($request->file('file_uploads') as $file) {
                            $filePath = '';
                            $fileData = $uploadService->handleUploadedFile($file);
                            $request->merge([
                                'name' => $fileData->filename,
                                'path' => $fileData->path,
                                'created_by' => auth()->user()->id,
                                'type' => $fileData->type,
                                'created_at' => Carbon::now(),
                            ]);
                            $this->fileManagement->create($request->all());
                        }
                    } else {
                        throw new \Exception("Không có file nào được tải lên.", 404);
                    }
                    break;
            }


            DB::commit();
            return [
                'data' => true,
                'code' => 200,
                'status' => true,
                'message' => 'create item success'
            ];
        } catch (Exception $exception) {
            DB::rollBack();
            Log::error('exception' . $exception->getMessage());

            return [
                'data' => false,
                'code' => 400,
                'status' => false,
                'message' => $exception->getMessage()
            ];
        }
    }

    public function update($request, $id)
    {
        DB::beginTransaction();
        try {

            $file = $this->fileManagement->find($id);
            if ($file) {
                $file->update($request->all());
            }
            DB::commit();
            return [
                'data' => true,
                'code' => 200,
                'status' => true,
                'message' => 'update item success'
            ];
        } catch (Exception $exception) {
            DB::rollBack();
            Log::error('exception' . $exception->getMessage());

            return [
                'data' => false,
                'code' => 400,
                'status' => false,
                'message' => $exception->getMessage()
            ];
        }
    }

    public function delete($id)
    {
        DB::beginTransaction();
        try {
            $file = $this->fileManagement->find($id);
            if ($file->isNotDelete === 1) {
                throw new Exception('Bạn không được phép xóa thư mục này!', 400);
            }
            if ($file) {
                $this->removeFile($file);
            }

            DB::commit();
            return [
                'code' => 200,
                'status' => true,
                'data' => true,
                'message' => 'Delete items success'
            ];
        } catch (Exception $exception) {
            DB::rollBack();
            return [
                'code' => 400,
                'status' => false,
                'message' => $exception->getMessage(),
                'data' => false
            ];
        }
    }

    function removeFile($file)
    {
        $uploadService = app(UploadFileManagement::class);

        $data = $this->fileManagement->where('parent_id', $file->id)->get();

        foreach ($data as $item) {
            if ($item->type === 'folder') {
                $this->removeFile($item);
            } else {
                $uploadService->removeDirectoryPath($item->path);
                $item->delete();
            }
        }

        $file->delete();
    }
}
