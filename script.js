'use strict';

// prettier-ignore




let map;
let mapEvent;

class Workout{

    date = new Date();
    id = (Date.now()+'').slice(-10);
    constructor(distance,duration,coords){
        this.distance = distance;
        this.duration = duration;
        this.coords = coords;
    }

    _setDescription(){
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }


}

class Running extends Workout{
    type = 'running';
    constructor(distance,duration,coords,cadence){
        super(distance,duration,coords);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
    }

    calcPace (){
        //min/km
        this.pace = this.duration/this.distance;
        return this.pace;
    }
}

class Cycling extends Workout{
    type = 'cycling';
    constructor (distance,duration,coords,elev){
        super(distance,duration,coords);
        this.elev = elev;
        this.calcSpeed();
        this._setDescription();
    }

    calcSpeed(){
        //km/hr
        this.speed = this.distance/(this.duration/60);
        return this.speed;
    }
}

////////////////////////////////////////
// APPLICATION ARCHITECTURE
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App{
    #map;
    #mapEvent;
    #workouts=[];
    

    constructor(){
        this._getPosition();
        form.addEventListener('submit',this._newWorkOut.bind(this));
        inputType.addEventListener('change',this._toggleElevationField);
    }

    _getPosition(){
        if(navigator.geolocation)
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),  function(){
                alert('Could not get the location!');
            });
    }

    _loadMap(position){
        const {longitude} = position.coords;
        const {latitude} = position.coords;
        const corrds = [latitude,longitude];
        this.#map = L.map('map').setView(corrds, 13);
            
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        this.#map.on('click',this._showForm.bind(this));
    }

    _showForm(mapE){
            this.#mapEvent = mapE;
            form.classList.remove('hidden');
            inputDistance.focus();
    }

    _hideForm(){
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';

        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(()=>{
            form.style.display='grid'
        },1000);
    }

    _toggleElevationField(){
            inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
            inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkOut(e){

        const validInputs = (...inputs)=>inputs.every(inp => inp>0);

        const allPositive = (...inputs)=>inputs.every(inp=>Number);

            e.preventDefault();
            const type = inputType.value;
            const distance = +inputDistance.value;
            const duration = +inputDuration.value;
            const {lat,lng} = this.#mapEvent.latlng;
            let workOut;

            if(type === 'running'){
                const cadence = +inputCadence.value;
                if(!validInputs(distance,duration,cadence)||!allPositive(distance,duration)) return alert('Inputs have to be positive number');
                workOut = new Running(distance,duration,[lat,lng],cadence);
            }

            if(type==='cycling'){
                const elevation = +inputElevation.value;
                if(!validInputs(distance,duration,elevation)||!allPositive(distance,duration)) return alert('Inputs have to be positive number');
                workOut = new Cycling(distance,duration,[lat,lng],elevation);
            }

           this.#workouts.push(workOut);
           console.log(workOut);

           this._renderWorkoutMaker(workOut);

            this._renderWorkout(workOut);

            this._hideForm();
               
            

    }

    
    _renderWorkoutMaker(workOut){
        L.marker(workOut.coords).addTo(this.#map)
        .bindPopup(
            L.popup({
                minWidth : 100,
                maxWidth : 250,
                autoClose : false,
                closeOnClick : false,
                className : `${workOut.type}-popup`
            })
        ).setPopupContent(`${workOut.type === 'running'?'🏃‍♂️':'🚴‍♀️'} ${workOut.description}`)
        .openPopup();
    }

    _renderWorkout(workOut){
        let html = `<li class="workout workout--${workOut.type}" data-id="${workOut.id}">
          <h2 class="workout__title">${workOut.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workOut.type === 'running'?'🏃‍♂️':'🚴‍♀️'}</span>
            <span class="workout__value">${workOut.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workOut.duration}</span>
            <span class="workout__unit">min</span>
          </div>`;

          if(workOut.type==='running')
            html+=`<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workOut.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workOut.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;

        if(workOut.type==='cycling')
            html+=`<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workOut.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workOut.elev}</span>
            <span class="workout__unit">m</span>
          </div>
          </li>`;

          form.insertAdjacentHTML('afterend', html);
    }



}

const app = new App();



