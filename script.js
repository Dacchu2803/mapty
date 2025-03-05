'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map;
let mapEvent;

if(navigator.geolocation)
navigator.geolocation.getCurrentPosition(function(position){
    const {longitude} = position.coords;
    const {latitude} = position.coords;
    const corrds = [latitude,longitude];
    map = L.map('map').setView(corrds, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // L.marker(corrds).addTo(map)
    // .bindPopup('A pretty CSS popup.<br> Easily customizable.')
    // .openPopup();
    
     map.on('click',function(event){
    form.classList.remove('hidden');
    mapEvent = event;
})
},  
function(){
    alert('Could not get the location!');
});


form.addEventListener('submit',function(e){
    e.preventDefault();
    const {lat,lng} = mapEvent.latlng;
        L.marker([lat,lng]).addTo(map)
        .bindPopup(
            L.popup({
                minWidth : 100,
                maxWidth : 250,
                autoClose : false,
                closeOnClick : false,
                className : 'running-popup'
            })
        ).setPopupContent('Running')
        .openPopup();
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
});

inputType.addEventListener('change',function(e){
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
});