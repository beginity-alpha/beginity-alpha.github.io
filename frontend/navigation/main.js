import { getItemWithExpiry } from './../app-SDK.js'
import { navigationEle, routeDisplayEle} from './../main.js';
import { insertCustomElement } from './../custom-element.js'

const activeTag = {
    val:null,
    get:()=>{
        return activeTag.val;
    },
    set:(newActiveTag)=>{
        activeTag.val?.classList.remove('active')
        activeTag.val = newActiveTag;
        activeTag.val.classList.add('active')
    }
}

export function initUI(document=navigationEle()) {
    const linkClicked = ()=>{
    const token = getItemWithExpiry('token')
    if (token) {
        navigationEle().querySelector('[name="/login"]').parentElement.style.setProperty('display', 'none');
    } else {
        navigationEle().querySelector("[name='/profile']").parentElement.style.setProperty('display', 'none');
    }
}
    linkClicked()
    navigationEle().querySelectorAll('a')
        .forEach(anchorTag => {
            anchorTag.addEventListener('click', (e) => {
                e.preventDefault()
                if(activeTag.get()===anchorTag) return; // if already on the page
                activeTag.set(anchorTag);
                // setting up routes :: 
                switch (anchorTag.getAttribute('name')) {
                    case '/events':
                        insertCustomElement('/events', routeDisplayEle())
                        break
                        case '/classrooms':
                        insertCustomElement('/classrooms', routeDisplayEle())
                        break
                    case '/profile':
                        insertCustomElement('/profile', routeDisplayEle())
                        break
                    case '/login':
                        insertCustomElement('/login', routeDisplayEle())
                        break
                    default:
                        insertCustomElement('/error', routeDisplayEle())
                        break
                }
                linkClicked() // for checking if status has changed or not
            })
        })
}
export function redirectTo(url){
    let isLoggedIn = false;
    if(getItemWithExpiry('token')) isLoggedIn = true
    switch (url) {
        case '/events':
            insertCustomElement('/events', routeDisplayEle())
            break
        case '/classrooms':
            if (isLoggedIn) insertCustomElement('/classrooms', routeDisplayEle())
            else insertCustomElement('/login', routeDisplayEle())
            break
        case '/profile':
            if (isLoggedIn) insertCustomElement('/profile', routeDisplayEle())
            else  insertCustomElement('/login', routeDisplayEle())
            break
        case '/login':
            if (isLoggedIn) insertCustomElement('/events', routeDisplayEle())
            else insertCustomElement('/login', routeDisplayEle())
            break
        default:
            insertCustomElement('/error', routeDisplayEle())
            break
    }
    const linkClicked = ()=>{
        if(!navigationEle()) return
        const token = getItemWithExpiry('token')
        if (token) {
            navigationEle().querySelector('[name="/login"]').parentElement.style.setProperty('display', 'none');
        } else {
            navigationEle().querySelector("[name='/profile']").parentElement.style.setProperty('display', 'none');
        }
    }
    linkClicked()
}