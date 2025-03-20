'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];



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



}

class Running extends Workout{
    type = 'running';
    constructor(distance,duration,coords,cadence){
        super(distance,duration,coords);
        this.cadence = cadence;
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

           this.renderWorkoutMaker(workOut);
               
            inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';

    }

    
    renderWorkoutMaker(workOut){
        L.marker(workOut.coords).addTo(this.#map)
        .bindPopup(
            L.popup({
                minWidth : 100,
                maxWidth : 250,
                autoClose : false,
                closeOnClick : false,
                className : `${workOut.type}-popup`
            })
        ).setPopupContent(workOut.type)
        .openPopup();
    }
}

const app = new App();



