<?php

namespace App\Http\Requests\Employees;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class EmployeeRequest extends FormRequest
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
            return $this->createEmployee();
        } else {
            return $this->editEmployee();
        }
    }

    public function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'code' => 422,
            'message' => 'Validation errors',
            'data' => $validator->errors()
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
            'name.required' => 'Nhập tên nhân viên',
            'username.unique' => 'Tên tài khoản này đã tồn tại',
            'username.required' => 'Nhập tên tài khoản',
            'email.required' => 'Nhập email',
            'email.unique' => 'Email này đã tồn tại',
            'code.required' => 'Nhập mã nhân viên',
            'code.unique' => 'Mã nhân viên đã tồn tại',
            'internal_org_id.required' => 'Chọn nơi công tác'
        ];
    }

    public function createEmployee()
    {
        return [
            'name' => 'required|string|max:255',
            'username' => [
                'required',
                'string',
                'max:255',
                Rule::unique('users', 'username')->whereNull('deleted_at'),
            ],
            'email' => [
                'required',
                Rule::unique('users', 'email')->whereNull('deleted_at')
            ],
            'code' => [
                'required',
                'string',
                'max:45',
                Rule::unique('users', 'code')->whereNull('deleted_at')
            ],
            'internal_org_id' => 'required',
        ];
    }

    public function editEmployee()
    {
        $id = $this->employee;
        return [
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,'.$id,
            'email' => 'required|unique:users,email,'.$id,
            'code' => 'required|string|max:45|unique:users,code,'.$id,
            'internal_org_id' => 'required',
        ];
    }
}
