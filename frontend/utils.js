// utils.js
export function ids(){
	const processIdName =(id) =>{
		const newId =  // from a-b to aB
				id.split('-')
				.map((val, index)=>{
					if (index===0) return val
					let newVal= val[0].toUpperCase() + val.substr(1) 
					return newVal
				})
				.join('')
			
		return newId
	}
	const elementRefs =[]
	const elementsWithId = document.querySelectorAll("[id]")
	elementsWithId.forEach(element=>elementRefs[processIdName(element.id)]=element)
	return elementRefs
}
export  const display = new (class {
	#setText = (text) => {
		// console.log(document.querySelector('#notification .message'))
		document.querySelector('#notification .message').textContent = text;
	}
	#show = () => {
		document.querySelector('#notification').classList.add('show');
		setTimeout(() => {
			document.querySelector('#notification').classList.remove('show');
		}, 3000);
	}
	constructor() {
		this.alert = (message) => {
			document.querySelector('#notification').classList.add('alert');
			this.#setText(message)
			this.#show()
		},
			this.message = (message) => {
				document.querySelector('#notification').classList.replace('alert', 'message');
				this.#setText(message)
				this.#show()
			}
	}
})
export  function disableElement(ele) {
	ele.setAttribute('disabled','')
}
export  function enableElement(ele) {
	ele.removeAttribute('disabled')
}

export  function defaultErrorCallback(data){
	console.error("default error callback",data)
	display.alert(data.message)
}

export  function defaultSuccessCallback(data){
	console.log("default success callback",data)
	display.message(data.message)
}

export  function* loadingCharGenerator(chars) {
	let index = 0;
	while (true) {
		yield chars[index];
		index = (index + 1) % chars.length; // Cycle through the characters
	}
}