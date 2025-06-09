import React, { useEffect, useState } from 'react'
import * as yup from 'yup';
import axios from "axios"

// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L'
}

// 👇 Here you will create your schema.
const schema = yup.object().shape({
fullName: yup.string().min(3,validationErrors.fullNameTooShort).max(20, validationErrors.fullNameTooLong).required(),
size: yup.string().required(validationErrors.sizeIncorrect),
toppings: yup.array()
})
// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
]





export default function Form() {
const [initialValues, setInitialValues] = useState({fullName:"", size:"", toppings:[]})
const [initialErrors, setInitialErrors] = useState({fullName:"", size:"", toppings:""})
const [formSucces, setFormSucces] = useState();
const [formError, setFormError] = useState();
const [isValid, setIsValid] = useState(false);


const validationHandler = (elementName, value) => {
  yup
  .reach(schema, elementName)
  .validate(value)
  .then(() => {
    setInitialErrors(prev => ({ ...prev, [elementName]: ''}))
  })
  .catch(err => {
    setInitialErrors(prev => ({ ...prev, [elementName]: err.message}))
  })
}

// console.log(initialValues.toppings);

const onSubmit = e => {
  e.preventDefault()
 axios.post("http://localhost:9009/api/order",initialValues)
 .then(res => {
  setInitialValues({fullName:"", size:"", toppings:[]})
  setFormSucces(res.data.message)
  setFormError()
 })
 .catch(err => {
  setFormError(err.message)
  setFormSucces()
  
 })

}

const onNameChange = e => {
  setInitialValues(prev => ({...prev, fullName: e.target.value}))
  const { value } = e.target
  validationHandler("fullName", value);
}

const onSizeChange = e => {
  setInitialValues(prev => ({
    ...prev,
    size: e.target.value
  }))
  const { value } = e.target
  validationHandler("size", value);
}
const onCheckBoxChange = e => {
  const { value, checked } = e.target;
  setInitialValues(prev => {
    const toppings = checked
      ? [...prev.toppings, value]
      : prev.toppings.filter(top => top !== value)

    return {
      ...prev,
      toppings
   }
  })
}


 useEffect(() => {
  schema.isValid(initialValues).then(valid => setIsValid(valid))
  
 },[initialValues])


  return (
    <form>
      <h2>Order Your Pizza</h2>
      {formSucces && <div className='success'>{formSucces}</div>}
      {formError && <div className='failure'>{formError}</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">FullName</label><br />
          <input placeholder="Type full name" id="fullName" type="text" value={initialValues.fullName} 
          onChange={onNameChange}
          />
        </div>
        {initialErrors.fullName && <div className='error'>{initialErrors.fullName}</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size" >Size</label><br />
          <select id="size" value={initialValues.size} onChange={onSizeChange}>
            <option value="">----Choose Size----</option>
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
            {/* Fill out the missing options */}
          </select>
        </div>
        {initialErrors.size && <div className='error'>{initialErrors.size}</div>}
      </div>

      <div className="input-group">
        {/* 👇 Maybe you could generate the checkboxes dynamically */}
        {toppings.map((top) => <label key={top.topping_id}>
          <input
            name={top.topping_id}
            type="checkbox"
            value={top.topping_id}
            checked={initialValues.toppings.includes(top.topping_id)}
            onChange={onCheckBoxChange}
              />
          {top.text}<br />
        </label>)}
      </div>
      {/* 👇 Make sure the submit stays disabled until the form validates! */}
      <input type="submit" disabled={!isValid} onClick={onSubmit}/>
    </form>
  )
}
