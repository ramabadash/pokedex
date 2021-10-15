"use strict"
//Global pokemon object
let PokemonObject = {
    name: "test",
    height: "", 
    weight: "",
    frontImgSrc: "",
    backImgSrc: "",
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

const typeList = document.getElementById("typeList");
typeList.addEventListener("change", getTypeUrl);

const typeListNames = document.getElementById("typeListNames");
typeListNames.addEventListener("change", reSearchPokemon);

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

/*---------- TYPE LISTS ----------*/
//Get an arry of string types, 
//create list elements and append them to the type list section
function createTypesList (typeList) {
    cleanTypesList();

    //Build option elements by typeList array
    const typeListElem = document.getElementById("typeList");
    for (const type of typeList) {
        const currentTypeElem = document.createElement("option");
        currentTypeElem.textContent = type;
        typeListElem.appendChild(currentTypeElem)
    }
}
//Delete all the elements in the types list
function cleanTypesList() {
    const typeElements = document.querySelectorAll("#typeList>OPTION");
    typeElements.forEach(typeElem => {
        if (typeElem.id !== "placeholderType") typeElem.remove();  
    });
}

/*---------- NAMES LISTS ----------*/
//Update the names by the type in the names list section
function getTypeUrl(event) {
    const typeListElem = document.getElementById("typeList");
    const type = typeListElem.value;
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
        const searchBar = document.getElementById("searchInput");
        //Sent GET request
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${searchInput}/`);
        const data = await response;
        const pokemonAns = data.data;

        updatePokemonObject(pokemonAns);//Update PokemonObject

        updatePokemonDom();//Update DOM

        searchBar.value = "";
    } catch (error) {
       const searchBar = document.getElementById("searchInput");
       searchBar.value = "";
       errorMessege("can't find your pokemon");
    }
}
//Get url and retuen an array of names thet also have the urls type
async function getType(url) {
    const response = await axios.get(url);
    const data = await response;
    const namesByTypeArr = [];
    for (let pokemon of data.data.pokemon) {
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