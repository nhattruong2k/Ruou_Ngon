<?php

namespace App\Http\Requests\Orders;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class OrdersWarehouseServiceRequest extends FormRequest
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
        return [
            'code' => 'required|unique:orders,code,' . $this->order_id,
            'export_warehouse_id' => 'required',
            'import_warehouse_id' => 'required',
            'date' => 'required|date',
            'products' => 'required',
        ];
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
            'code.required' => 'Nhận số chứng từ',
            'code.unique' => 'Số chứng từ đã tồn tại',
            'export_warehouse_id.required' => 'Chọn kho nhận',
            'import_warehouse_id.required' => 'Chọn kho nhận',
            'date.required' => 'Nhập ngày chứng từ',
            'products.required' => 'Nhập xe chuyển',
            'created_by.required' => 'Người thực hiện không tồn tại ',
        ];
    }
}
