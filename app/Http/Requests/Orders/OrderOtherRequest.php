<?php

namespace App\Http\Requests\Orders;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class OrderOtherRequest extends FormRequest
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
            return $this->createOrderOther();
        } else {
            return $this->editOrderOther();
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
        $reqs = [
            'warehouse_id.required' => 'Trường không được để trống',
            'date.required' => 'Vui lòng chọn ngày chứng từ',
            'products.required' => 'Vui lòng nhập thông tin xe',
            'function_type.required' => 'Trường không được để trống',
        ];

        if($this->function_type == 'other_export') $reqs = array_merge($reqs, ['party_id.required' => 'Vui lòng chọn mã khách hàng']);

        return $reqs;
    }

    public function createOrderOther()
    {
        $reqs = [
            'warehouse_id' => 'required',
            'date' => 'required',
            'products' => 'required',
            'function_type' => 'required',
        ];

        if($this->function_type == 'other_export') $reqs = array_merge($reqs, ['party_id' => 'required']);

        return $reqs;
    }

    public function editOrderOther()
    {
        $reqs = [
            'date' => 'required',
            'products' => 'required',
        ];

        if($this->function_type == 'other_export') $reqs = array_merge($reqs, ['party_id' => 'required']);

        return $reqs;
    }
}
