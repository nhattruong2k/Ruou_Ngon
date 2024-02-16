<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class UploadService
{
    public $dir = '__employee_photos__';

    public function handleUploadedFile(UploadedFile $file)
    {
        $targetFileName = $this->getTargetFileName($file);
        $file->move($this->getUploadDirectory(), $targetFileName);

        return $targetFileName;
    }

    public function getTargetFileName(UploadedFile $file)
    {
        if (!file_exists($this->getUploadDirectory() . $file->getClientOriginalName())) {
            return rand(1111, 9999999) . '_' . strtotime(Carbon::now()) . '.' . $file->getClientOriginalExtension();
        }

        return rand(1111, 9999999) . '_' . strtotime(Carbon::now()) . '.' . $file->getClientOriginalExtension();
    }

    public function setUploadDirectory($path)
    {
        if (Storage::makeDirectory($path)) {
            $this->dir = $path;
            return;
        }

        $this->dir = '';
    }

    public function getUploadDirectory()
    {
        return storage_path('app/public/' . $this->dir);
    }

    public function removeDirectory($path)
    {
        if (!File::exists($path)) {
            return false;
        }

        return unlink($path);
    }
}
