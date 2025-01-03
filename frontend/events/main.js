"use strict";
import { redirectTo } from '../navigation/main.js';
import { getEvents, createEvent, fetchUserDetail, makeSecureRequest, hostSocket } from './../app-SDK.js';
import { loadingCharGenerator,defaultErrorCallback, defaultSuccessCallback, ids } from './../utils.js'

export function initUI(document = window.document) {
	document = document
	const $id = ids()
	let previousVal1 = $id.createEventsDialog.style.getPropertyValue('display');
	//disable them
	$id.createEventsDialog.style.setProperty('display', 'none');
	
	fetchUserDetail().then((userDetail) => {
		if (
			userDetail.role == 'Teacher' ||
			userDetail.role == 'Speaker' ||
			userDetail.role == 'Admin'
		) {
			$id.createEventsDialog.style.setProperty('display', previousVal1);
			}
	})
	$id.createEvent.onsubmit = createEvent.handler((data)=>{
			defaultSuccessCallback(data)
			redirectTo('/events')
		}, defaultErrorCallback);
	loadEvents()
}

async function loadEvents() {
	const eventsPanel = document.querySelector('#panel-events')
	eventsPanel.textContent = 'loading events'
	const loadingChars = ['/', '-', '\\', '|']; // Added a backslash and pipe for better animation
	const gen = loadingCharGenerator(loadingChars)
	const loadInterval = setInterval(() => {
		eventsPanel.textContent = "loading events " + gen.next().value
	},100)
	try {
		const { events } = await getEvents();
		clearInterval(loadInterval)
		eventsPanel.innerHTML = ''
		if (events.length === 0) { eventsPanel.innerHTML = 'No Events Found !'; return; }
		let tempEle = document.createElement('div')

		events.map((event) => {
			tempEle.innerHTML += `
				<div class="event-card" id="e${event._id}">
					<span class="title">${event.title}</span><br>
					<span class="duration">from:  ${new Date(event.start_time).toLocaleString()}</span><br>
					<span class="duration">to:  ${ new Date(event.end_time).toLocaleString() }</span><br>
					<details>
						<summary>
							Show More
						</summary>
						<fieldset class="hide-scrollbar">
						<span class="description" >
						<ul>
						
						<heading><h3>Objectives</h3></heading>
						${event.description.objectives.map(o => `<li>${o}</li>`).join()}
						</ul>
						<ul>
						<heading><h3>Learning Outcomes</h3></heading>
						${event.description.learning_outcomes.map(l => `<li>${l}</li>`).join()}
						</ul>
						<button type='button' class="enroll">Enroll</button>
						</span>
						</fieldset>
					</details>
				</div>
			`
		})
		tempEle.querySelectorAll('.event-card').forEach(
			eventCard => {
				const event_id = eventCard.getAttribute('id').slice(1);
				const enrollBtn = eventCard.querySelector('.enroll')
				if (enrollBtn) enrollBtn.addEventListener('click', async (e) => {
					try {
						const data = await makeSecureRequest(`${hostSocket}/api/attendances/${event_id}`, "POST", {})
						defaultSuccessCallback(data)
					} catch (error) {
						defaultErrorCallback(error)
					}
					e.target.setAttribute('disabled', '')
					setTimeout(() => {
						e.target.removeAttribute('disabled')
					}, 3000)
				})
			})
		eventsPanel.append(...tempEle.children)

	} catch (error) {
		console.error(error)
		clearInterval(loadInterval)
		eventsPanel.textContent = 'error loading events.'
	}
}