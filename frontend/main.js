// main.js
"use strict";
import { getItemWithExpiry, getClassrooms, initSocket } from './app-SDK.js';
import { defaultErrorCallback, defaultSuccessCallback, display } from './utils.js'
import { insertCustomElement } from './custom-element.js';
export const navigationEle = () =>  /** This is the element which is handling the routes of the page */
	document.querySelector('#navigation-header')
export const routeDisplayEle = () => /** this is the element which displays the custom element to the route */
	document.querySelector('#display-route-content');

// initial config. of socket handler
export const socketSdk = () => getItemWithExpiry('token') ? new initSocket(
	{
		newMessageCallback: (data)=>{
			window.dispatchEvent(
				new CustomEvent('new_message', {
					detail:data,
					bubbles:true
				})
			)
			defaultSuccessCallback(data)
		},
		connectionCallback: defaultSuccessCallback,
		successCallback: defaultSuccessCallback,
		errorCallback: defaultErrorCallback,
		attendanceStartedCallback: defaultSuccessCallback,
		punchInCallback: defaultSuccessCallback,
		punchOutCallback: defaultSuccessCallback
	}) : null

const tokenElement = document.getElementById("token");

addEventListener("DOMContentLoaded", async () => {
	const savedToken = getItemWithExpiry('token');
	if (savedToken) {
		tokenElement.textContent = savedToken
		const classrooms = await getClassrooms();
		const classroom_ids = classrooms.map(classroom => classroom._id)
		console.log(classroom_ids)
		socketSdk().joinClassRoom(classroom_ids) // join the classrooms for starting communications & notifications
		// display the events
		insertCustomElement('/events', routeDisplayEle())
	}
	else {
		insertCustomElement('/login', routeDisplayEle())
		// display the log in page
		tokenElement.textContent = "Please Log in...";
		display.alert("Please Log in...")
		return;
	}
});