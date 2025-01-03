import { io } from "https://cdn.socket.io/4.8.0/socket.io.esm.min.js"
export const hostSocket = `https://beginity.ddns.net`;
/***
 * 
*/
export async function registerUser(e, successCallback=(data)=>{console.log(data)}, errorCallback=(error)=>console.error(error)) {
	e.preventDefault();
	try {
		const data = await makeRequest(
			hostSocket + "/api/auth/register",
			"POST",
			getFormDataObject(e.target, e.submitter)
		);
		successCallback(data)
	} catch (error) {
		errorCallback(error)
	}
}
// callbackify the function so to directly bind it with onsubmit eventListener
registerUser.handler=(successCallback, errorCallback)=>{
	return function (event){
		registerUser(event, successCallback, errorCallback)
	}
}
/***
 * 
*/
export async function logInUser(e, successCallback=(data)=>{console.log(data)}, errorCallback=(error)=>console.error(error)) {
	e.preventDefault();
	try {
		const data = await makeRequest(
			hostSocket + "/api/auth/login",
			"POST",
			getFormDataObject(e.target, e.submitter)
		);
		successCallback(data)
		setItemWithExpiry("token", data.token, 15 * 86400000)
		setItemWithExpiry("user-login-detail", {...data.user},15 * 86400000)
	} catch (error) {
		errorCallback(error)
	}
}
logInUser.handler=(successCallback, errorCallback)=>{
	return function (event){
		logInUser(event, successCallback, errorCallback)
	}
}
/***
 * 
*/
export async function createEvent(e, successCallback=(data)=>{console.log(data)}, errorCallback=(error)=>console.error(error)) {
	e.preventDefault(); // Prevent the default form submission

	// Create a JSON object based on the schema
	const formData = new FormData(e.target, e.submitter);
	const eventJson = {
		mandatory: formData.get("mandatory") === "on",
		title: formData.get("title"),
		description: {
			detail: formData.get('detail'),
			objectives: formData.get("objectives").split("\n"), // Split by line for multiple objectives
			learning_outcomes: formData.get("learning_outcomes").split("\n"), // Split by line for multiple outcomes
		},
		start_time: new Date(formData.get("start_time")).toISOString(),
		end_time: new Date(formData.get("end_time")).toISOString(),
		location: {
			address: formData.get("address"),
			lat: parseFloat(formData.get("lat")) || null,
			long: parseFloat(formData.get("long")) || null,
		},
		speaker_ids: formData
			?.get("speaker_ids")
			?.split(",")
			.map((id) => id.trim()), // Split by comma for multiple IDs
	};
	console.group('createEvent')
	// Log the JSON object to the console
	console.log(JSON.stringify(eventJson, null, 2)); // Pretty-print JSON

	try {
		const data = await makeSecureRequest(`${hostSocket}/api/events`, 'POST', eventJson)
		successCallback(data)
	} catch (error) {
		errorCallback(error)
	} finally {
		console.groupEnd();
	}
}
createEvent.handler=(successCallback, errorCallback)=>{
	return function (event){
		createEvent(event, successCallback, errorCallback)
	}
}
/***
 * 
*/
export async function getEvents(e=null) {
	e?.preventDefault();

	try {
		const events = await makeRequest(
			hostSocket + "/api/events/",
			"GET",
			{}
		);
		console.log(events);
		return events
	} catch (error) {
		console.error(error);
		throw Error(error.message)
	}
}
/***
 * 
*/
export async function getAttendance(e=null) {
	e?.preventDefault();
	try {
		console.log('k')
		const data= await makeSecureRequest(hostSocket+'/api/attendances','GET',{})
		return data
	} catch (error) {
		console.log(error)
		throw Error(error.message)	
	}
}
/***
 * 
*/
export async function getClassrooms(e) {
	if (e) e.preventDefault()
	try {
		const data = await makeSecureRequest(hostSocket + '/api/classrooms/', "GET")
		console.log(data)
		return data;
	} catch (error) {
		throw Error(error.message)
	}
}
/***
 * 
*/
export async function uploadFile(event, successCallback=(data)=>{console.log(data)}, errorCallback=(error)=>console.error(error)) {
	event.preventDefault();
	const formData = new FormData(event.target, event.submitter);
	try {
		const token = getItemWithExpiry("token");

		if (!token) {
			throw new Error("Log in/ Register to Perform This action");
		}
		const url = hostSocket + '/file/upload/';
		const method = 'POST';
		const response = await fetch(url, {
			method: method,
			headers: {
				// "Content-Type": "multipart/form-data",
				Authorization: `Bearer ${token}`,
			}, // set JWT token with Bearer prefix
			body: formData,
		});
		// check for errors :
		if (!response.ok) {
			const error_data = await response.json()
			throw new Error(error_data?.message);
		}
		// success :
		const data = await response.json()
		successCallback(data)
		return data;
	} catch (error) {
		// error :
		errorCallback(error)
		return null
	}
}
uploadFile.handler=(successCallback, errorCallback)=>{
	return function (event){
		uploadFile(event, successCallback, errorCallback)
	}
}
// send OTP email
/***
 * 
*/
export async function verifyEmail(email, purpose, successCallback=(data)=>{console.log(data)}, errorCallback=(error)=>console.error(error)) {
	try {
		const data = await makeRequest(hostSocket + '/api/auth/otp', 'post', { email, purpose })
		successCallback(data)
		return data
	} catch (error) {
		errorCallback(error)
		return null
	}
}
/***
 * 
*/
export function getFormDataObject(form, submitter) {
	const formData = new FormData(form, submitter);
	const data = {};
	formData.entries().forEach(([key, value]) => {
		data[key] = value;
	});
	// console.log(data);
	return data;
}

