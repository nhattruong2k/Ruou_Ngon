<?php

namespace App\Http\Requests\Orders;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class ServiceOrderRequest extends FormRequest
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
            return $this->createServiceOrder();
        } else {
            return $this->editServiceOrder();
        }
    }

    public function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success'   => false,
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
        return [
            'party_id.required' => 'Chọn mã nhà cung cấp',
            'warehouse_id.required' => 'Chọn kho nhập',
            'container_number.required' => 'Chọn số lô hàng',
        ];
    }

    public function createServiceOrder()
    {
        return [
            'party_id' => 'required',
            'warehouse_id' => 'required',
            'container_number' => 'required',
        ];
    }

    public function editServiceOrder()
    {
        return [
            'party_id' => 'required',
            'warehouse_id' => 'required',
            'container_number' => 'required',
        ];
    }
}
