"use strict"
var PokemonObject = {
    name: "test",
    height: "", 
    weight: "",
    frontImgSrc: "",
    backImgSrc: "",
    typeList: [],
    namesRelatedToTypes: []
}
/* EVENT LISTENERS */
const searchBtn = document.getElementById("serch-btn");
searchBtn.addEventListener("click", searchPokemon);
const imgElem = document.getElementById("pokemonImg");
imgElem.addEventListener("mouseover", changeImgToBack);
imgElem.addEventListener("mouseleave", changeImgToFront);

/* IMAGE */
function changeImgToFront(event){
    const imgElem = document.getElementById("pokemonImg");
    imgElem.setAttribute("src", PokemonObject.frontImgSrc);
} 

function changeImgToBack(event){
    const imgElem = document.getElementById("pokemonImg");
    imgElem.setAttribute("src", PokemonObject.backImgSrc);
} 

/* DOM RELATED */
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
}

/* TYPE LISTS */
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

function cleanTypesList() {
    const typeElements = document.querySelectorAll("OPTION");
    typeElements.forEach(typeElem => typeElem.remove());
}

/* NETWORK */
async function searchPokemon(event) {
    try {
        const searchInput = document.getElementById("searchInput");
        const searchStr = searchInput.value;
        //Sent GET request
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${searchStr}/`);
        const data = await response;
        const pokemonAns = data.data;
        //Update PokemonObject
        PokemonObject.name = pokemonAns.name;
        PokemonObject.height = pokemonAns.height;
        PokemonObject.weight = pokemonAns.weight;
        PokemonObject.frontImgSrc = pokemonAns.sprites.front_default;
        PokemonObject.backImgSrc = pokemonAns.sprites.back_default;
        PokemonObject.typeList = [];

        for (let type of pokemonAns.types){
            PokemonObject.typeList.push(type.type.name);
        }

        updatePokemonDom();

        searchInput.value = "";
    } catch (error) {
       alert ("Can't your pokemon find, pleade try again");
       searchInput.value = "";
    }
}


