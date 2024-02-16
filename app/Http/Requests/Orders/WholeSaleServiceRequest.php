<?php

namespace App\Http\Requests\Orders;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class WholeSaleServiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        if ($this->isMethod('post')) {
            return $this->createOrder();
        } else {
            return $this->updateOrder();
        }
    }

    public function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'status'   => false,
            'code'      => 422,
            'message'   => 'Validation errors',
            'data'      => $validator->errors()
        ], 422));
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array
     */
    public function messages()
    {
        $reqs = [
            'party_id.required' => 'Vui lòng chọn mã khách hàng',
            'date.required' => 'Vui lòng chọn ngày chứng từ',
            'warehouseid.required' => 'Trường không được để trống',
            'goodRows.required' => 'Vui lòng chọn xe',
        ];

        return $reqs;
    }

    public function createOrder()
    {
        $reqs = [
            'party_id' => 'required',
            'date' => 'required|date',
            'warehouseid' => 'required',
            'goodRows' => 'required',
        ];

        return $reqs;
    }

    public function updateOrder()
    {
        $reqs = [
            'party_id' => 'required',
            'date' => 'required|date',
            'warehouseid' => 'required',
            'goodRows' => 'required',
        ];

        return $reqs;
    }
}
