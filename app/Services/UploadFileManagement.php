<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use stdClass;

class UploadFileManagement
{
    public $dir = '__file_managements__';

    public function handleUploadedFile(UploadedFile $file)
    {
        $target = $this->getTargetFileName($file);
        $file->move($this->getUploadDirectory(), $target->path);

        return $target;
    }

    public function getTargetFileName(UploadedFile $file)
    {
        $index = 1;
        $filePath = $file->getClientOriginalName();
        $filename = pathinfo($filePath, PATHINFO_FILENAME);
        $extension = pathinfo($filePath, PATHINFO_EXTENSION);


        $newFilePath = "{$this->getUploadDirectory()}/{$filePath}";
        $newFileName = $file->getClientOriginalName();

        while (file_exists($newFilePath)) {

            $newFilePath = "{$this->getUploadDirectory()}/{$filename} ({$index}).{$extension}";
            $newFileName = "{$filename} ({$index}).{$extension}";
            $index++;
        }

        $data = new stdClass();
        $data->filename = $file->getClientOriginalName();
        $data->type = $extension;
        $data->path = $newFileName;
        return $data;
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

    public function removeDirectoryPath($path)
    {
        $path = storage_path('app/public/__file_managements__/' . $path);
        if (!File::exists($path)) {
            return false;
        }

        return unlink($path);
    }

    public function handleNewFolder($request)
    {
        $target = $this->getTargetFolderName($request);
        // File::makeDirectory("{$this->getUploadDirectory()}/{$target->path}", 0777, true, true);
        return $target;
    }

    public function getTargetFolderName($request)
    {
        $index = 1;
        $foldername = $request['folder_name'];

        $newFolderPath = "{$this->getUploadDirectory()}/{$foldername}";
        $newFoldername = $request['folder_name'];

        while (File::isDirectory($newFolderPath)) {
            $newFolderPath = "{$this->getUploadDirectory()}/{$foldername} ({$index})";
            $newFoldername = "{$foldername} ({$index})";
            $index++;
        }

        $data = new stdClass();
        $data->filename = $foldername;
        $data->type = 'folder';
        $data->path = $newFoldername;
        return $data;
    }
}
