"use strict"
/*---------- VARIABLES DECLATARION ----------*/
const searchArea = document.querySelector("#serach-div");
const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("searchInput");
let searchValue;
const moveButtons = document.querySelectorAll(".move-btn");

const nameElem = document.getElementById("name");
const heightElem = document.getElementById("height");
const weightElem = document.getElementById("weight");
const imgElem = document.getElementById("pokemonImg");
const typeListElem = document.getElementById("typeList");
const typeListNames = document.getElementById("typeListNames");

/*---------- EVENT LISTENERS ----------*/
//Serach related event listeners
searchBtn.addEventListener("click", (event)=> {
    searchValue = searchInput.value.toLowerCase();
    searchPokemon(searchValue);
});

searchInput.addEventListener("keyup", (event)=>{
    if (event.key === "Enter") {
        searchValue = searchInput.value.toLowerCase();
        searchPokemon(searchValue);
    };
});
//Poke Img related event listeners
imgElem.addEventListener("mouseover", changeImgToBack);
imgElem.addEventListener("mouseleave", changeImgToFront);
//re-Search Pokemon on name select
typeListNames.addEventListener("change", reSearchPokemon);
//Search the next or previus pokemon on click
moveButtons.forEach((button) => button.addEventListener("click", movePokemon));

/*---------- HANDLERS ----------*/
//Search the next or previus pokemon on click
function movePokemon(event) {
    const currentBtn = event.target;
    const currentPokemonId = PokemonObject.id;
    let nextPokeId;
    if(currentBtn.id === "next-btn") {
        //if(     empty page        ||       last pokemon       )
        if (currentPokemonId === "" || currentPokemonId === 898 ) nextPokeId = 1;
        else nextPokeId = currentPokemonId + 1;
    }
    if (currentBtn.id === "previous-btn") {
        //if(     empty page        ||       first pokemon    )
        if (currentPokemonId === "" || currentPokemonId === 1 ) nextPokeId = 898;
        else nextPokeId = currentPokemonId - 1;
    } 
    searchPokemon(nextPokeId);
}

/*---------- POKE IMAGE ----------*/

//Changs the pokemon img to fron_defult on mouse leave
function changeImgToFront(event){
    imgElem.setAttribute("src", PokemonObject.frontImgSrc);
} 

//Changs the pokemon img to back_defult on mouse over
function changeImgToBack(event){
    imgElem.setAttribute("src", PokemonObject.backImgSrc);
} 

/*---------- DOM RELATED ----------*/

//Build the pokimons div based on the PokemonObject
function updatePokemonDom(){
    nameElem.textContent = PokemonObject.name; //update name
    heightElem.textContent = PokemonObject.height; //update height
    weightElem.textContent = PokemonObject.weight; //update weight
    imgElem.setAttribute("src", PokemonObject.frontImgSrc); //update img
    createTypesList (PokemonObject.typeList); //update TypesList
    cleanNamesList();//update NamesList
}
//Play loader
function playLoader() {
    const loader = document.createElement("img");
    loader.setAttribute("src", "./img/pokee.png");
    loader.classList.add("loader");
    searchArea.appendChild(loader);  
}

//Stop loader
function stopLoader() {
    document.querySelector(".loader").remove();
}

/*---------- TYPE LISTS ----------*/

//Get an arry of string types, 
///create list elements and append them to the type list section
function createTypesList(typeList) {
    cleanTypesList();
    //Build type elements by typeList array
    for (const type of typeList) {
        const currentTypeElem = document.createElement("span");
        currentTypeElem.textContent = type;
        currentTypeElem.classList.add("type", type);
        currentTypeElem.addEventListener("click", getTypeUrl); 
        typeListElem.appendChild(currentTypeElem); //Add to DOM
    }
}
//Delete all the elements in the types list
function cleanTypesList() {
    const typeElements = document.querySelectorAll("#typeList>span");
    typeElements.forEach(typeElem => typeElem.remove());
}

