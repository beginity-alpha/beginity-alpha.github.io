import { redirectTo } from "../navigation/main.js";
let countdown; // scoped variable for this module for keeping track of countdown
let interval; // interval variable to keep track of running async task
// this wil execute each time the element loads
export function initUI(document) {
    try {
        countdown = 5;
        if (interval) clearInterval(interval)
        interval = setInterval(() => {
            try {
                //if the element is present 
                if (document.getElementById('error-countdown')) {
                    document.getElementById('error-countdown').innerHTML = countdown;
                    countdown--
                }else {
                // if the element is not-present anymore ( redirected before countdown )
                    if (interval) clearInterval(interval)
                    return;
                }
                // check if count-down has reached zero
                if (countdown <= 0) {
                    clearInterval(interval)
                    redirectTo('/login')
                }
            } catch (error) {
                clearInterval(interval)
                console.error(error)
            }
        }, 1000)
    } catch (error) {
        clearInterval(interval)
    }
}