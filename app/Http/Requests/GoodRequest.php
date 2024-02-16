<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\Rule;

class GoodRequest extends FormRequest
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
            return $this->createGood();
        } else {
            return $this->editGood();
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
            'name.required' => 'Nhập tên sản phẩm',
            'code.required' => 'nhập mã sản phẩm',
            'code.unique' => 'Mã sản phẩm này đã tồn tại',
            'good_category_id.required' => 'Chọn loại sản phẩm',
            'unit_of_measure_id.required' => 'Chọn đơn vị tính',
        ];
    }

    public function createGood()
    {
        return [
            'name' => 'required',
            // 'code' => 'required|string|max:45|unique:goods',
            'code' => [
                'required',
                'string',
                'max:45',
                Rule::unique('goods', 'code')->whereNull('deleted_at'),
            ],
            'good_category_id' => 'required',
            'unit_of_measure_id' => 'required',
        ];
    }

    public function editGood()
    {
        $id = $this->good;

        return [
            'name' => 'required',
            // 'code' => 'required|string|max:45|unique:goods,code,' . $id,
            'code' => [
                'required',
                'string',
                'max:45',
                Rule::unique('goods', 'code')->ignore($id)->whereNull('deleted_at'),
            ],
            'good_category_id' => 'required',
            'unit_of_measure_id' => 'required',
        ];
    }
}