/*---------- NAMES LISTS ----------*/

//Get the currect URL fropm the poke object and sends to getType function
function getTypeUrl(event) {
    const type = event.target.textContent;
    const listIndex = PokemonObject.typeList.indexOf(type);
    const namesUrl = PokemonObject.namesRelatedToTypesUrls[listIndex];

    getType(namesUrl);   
}
//Build name list from names arry to the DOM
function NameListToDOM(namesArr) {
    cleanNamesList();
    //Build option elements by typeList array
    for (const name of namesArr) {
        const currentNameElem = document.createElement("option");
        currentNameElem.textContent = name;
        typeListNames.appendChild(currentNameElem);
    }
}
//Delete all the elements in the names list
function cleanNamesList() {
    const typeListNames = document.querySelectorAll("#typeListNames>OPTION");
    typeListNames.forEach(nameElem => {
        if (nameElem.id !== "placeholderName") nameElem.remove(); 
    })
}
//Re-search pokemon by name list selestion
function reSearchPokemon(event) {
    const name = typeListNames.value;
    searchPokemon(name);
}

/*---------- POKEMON OBJECT ----------*/
//Global pokemon object
let PokemonObject = {
    id: "",
    name: "",
    height: "", 
    weight: "",
    frontImgSrc: "./img/pokee.png",
    backImgSrc: "./img/pokee.png",
    typeList: [],
    namesRelatedToTypesUrls: []
}

//Update pokemon object by data object
function updatePokemonObject(pokemonData) {
    //Update details
    PokemonObject.id = pokemonData.id;
    PokemonObject.name = pokemonData.name;
    PokemonObject.height = pokemonData.height;
    PokemonObject.weight = pokemonData.weight;
    PokemonObject.frontImgSrc = pokemonData.sprites.front_default;
    PokemonObject.backImgSrc = pokemonData.sprites.back_default;
    PokemonObject.typeList = [];
    PokemonObject.namesRelatedToTypesUrls = [];

    //Update 2 arrays 1-types arry 2-types urls in the same order,
    //so we can connect type to url by index
    for (let type of pokemonData.types){
        PokemonObject.typeList.push(type.type.name);
        PokemonObject.namesRelatedToTypesUrls.push(type.type.url);
    }
}

/*---------- NETWORK ----------*/

//Serch pokemon by ID or Name and update the PokemonObject with the data 
async function searchPokemon(searchValue) {
    try {
        playLoader();
        //Sent GET request
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${searchValue}/`);
        const data = await response;
        const pokemonAns = data.data;

        updatePokemonObject(pokemonAns);//Update PokemonObject

        updatePokemonDom();//Update DOM

        searchInput.value = ""; //clean search input

        stopLoader();
    } catch (error) {
        searchInput.value = ""; //clean search input
       errorMessege("can't find your pokemon");
       stopLoader();
    }
}
//Get url, send a GET request to the poke API ,
//and return an array of names thet also have the type that the url belongs to
async function getType(url) {
    try {
        const response = await fetch(url, {
            method:"GET",
            headers: {  
                Accept: "application/json",
                "Content-Type": "application/json" 
            }
        });
        const data = await response.json();
        
        //Build the names array
        const namesByTypeArr = [];
        for (let pokemon of data.pokemon) {
            namesByTypeArr.push(pokemon.pokemon.name);
        }
        
        NameListToDOM(namesByTypeArr); //Build the names on the DOM
    } catch (error) {
        errorMessege("sorry something went wrong");
    }
}
/*---------- ERROR HANDLERS ----------*/
function errorMessege(messege) {
    const errorElem = document.createElement("div");
    errorElem.textContent = `Sorry ${messege}, please try again! ❌`;
    errorElem.classList.add("error-messege");
    const searchArea = document.querySelector("#serach-div");
    searchArea.appendChild(errorElem);
    setTimeout(() => errorElem.remove() , 3000);
}