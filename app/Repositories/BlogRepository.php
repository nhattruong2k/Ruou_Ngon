<?php

namespace App\Repositories;

use App\Models\Blog;
use App\Models\BlogEmployee;
use App\Models\BlogInternalOrg;
use App\Repositories\BaseRepository;
use App\Models\Role;
use App\Models\Permistion;
use App\Models\User;
use App\Services\UploadFileManagement;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class BlogRepository extends BaseRepository
{
    protected $blog;
    protected $user;
    protected $blogInternalOrg;
    protected $blogEmployee;

    public function __construct(Blog $blog, User $user, BlogInternalOrg $blogInternalOrg, BlogEmployee $blogEmployee)
    {
        $this->blog = $blog;
        $this->user = $user;
        $this->blogInternalOrg = $blogInternalOrg;
        $this->blogEmployee = $blogEmployee;
        parent::__construct($blog);
    }

    public function getAll($request = null)
    {
        $user = Auth::user();
        $rowsPerPage = 0;

        if (isset($request['rows_per_page'])) {
            $rowsPerPage = $request->get('rows_per_page');
        }

        $query = $this->blog->with(['internalOrg', 'user', 'blogInternalOrg', 'blogInternalOrg.internalOrg', 'blogEmployee', 'blogEmployee.employee'])
            ->when(
                !$user->hasRole('admin'),
                function ($query) use ($user) {
                    // return $query->where('internal_org_id', '=', $user->internal_org_id);
                    return $query->whereHas('blogInternalOrg', function ($q) use ($user) {
                        $q->where('internal_org_id', '=', $user->internal_org_id);
                    });
                }
            )->when(
                $request->get('filter_internal'),
                function ($query) use ($request) {
                    return $query->whereHas('blogInternalOrg', function ($q) use ($request) {
                        $q->whereIn('internal_org_id',  $request->get('filter_internal'));
                    });
                }
            )->when(
                !$user->hasRole('admin'),
                function ($query) use ($user) {
                    return $query->whereHas('blogEmployee', function ($q) use ($user) {
                        $q->where('employee_id', '=', $user->id);
                    });
                }
            );

        if (!empty($request->get('filter_title'))) {
            $query = $query->where('title', 'LIKE', '%' . $request->filter_title . '%');
        }


        if ($rowsPerPage) {
            return $query->orderBy('id', 'DESC')->paginate($rowsPerPage);
        }
        return $query->orderBy('id', 'DESC')->get();
    }

    public function create($request)
    {

        DB::beginTransaction();
        try {
            // Create file attachment of blog
            $attachFiles = [];
            if (isset($request->attachFiles) && !empty($request->attachFiles)) {
                foreach ($request->attachFiles as $attachFile) {
                    $file = $attachFile;
                    $uploadService = app(UploadFileManagement::class);
                    $uploadService->dir = '__blog_attachments__';
                    $filePath = $uploadService->handleUploadedFile($file);
                    $attachFiles[] = [
                        'name' => $filePath->filename,
                        'path' => $filePath->path,
                        'type' => $filePath->type,
                    ];
                }
                $request->merge(['attachments' => json_encode($attachFiles)]);
            }

            $request->merge(['created_by' => Auth::user()->id]);

            $blog = $this->blog->create($request->all());

            foreach ($request->internal_org_id as $org_id) {
                $this->blogInternalOrg->create([
                    'blog_id' => $blog->id,
                    'internal_org_id' => $org_id['id']
                ]);
            }

            if ($request->employee_id && isset($request->employee_id) && !empty($request->employee_id)) {
                foreach ($request->employee_id as $employee) {
                    $this->blogEmployee->create([
                        'blog_id' => $blog->id,
                        'employee_id' => $employee['id']
                    ]);
                }
            }

            DB::commit();

            return [
                'data' => true,
                'code' => 201,
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

            $blogs = $this->blog->find($id);
            if ($blogs) {
                $filePath = '';
                // Remove file attachment of blog
                $fileRemoved = $request->fileRemoved ?? null;
                if ($fileRemoved) {
                    $uploadService = app(UploadFileManagement::class);
                    foreach ($fileRemoved as $file) {
                        $path = storage_path('app/public/__blog_attachments__/' . $file['path']);
                        $uploadService->removeDirectory($path);
                    }
                }
                // Update file attachment of blog
                $requestFiles = $request->attachFiles ?? null;
                $attachFiles = [];
                if ($requestFiles && isset($request->attachFiles) && !empty($request->attachFiles)) {
                    foreach ($requestFiles as $attachFile) {
                        if (is_object($attachFile)) {
                            $file = $attachFile;
                            $uploadService = app(UploadFileManagement::class);
                            $uploadService->dir = '__blog_attachments__';
                            $filePath = $uploadService->handleUploadedFile($file);
                            $attachFiles[] = [
                                'name' => $filePath->filename,
                                'path' => $filePath->path,
                                'type' => $filePath->type,
                            ];
                        } else {
                            $attachFiles[] = $attachFile;
                        }
                    }
                }
                $request->merge(['attachments' => json_encode($attachFiles)]);

                $request->merge(['updated_by' => Auth::user()->id]);

                $blogs->update($request->all());
                foreach ($request->internal_org_id as $org_id) {
                    $this->blogInternalOrg->where('blog_id', $blogs->id)->delete();
                }
                foreach ($request->internal_org_id as $org_id) {
                    $this->blogInternalOrg->create([
                        'blog_id' => $blogs->id,
                        'internal_org_id' => $org_id['id']
                    ]);
                }

                if (empty($request->employee_id)) {
                    $this->blogEmployee->where('blog_id', $blogs->id)->delete();
                } elseif ($request->employee_id && isset($request->employee_id) && !empty($request->employee_id)) {
                    foreach ($request->employee_id as $employee) {
                        $this->blogEmployee->where('blog_id', $blogs->id)->delete();
                    }
                    foreach ($request->employee_id as $employee) {
                        $this->blogEmployee->create([
                            'blog_id' => $blogs->id,
                            'employee_id' => $employee['id']
                        ]);
                    }
                }
            }
            DB::commit();

            return [
                'data' => true,
                'code' => 201,
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

    public function getBlogById($blog_id)
    {
        return $this->blog->with([
            'internalOrg', 'user'
        ])->findOrFail($blog_id);
    }

    public function removeItems($request)
    {
        $rules = [
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer|min:1',
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return [
                'code' => 400,
                'status' => false,
                'data' => $validator->errors(),
                'message' => 'Validation errors'
            ];
        }

        DB::beginTransaction();
        try {
            $blogIds = $request->get('ids');
            $blogs = $this->blog->whereIn('id', $blogIds)->get();
            foreach ($blogs as $blog) {
                $blog->delete();
                $this->blogInternalOrg->whereIn('blog_id', $blogIds)->delete();
                $this->blogEmployee->whereIn('blog_id', $blogIds)->delete();
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

    public function removeFile($request, $id)
    {
        $blogs = $this->blog->findOrFail($id);
        if ($blogs) {

            $oldAttachments = json_decode($blogs->attachments, true) ?? [];

            $fileRemoved = $request->fileRemoved ?? null;

            if (!is_null($oldAttachments) && is_array($oldAttachments)) {
                if ($fileRemoved) {
                    foreach ($fileRemoved as $file) {
                        $oldAttachments = array_filter($oldAttachments, function ($attachment) use ($file) {
                            return $attachment['path'] !== $file['path'];
                        });
                    }

                    $blogs->attachments = json_encode(array_values($oldAttachments));
                    $blogs->save();
                }
            } else {
                return [
                    'data' => false,
                    'code' => 400,
                    'status' => false,
                    'message' => 'Attachments data is missing or not valid.'
                ];
            }
        }
    }
}