/***
 * 
*/
export async function makeRequest(url, method, data = {}) {
	try {
		const reqObj = {
			method: method,
			headers: {
				"Content-type": "application/json",
				Accept: "application/json",
			}, // set nothing
			body: JSON.stringify(data),
		};
		if (["GET", "HEAD"].includes(method.toUpperCase())) delete reqObj.body;
		const response = await fetch(url, reqObj);

		if (!response.ok) {
			const data = await response.json();
			console.dir(data);
			throw new Error(data?.message || "Unknown Error!");
		}

		return await response.json();
	} catch (error) {
		console.dir("Fetch request failed", error);
		throw error;
	}
}
/***
 * 
*/
export async function makeSecureRequest(url, method, data) {
	try {
		const token = getItemWithExpiry('token');

		if (!token) {
			throw new Error("Log in/ Register to Perform This action");
		}
		const fetchOptions = {
			method: method,
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-type": "application/json",
				Accept: "application/json",
			}, // set JWT token with Bearer prefix
			body: JSON.stringify(data),
		}
		if (["GET", "HEAD"].includes(method.toUpperCase())) delete fetchOptions.body; // get requests have no body 
		const response = await fetch(url, fetchOptions);

		if (!response.ok) {
			const data = await response.json();
			console.dir(data);
			throw new Error(data?.message || "Unknown Error!");
		}

		return await response.json();
	} catch (error) {
		throw error;
	}
}

export function setItemWithExpiry(key, value, ttl) {
	const now = new Date();
	const item = {
		value: value, // The actual data
		expiry: now.getTime() + ttl // Expiry time in milliseconds
	};
	localStorage.setItem(key, JSON.stringify(item));
}

export function getItemWithExpiry(key) {
	try {
		const itemStr = localStorage.getItem(key);
		if (!itemStr) {
			return null; // Item does not exist
		}
		const item = JSON.parse(itemStr);

		const now = new Date();

		// Compare the expiry time with the current time
		if (now.getTime() > item.expiry) {
			localStorage.removeItem(key); // Remove the expired item
			return null; // Indicate the item has expired
		}
		return item.value; // Return the value if not expired
	} catch (error) {
		console.warn("error", error)
		return null;
	}
}

export class initSocket {
	static instance
	constructor({ newMessageCallback, connectionCallback, successCallback, errorCallback, attendanceStartedCallback, punchInCallback, punchOutCallback, }) {
		if (initSocket.instance) return initSocket.instance;
		console.log('once created will not again')
		const socket = io(hostSocket, {
			auth: {
				token: getItemWithExpiry('token')
			}
		});
		socket.on('punch_in', (data) => {
			console.dir(' [socket] punch-in data:', data);
			punchInCallback(data);
		});
		socket.on('punch_out', (data) => {
			console.dir('[socket] punch-out data:', data);
			punchOutCallback(data);
		});
		socket.on("new_message", (data) => {
			console.dir('[socket] new-message data:', data);
			newMessageCallback(data);
		});
		socket.on("connection", (data) => {
			console.dir(' [socket] connected..');
			connectionCallback(data);
		});
		socket.on("success", (data) => {
			if (!data || data?.message) data.message = 'connection successful';
			console.dir('[socket] success message :', data);
			successCallback(data);
		});
		socket.on("error", (data) => {
			console.dir('[socket] error message :', data);
			errorCallback(data);
		});
		socket.on("attendance_started", (data) => {
			console.dir('[socket] attendance started data : ', data);
			attendanceStartedCallback(data);
		});
		initSocket.instance =
		{
			socket,
			sendMessage: (classroom_id, message) => {
				socket.emit('new_message', { classroom_id, message });
			},
			startAttendance: (classroom_id, timeout = 5) => {
				socket.emit('start_attendance', { classroom_id, timeout });
			},
			joinClassRoom: (classroom_ids) => {
				socket.emit('join_classroom', { classroom_ids });
			},
			punchIn: (data) => {
				console.dir(' [socket] punch-in data:', data);
				socket.emit('punch_in', data);
			},
			punchOut: (data) => {
				console.dir('[socket] punch-out data:', data);
				socket.emit('punch_out', data);
			}
		};
		return initSocket.instance;
	}
}

export const fetchUserDetail = async () => {
	// first try to get it from the localstorage : 
	try {
		let savedDet = false
		savedDet = getItemWithExpiry("user-login-detail")
		// if exists 
		if(savedDet && Object.getOwnPropertyNames(savedDet|| {}).length !==0 ) return savedDet;
		// else 
		return false
	} catch (error) {
		console.error(error?.message || "unknown error")
		return false
	}
}
export async function getAllAttendances({event_id, classroom_id, user_id}, successCallback, errorCallback){
	try {
		const data = await makeSecureRequest(`${hostSocket}/api/attendances?user_id="674b3c5e7fffda283acb6bbf"`,'GET',{})

		successCallback(data)
		console.log(data)
	} catch (error) {
		errorCallback(error)
		console.log(error)
	}
}
getAllAttendances({}, (data)=>console.log(data.message), (data)=>console.error(data.message));
// 	"/api/auth/register",
// 	"/api/auth/login",
// 	"api/users",
// 	"/api/users/id",
// 	"/api/users/name",
// 	"/api/users/email",
// 	"/api/events/",
// 	"/api/events/upcoming",
// 	"/api/events/ended",
// 	"/api/events/ongoing",
// ];