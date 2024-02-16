<?php

namespace App\Http\Requests\InternalOrg;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class InternalOrgRequest extends FormRequest
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
            return $this->createInternalOrg();
        } else {
            return $this->editInternalOrg();
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
            'name.required' => 'Nhập tên tổ chức',
            'code.required' => 'Nhập mã tổ chức',
            'code.unique' => 'Mã tổ chức này đã tồn tại',
        ];
    }

    public function createInternalOrg()
    {
        return [
            'name' => 'required',
            'code' => 'required',
            'code' => 'required|string|max:45|unique:internal_orgs',
        ];
    }

    public function editInternalOrg()
    {
        return [
            'name' => 'required',
            'code' => 'required',
            'code' => 'required|string|max:45|unique:internal_orgs,code,' . $this->internal_org,
        ];
    }
}
