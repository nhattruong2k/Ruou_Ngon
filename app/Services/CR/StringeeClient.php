<?php

namespace App\Services\CR;

use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\CR\Contact;
use App\Models\Parties;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Storage;
use Exception;
use Illuminate\Support\Facades\File;

class StringeeClient
{
    public $redis;

    public function __construct()
    {
        // $this->redis = Redis::connection();
    }

    public function initToken($type = "client")
    {
        try {
            // if ($this->redis->get('key_item_' . auth()->user()->id)) {

            //     return [
            //         'data' => true,
            //         'message' => 'success',
            //         'access_token' => $this->redis->get('key_item_' . auth()->user()->id)
            //     ];
            // }

            if (empty(config('stringee.payload_client_api')) || empty(config('stringee.api_key_secret')) || empty(config('stringee.header'))) {

                return [
                    'data' => false,
                    'access_token' => '',
                    'message' => 'Config information wrong'
                ];
            }

            $jwtToken = null;

            if ($type == "client") {
                $jwtToken = JWT::encode(config('stringee.payload_client_api'), config('stringee.api_key_secret'), 'HS256', null, config('stringee.header'));
            } else if ($type == 'rest_api') {
                $jwtToken = JWT::encode(config('stringee.payload_client_rest_api'), config('stringee.api_key_secret'), 'HS256', null, config('stringee.header'));
            }

            // $this->redis->set('key_item_' . auth()->user()->id, $jwtToken);

            return [
                'data' => true,
                'message' => 'success',
                'access_token' => $jwtToken
            ];
        } catch (Exception $exception) {
            Log::error('error message ' . $exception->getMessage());

            return [
                'data' => false,
                'message' => $exception->getMessage(),
                'access_token' => ''
            ];
        }
    }

    public function eventUrlCallback($request)
    {
        try {
            $callId = $request->get('call_id');


            Log::info(('Info of call id ' . $callId));

            Log::info(json_encode($request->all()));
        } catch (Exception $exception) {

            throw $exception;
        }
    }

    public function getCallLog($callId)
    {
        Log::info('Record call of call-id ' . $callId);

        $restApiToken = $this->initToken('rest_api');

        if (!$restApiToken['data']) {
            Log::info('Access token not found');
            return;
        }

        $response = Http::withHeaders([
            'accept' => 'application/json',
            'X-STRINGEE-AUTH' => $restApiToken['access_token'],
        ])->get(config('stringee.api_url') . '/call/log?id=' . $callId);

        Log::info('Call log ' . json_encode(json_decode($response->body())->data->calls[0]));

        return json_encode(json_decode($response->body())->data->calls[0]);
    }

    public function getRecordCall($callId)
    {
        Log::info('Record call of call-id ' . $callId);

        $restApiToken = $this->initToken('rest_api');
        $pathForder = 'record-call';

        if (!$restApiToken['data']) {
            Log::info('Access token not found');
            return;
        }

        $response = Http::withHeaders([
            'accept' => 'application/octet-stream',
            'X-STRINGEE-AUTH' => $restApiToken['access_token'],
        ])->get(config('stringee.api_url') . '/call/recording',  $callId);

        if (!File::exists($pathForder)) {
            Storage::makeDirectory("/record-call");
        }

        $storeSuccess = Storage::put($pathForder . '/' . $callId . '.mp3', $response->body());

        if ($storeSuccess) {
            return $pathForder . '/' . $callId . '.mp3';
        }

        return '';
    }

    public function sendSms($toNumber, $content = "")
    {
        $postParams = [
            "sms" => [
                [
                    "from" => config('stringee.phone_number'),
                    "to" => $toNumber,
                    "text" => $content
                ]
            ]
        ];

        $restApiToken = $this->initToken('rest_api');

        if (!$restApiToken['data']) {
            return;
        }

        $response = Http::withHeaders([
            'accept' => 'application/json',
            'X-STRINGEE-AUTH' => $restApiToken['access_token']
        ])->post(config('stringee.api_url') . '/sms', $postParams);

        return $response->body();
    }
}
