<?php

namespace App\Http\Requests\Parties;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class PartiesRequest extends FormRequest
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
            return $this->createParty();
        } else {
            return $this->editParty();
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
            'name.required' => 'Nhập tên khách hàng',
            'code.required' => 'Nhập mã khách hàng',
            'code.unique' => 'Mã khách hàng đã tồn tại',
            'party_type_id.required' => 'Chọn nhóm khách hàng',
        ];
    }

    public function createParty()
    {
        return [
            // 'code' => 'required|string|max:45|unique:parties',
            'code' => [
                'required',
                'string',
                'max:45',
                Rule::unique('parties', 'code')->whereNull('deleted_at'),
            ],
            'name' => 'required',
            'party_type_id' => 'required',
        ];
    }

    public function editParty()
    {
        $id = $this->party;
        return [
            'code' => 'required|string|max:45|unique:parties,code,'.$id,
            'name' => 'required',
            'party_type_id' => 'required',
        ];
    }
}
