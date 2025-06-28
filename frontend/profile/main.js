import { fetchUserDetail, hostSocket } from "./../app-SDK.js"
import {ids} from './../utils.js'
export const initUI = async ()=>{
    console.log('// profile page loaded')
    try {
        const $id = ids()
        const user = await fetchUserDetail()
        console.log(user)
        $id.profilePage.innerHTML +=`
            <h4 class='role ${user.role}'>${user.role}</h4>
            ${user.profile 
                ?`<img src="${hostSocket}${user.profile}" alt='profile-image'></img>`
                : '<span>No Profile Image Set</span>'}
            <h2  class='nickname'>${user.nickname}</h2>
            <h4 class='name'>${user.name}</h4>
            ${((user)=>{
                switch(user.role){
                   case "Teacher" :
                        return `<h4 class='title'>${user.title}</h4>`
                    
                    case "Speaker":
                        return `
                            <h4 class='organization'>${user.organization}</h4>
                            <h4 class='about'>${user.about}</h4>
                            <h4 class='reviews'>${user.totalReviewScore/5*user.totalReviews} (${user.totalReviews})</h4>
                            <ul class='links'>
                                <header class='links-header'>Links :</header>
                                ${user.links.map(l=>`<a href="${l}">${l}</a>`).join()})
                            </ul>
                        `
                    
                    case "Student":
                        return `
                        <h4 class='enrollment no.'>${user.enrollment_id}</h4>
                            <h4 class='gender'>${user.gender}</h4>
                            <h4 class='stream'>${user.stream}</h4>
                            <h4 class='branch'>${user.branch}</h4>
                        `
                }
            })(user)}
        `
    } catch (error) {
        console.warn(error)
    }
}
