import { getAttendance, hostSocket, makeSecureRequest } from "../app-SDK";

async function initUI(document){
    // get attendances 
    let query = {
        classroom_id:'',
        event_id:'',
        page : 1,
        sort_by:'',
        group_by:''
    }
    const attendances= async () =>{
        const url = new URL(hostSocket+'/api/attendances')
        Object.entries(query)
        .forEach(([queryParam, value])=>{
            if(!value) return;
            url.searchParams.set(queryParam, value)
        })
        let response;
        try {
            response = await makeSecureRequest(url.toString(),"GET",{})
            displayResults(response)
        } catch (error) {
            console.error("error while fetching attendances",error)
        }
    }
}

function displayResults(response){
    //TODO 
    console.log(response)
}


