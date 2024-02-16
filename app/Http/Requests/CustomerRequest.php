<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CustomerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'name' => 'required|string|max:255',
            'customer_type_id' => 'required',
            'sex' => 'required',
            'date_of_birth' => 'required',
            'occupation' => 'required'
        ];    
    }

    public function createCustomer() {

    }

    public function editCustomer() {
        
    }
}
