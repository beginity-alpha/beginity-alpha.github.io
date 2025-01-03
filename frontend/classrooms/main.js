"use strict";
import { fetchUserDetail, getClassrooms } from './../app-SDK.js';
import { socketSdk } from '../main.js';
import { loadingCharGenerator, ids } from './../utils.js';

// Initialize the UI when the element is loaded in the DOM
export function initUI(document) {
    const $id = ids();
    console.log('Initializing UI:', $id);
    loadClassrooms();
}

// Function to load classrooms into the panel-classroom section
async function loadClassrooms() {
    const user = await fetchUserDetail();
    const messagesContainerMap = new Map();
    const socketHelper = socketSdk();

    const classroomsPanel = document.querySelector('#panel-classrooms');
    classroomsPanel.textContent = 'Loading classrooms...';
    const loadingChars = ['/', '-', '\\', '|'];
    const gen = loadingCharGenerator(loadingChars);

    const loadInterval = setInterval(() => {
        classroomsPanel.textContent = "Loading classrooms " + gen.next().value;
    }, 100);

    window.addEventListener('new_message', handleNewMessage);

    try {
        const classrooms = await getClassrooms();
        clearInterval(loadInterval);
        classroomsPanel.innerHTML = '';

        if (classrooms.length === 0) {
            classroomsPanel.textContent = 'No classrooms found!';
            return;
        }

        const classroomIds = classrooms.map(classroom => classroom._id);
        socketHelper?.joinClassRoom(classroomIds);

        classrooms.forEach(classroom => {
            const classroomCard = createClassroomCard(classroom, user);
            classroomsPanel.appendChild(classroomCard);

            const messagesContainer = classroomCard.querySelector('.messages-container');
            messagesContainerMap.set(`e${classroom._id}`, messagesContainer);

            attachEventHandlers(classroomCard, classroom._id, user, socketHelper);
        });
    } catch (error) {
        console.error('Error loading classrooms:', error);
        clearInterval(loadInterval);
        classroomsPanel.textContent = 'Error loading classrooms.';
    }

    function handleNewMessage(event) {
        setTimeout(() => {
            const { classroom_id, nickname, message } = event.detail;
            const element = messagesContainerMap.get(`e${classroom_id}`);
            if (element) {
                const messageHTML = createMessageHTML(nickname, message, user.nickname);
                element.insertAdjacentHTML('beforeend', messageHTML);
            } else {
                console.info("Some message updates have been missed");
            }
        }, 1000);
    }
}

// Attach event handlers to a classroom card
function attachEventHandlers(card, classroomId, user, socketHelper) {
    if (!card) return;

    const startAttendanceBtn = card.querySelector('button.start-attendance');
    const punchInBtn = card.querySelector('button.punch-in');
    const punchOutBtn = card.querySelector('button.punch-out');
    const sendBtn = card.querySelector('.send-message-button');
    const sendMsgInput = card.querySelector('.send-message-input');

    if (startAttendanceBtn) {
        startAttendanceBtn.addEventListener('click', (e) => handleAttendance(e, classroomId, socketHelper));
    }

    if (punchInBtn || punchOutBtn) {
        [punchInBtn, punchOutBtn].forEach((btn) => {
            btn?.addEventListener('click', (e) => handlePunch(e, classroomId, socketHelper));
        });
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sendBtn.setAttribute('disabled', '');
            const message = sendMsgInput.value;
            if (!message) return;

            sendMsgInput.value = '';
            setTimeout(() => {
                socketHelper?.sendMessage(classroomId, message);
                sendBtn.removeAttribute('disabled');
            }, 500);
        });
    }
}

// Create classroom card HTML
function createClassroomCard(classroom, user) {
    const card = document.createElement('div');
    card.className = 'classroom-card';
    card.id = `e${classroom._id}`;

    card.innerHTML = `
        <span class="name">${classroom.name}</span><br>
        ${createDiscussionsTemplate(classroom, user)}
    `;
    return card;
}

// Create discussions template
function createDiscussionsTemplate(classroom, user) {
    const messagesHTML = classroom.discussion.map(d => createMessageHTML(d.nickname, d.message, user.nickname)).join('');
    const controlsHTML = createControls(user.role);

    return `
        <details>
            <summary>See Discussions</summary>
            <fieldset>
                <legend class="discussions">Discussions</legend>    
                <section class="messages-container hide-scrollbar">
                    ${messagesHTML}
                </section>
                <div class="send-msg-section">
                    <input name="message" class="send-message-input" placeholder="Send message" />
                    <button class="send-message-button" type="button">Send</button>
                    ${controlsHTML}
                </div>
            </fieldset>
        </details>
    `;
}

// Create message HTML
function createMessageHTML(nickname, message, currentUser) {
    const isCurrentUser = nickname === currentUser ? "you" : "";
    return `
        <div class="message-container ${isCurrentUser}">
            <h6 class="nickname">${isCurrentUser || nickname || 'Beginity'}</h6>
            <h4 class="message">${message}</h4>
        </div>
    `;
}

// Create controls based on user role
function createControls(role) {
    switch (role) {
        case 'Teacher':
        case 'Speaker':
            return `<button class="start-attendance" type="button">Start Attendance</button>`;
        case 'Student':
            return `
                <button class="punch-in" type="button">Punch In</button>
                <button class="punch-out" type="button">Punch Out</button>
            `;
        default:
            return '';
    }
}

// Handle attendance button click
function handleAttendance(event, classroomId, socketHelper) {
    event.preventDefault();
    const button = event.target;
    button.setAttribute('disabled', '');
    socketHelper?.startAttendance(classroomId, 5);
    setTimeout(() => button.removeAttribute('disabled'), 3000);
}

// Handle punch-in or punch-out
function handlePunch(event, classroomId, socketHelper) {
    event.preventDefault();
    const button = event.target;
    button.setAttribute('disabled', '');
    navigator.geolocation.getCurrentPosition((position) => {
        const location = { lat: position.coords.latitude, long: position.coords.longitude };
        socketHelper?.punchIn({ classroom_id: classroomId, location });
    });
    setTimeout(() => button.removeAttribute('disabled'), 3000);
}
