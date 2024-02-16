<?php

namespace App\Http\Requests\Employments;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class EmploymentRequest extends FormRequest
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
            return $this->createEmployment();
        } else {
            return $this->editEmployment();
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
            'employee_id.required' => 'Chọn nhân viên',
            'department_id.required' => 'Chọn phòng ban',
            'position_id.required' => 'Chọn vị trí công tác',
            'fulltime_flag.required' => 'Trường không được để trống',
            'salary_flag.required' => 'Trường không được để trống',
            'from_date.required' => 'Trường không được để trống',
        ];
    }

    public function createEmployment()
    {
        return [
            'employee_id' => 'required',
            'department_id' => 'required',
            'position_id' => 'required',
            'fulltime_flag' => 'required',
            'salary_flag' => 'required',
            'from_date' => 'required',
        ];
    }

    public function editEmployment()
    {
        return [
            'employee_id' => 'required',
            'department_id' => 'required',
            'position_id' => 'required',
            'fulltime_flag' => 'required',
            'salary_flag' => 'required',
            'from_date' => 'required',
        ];
    }
}
