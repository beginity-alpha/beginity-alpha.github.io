"use strict";
import {ids, display, defaultErrorCallback, enableElement, disableElement} from './../utils.js'
import { logInUser, registerUser, verifyEmail} from './../app-SDK.js'
import { redirectTo } from './../navigation/main.js'

export function initUI(document = window.document) {
	document = document 
	const $id=ids()
	if(!$id.registerRole) return
 	$id.registerRole.onclick = handleInputFieldsForRoles
	$id.registerUser.onsubmit = registerUser.handler(data=>{
		display.message(data.message)
		redirectTo('/login')
	},defaultErrorCallback);

	$id.logInUser.onsubmit = logInUser.handler((data)=>{
		redirectTo('/events') // redirects to events page
		display.message(data.message)
	}, defaultErrorCallback);
	
	const otpInput = $id.registerOtp
	const getOtpBtn = $id.registerVerifyEmailButton
	const submitButton = $id.registerSubmitButton
	const emailInput = $id.registerEmail
	// 
	getOtpBtn.addEventListener('click', async (e) => {
		disableElement(getOtpBtn) // disable it...
		let seconds = 10;
		const retryInterval = setInterval(()=>{
			getOtpBtn.innerHTML = 'retry after '+seconds+'s.'
			seconds--;
			if(seconds<=0) {
				clearInterval(retryInterval)
				getOtpBtn.innerHTML = 'Get OTP'	
				enableElement(getOtpBtn)
			}
		},1000)
		try {
			// verify the email :
			const data = await verifyEmail(emailInput.value, 'verification')
			if(data){
                display.message(data.message)
            }
		} catch (error) {
			display.alert(data.message)
			console.log(error.message)
		}
	})
	
	const inputs =[otpInput, emailInput]
	inputs.forEach((ele) => {
		ele.addEventListener('input',
			(e) => {
				const isOtpValid = otpInput.value && otpInput.value.length === 6;
				const isEmailValid = emailInput.value && emailInput.value.trim() !== '';
				
				if (isOtpValid && isEmailValid) { // OTP & email valid
					enableElement(submitButton);
                    return
				}
                if(isEmailValid){ // if email valid
					enableElement(getOtpBtn) 
                    return 
				}
                // default disable both
				disableElement(submitButton);
				disableElement(getOtpBtn)
		})
	})
}

export function handleInputFieldsForRoles(e) {
	console.log(e.target.value);
	const studentFields = [
		"register-branch",
		"register-year",
		"register-enrollment_id",
		"register-gender",
		"register-stream"
	];

	const speakerFields = ["register-about", "register-organization", "register-links"]
	const teacherFields = ["register-title"];
	const changeStatuesTo = (status) => {
		if (status == "enable")
			return (elementIds) => {
				elementIds.forEach((elementId) => {
					const element = document.getElementById(elementId);
					const elementLabel = document.querySelector(`[for='${elementId}']`)
					// make visible and allow to input value

					element.removeAttribute("disabled");
					element.removeAttribute("hidden");
					//  also check for their labels with [for=id]
					elementLabel?.removeAttribute("hidden")
					elementLabel?.removeAttribute("disabled")
				});
			};
		if (status == "disable")
			return (elementIds) => {
				elementIds.forEach((elementId) => {
					const element = document.getElementById(elementId);
					const elementLabel = document.querySelector(`[for='${elementId}']`)
					// hide and disable
					element.setAttribute("disabled", "");
					element.setAttribute("hidden", "");
					// and their labels 
					elementLabel?.setAttribute("disabled", "");
					elementLabel?.setAttribute("hidden", "");
				});
			};
	};
	switch (e.target.value) {
		case "Student":
			// enable student fields
			changeStatuesTo("enable")(studentFields);
			// disable other fields
			changeStatuesTo("disable")(teacherFields);
			changeStatuesTo("disable")(speakerFields);
			break;
		case "Teacher":
			// enable teacher fields
			changeStatuesTo("enable")(teacherFields);
			// disable other fields
			changeStatuesTo("disable")(studentFields);
			changeStatuesTo("disable")(speakerFields);
			break;
		case "Speaker":
			// enable speaker fields
			changeStatuesTo("enable")(speakerFields);
			// disable other fields
			changeStatuesTo("disable")(studentFields);
			changeStatuesTo("disable")(teacherFields);
			break;
	}
};