<?php

namespace App\Http\Requests\FeeLicensePlate;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;

class FeeLicensePlateRequest extends FormRequest
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
            return $this->createFeeLicensePlate();
        } else {
            return $this->editFeeLicensePlate();
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
            'district_id.unique' => 'Huyện này đã tồn tại giá trị!',
        ];
    }

    public function createFeeLicensePlate()
    {
        return [
            'district_id' => 'unique:license_plate_fees'
        ];
    }

    public function editFeeLicensePlate()
    {
        return [
            'district_id' => 'unique:license_plate_fees'
        ];
    }
}
