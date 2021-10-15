"use strict"
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
/* EVENT LISTENERS */
const searchBtn = document.getElementById("search-btn");
searchBtn.addEventListener("click", (event)=> {
    const searchInput = document.getElementById("searchInput");
    const searchValue = searchInput.value;
    searchPokemon(searchValue);
});

const imgElem = document.getElementById("pokemonImg");
imgElem.addEventListener("mouseover", changeImgToBack);
imgElem.addEventListener("mouseleave", changeImgToFront);

const typeListNames = document.getElementById("typeListNames");
typeListNames.addEventListener("change", reSearchPokemon);

const moveButtons = document.querySelectorAll(".move-btn");
moveButtons.forEach((button) => button.addEventListener("click", movePokemon));


/* HANDLERS */
//Search the next or previus pokemon on click
function movePokemon(event) {
    const currentBtn = event.target;
    const currentPokemonId = PokemonObject.id;
    let nextPokeId;
    if(currentBtn.id === "next-btn") {
        if (currentPokemonId === "" || currentPokemonId === 898 ) nextPokeId = 1;
        else nextPokeId = currentPokemonId + 1;
    }
    if (currentBtn.id === "previous-btn") {
        if (currentPokemonId === "" || currentPokemonId === 1 ) nextPokeId = 898;
        else nextPokeId = currentPokemonId - 1;
    } 
    searchPokemon(nextPokeId);
}
/* IMAGE */
//Changs the pokemon img on mouse leave
function changeImgToFront(event){
    const imgElem = document.getElementById("pokemonImg");
    imgElem.setAttribute("src", PokemonObject.frontImgSrc);
} 
//Changs the pokemon img on mouse over
function changeImgToBack(event){
    const imgElem = document.getElementById("pokemonImg");
    imgElem.setAttribute("src", PokemonObject.backImgSrc);
} 

/*---------- DOM RELATED ----------*/
//Build the pokimons div based on the PokemonObject
function updatePokemonDom(){
    const nameElem = document.getElementById("name");
    const heightElem = document.getElementById("height");
    const weightElem = document.getElementById("weight");
    const imgElem = document.getElementById("pokemonImg");

    nameElem.textContent = PokemonObject.name;
    heightElem.textContent = PokemonObject.height;
    weightElem.textContent = PokemonObject.weight;
    imgElem.setAttribute("src", PokemonObject.frontImgSrc);
    createTypesList (PokemonObject.typeList);
    cleanNamesList();
}
//Play loader
function playLoader() {
    const loader = document.createElement("img");
    loader.setAttribute("src", "./img/pokee.png");
    loader.classList.add("loader");
    const searchArea = document.querySelector("#serach-div");
    searchArea.appendChild(loader);  
}

//Stop loader
function stopLoader() {
    document.querySelector(".loader").remove();
}

/*---------- TYPE LISTS ----------*/
//Get an arry of string types, 
//create list elements and append them to the type list section
function createTypesList(typeList) {
    cleanTypesList();

    //Build option elements by typeList array
    const typeListElem = document.getElementById("typeList");
    for (const type of typeList) {
        const currentTypeElem = document.createElement("span");
        currentTypeElem.textContent = type;
        currentTypeElem.classList.add("type");
        currentTypeElem.addEventListener("click", getTypeUrl)
        typeListElem.appendChild(currentTypeElem)
    }
}
//Delete all the elements in the types list
function cleanTypesList() {
    const typeElements = document.querySelectorAll("#typeList>span");
    typeElements.forEach(typeElem => typeElem.remove());
}
/*---------- NAMES LISTS ----------*/
//Update the names by the type in the names list section
function getTypeUrl(event) {
    const type = event.target.textContent;
    const listIndex = PokemonObject.typeList.indexOf(type);
    const namesUrl = PokemonObject.namesRelatedToTypesUrls[listIndex];
    getType(namesUrl);   
}
//Build name list from names arry
function NameListToDOM(namesArr) {
    cleanNamesList();
    //Build option elements by typeList array
    const typeListNames = document.getElementById("typeListNames");
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
    const typeListNames = document.getElementById("typeListNames");
    const name = typeListNames.value;
    searchPokemon(name);
}

/*---------- POKEMON OBJECT ----------*/
//Update pokemon object
function updatePokemonObject(pokemonData) {
    PokemonObject.id = pokemonData.id;
    PokemonObject.name = pokemonData.name;
    PokemonObject.height = pokemonData.height;
    PokemonObject.weight = pokemonData.weight;
    PokemonObject.frontImgSrc = pokemonData.sprites.front_default;
    PokemonObject.backImgSrc = pokemonData.sprites.back_default;
    PokemonObject.typeList = [];
    PokemonObject.namesRelatedToTypesUrls = [];

    for (let type of pokemonData.types){
        PokemonObject.typeList.push(type.type.name);
        PokemonObject.namesRelatedToTypesUrls.push(type.type.url);
    }
}

/*---------- NETWORK ----------*/
//Serch pokemon by ID or Name and update the PokemonObject with the data 
async function searchPokemon(searchInput) {
    try {
        playLoader();
        const searchBar = document.getElementById("searchInput");
        //Sent GET request
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${searchInput}/`);
        const data = await response;
        const pokemonAns = data.data;

        updatePokemonObject(pokemonAns);//Update PokemonObject

        updatePokemonDom();//Update DOM

        searchBar.value = "";

        stopLoader();
    } catch (error) {
       const searchBar = document.getElementById("searchInput");
       searchBar.value = "";
       errorMessege("can't find your pokemon");
       stopLoader();
    }
}
//Get url and retuen an array of names thet also have the urls type
async function getType(url) {
    const response = await fetch(url, {
        method:"GET",
        headers: {  
            Accept: "application/json",
            "Content-Type": "application/json" 
        }
    });
    const data = await response.json();
    const namesByTypeArr = [];
    for (let pokemon of data.pokemon) {
        namesByTypeArr.push(pokemon.pokemon.name);
    }
    NameListToDOM(namesByTypeArr);
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