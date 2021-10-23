"use strict"

/*---------- VARIABLES DECLATARION ----------*/
const baseUrl = "http://localhost:3000";
const searchArea = document.querySelector("#serach-div");

const searchBtnID = document.getElementById("search-id-btn");
const searchInputID = document.getElementById("searchInputId");
const searchBtnName = document.getElementById("search--name-btn");
const searchInputName = document.getElementById("searchInputName");

let searchValue;
const moveButtons = document.querySelectorAll(".move-btn");

const nameElem = document.getElementById("name");
const heightElem = document.getElementById("height");
const weightElem = document.getElementById("weight");
const imgElem = document.getElementById("pokemonImg");
const typeListElem = document.getElementById("typeList");
const abilityListElem = document.getElementById("abilitiesList");

const catchBtn = document.getElementById("catch");
const releaseBtn = document.getElementById("release");
const collectionBtn = document.getElementById("collection-btn");

/*---------- EVENT LISTENERS ----------*/
//Serach related event listeners
// searchBtnName.addEventListener("click", (event)=> {
//     searchValue = searchInput.value.toLowerCase();
//     searchPokemon(searchValue);
// });
// searchInputName.addEventListener("keyup", (event)=>{
//     if (event.key === "Enter") {
//         searchValue = searchInput.value.toLowerCase();
//         searchPokemon(searchValue);
//     };
// });
searchBtnID.addEventListener("click", (event)=> {
    searchPokemonByID(searchInputID.value);
});
searchInputID.addEventListener("keyup", (event)=>{
    if (event.key === "Enter") {
        searchPokemonByID(searchInputID.value);
    };
});
//Poke Img related event listeners
imgElem.addEventListener("mouseover", changeImgToBack);
imgElem.addEventListener("mouseleave", changeImgToFront);

//Search the next or previus pokemon on click
moveButtons.forEach((button) => button.addEventListener("click", movePokemon));

//catchBtn.addEventListener("click", catchPoke);
releaseBtn.addEventListener("click", releasePoke);
collectionBtn.addEventListener("click", showcollection);

/*---------- NETWORK ----------*/
//Show users collection 
async function showcollection() {
    try {
        const userName = document.getElementById("userName").value;
        playLoader();
        const response = await axios.get(`${baseUrl}/pokemon/`, {
            "headers" : {
                "username": userName,
            }
        })
        const collectionArray = await response.data;
        console.log(collectionArray);

        collectionToDom(collectionArray);

        stopLoader();
    } catch (error) {
        errorMessege(error);
        stopLoader();
    }
}


//Release poke from user collection
async function releasePoke() {
    try {
        const userName = document.getElementById("userName").value;
        playLoader();
        const response = await axios.delete(`${baseUrl}/pokemon/release/${PokemonObject.id}`, {
            "headers": {
                "username": userName,
            }
        });
        stopLoader();
    } catch(error) {
        errorMessege(error);
        stopLoader();
    }
}

//Serch pokemon by ID and update the PokemonObject with the data 
async function searchPokemonByID(searchId) {
    try {
        const userName = document.getElementById("userName").value;
        playLoader();
        //Send GET request
        const response = await axios.get(`${baseUrl}/pokemon/get/${searchId}/`, {
            "headers": {
                 "username": userName
                } 
        });
        const pokemonAns = await response.data;
        updatePokemonObject(pokemonAns);//Update PokemonObject

        updatePokemonDom();//Update DOM

        searchInputID.value = ""; //clean search input

        stopLoader();
    } catch (error) {
       searchInputID.value = ""; //clean search input
       console.log(error)
       errorMessege(error.status);
       stopLoader();
    }
}

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
    searchPokemonByID(nextPokeId);
}
//Display and hidde names list on click
function showNames(event) {
    if (event.target.tagName !== "BUTTON") return; //if click us on list item (name)
    const currentType = event.target;
    const namesList = currentType.firstElementChild;
    namesList.classList.toggle("show"); //display / hidde the names list
}

/*---------- POKE IMAGE ----------*/

//Changs the pokemon img to fron_defult on mouse leave
function changeImgToFront(event){
    imgElem.setAttribute("src", PokemonObject.front_pic);
} 

//Changs the pokemon img to back_defult on mouse over
function changeImgToBack(event){
    imgElem.setAttribute("src", PokemonObject.back_pic);
} 

/*---------- DOM RELATED ----------*/

//Build the pokimons div based on the PokemonObject
function updatePokemonDom(){
    nameElem.textContent = PokemonObject.name; //update name
    heightElem.textContent = PokemonObject.height; //update height
    weightElem.textContent = PokemonObject.weight; //update weight
    imgElem.setAttribute("src", PokemonObject.front_pic); //update img
    createTypesList (PokemonObject.types); //update TypesList
    createAbilitiesList(PokemonObject.abilities) //update Ability list
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

//Add collection to DOM
function collectionToDom(collectionArray) {
    //container element
    const currectCollection = document.createElement("div");
    currectCollection.classList.add("collection");
    
    //close button
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "close❌";
    closeBtn.addEventListener("click", ()=> document.querySelector(".collection").remove());
    currectCollection.appendChild(closeBtn);
    //Create list
    if (collectionArray.length === 0) {
        const emptyMessege = document.createElement("p");
        emptyMessege.textContent = "Youre collectioin is empty";
        currectCollection.appendChild(emptyMessege);
    } else {
        const pokeList = makePoleCOllection(collectionArray); //create collection representors
        currectCollection.appendChild(pokeList);     //append to dom
    }
    searchArea.appendChild(currectCollection);
}
//
function makePoleCOllection(collectionArray) {
    const pokeList = document.createElement("ul");
        pokeList.classList.add("poke-list")
        for (let poke of collectionArray) { 
            poke = JSON.parse(poke); //parse info
            const pokeElem = document.createElement("li"); //poke container
            const pokeName = document.createElement("span");
            pokeName.textContent = poke.name;
            const pokePic = document.createElement("img");
            pokePic.setAttribute("src", poke.front_pic);
            pokeElem.appendChild(pokeName);
            pokeElem.appendChild(pokePic);
            pokeList.appendChild(pokeElem);
        }
    return pokeList;
}

/*---------- ABILITY LISTS ----------*/

//Get an arry of string types, 
///create list elements and append them to the ability list section
function createAbilitiesList(abilityList) {
    cleanAbilitiesList();
    //Build ability elements by abilityList array
    for (const ability of abilityList) {
        const currentAbilityElem = document.createElement("span");
        currentAbilityElem.textContent = ability;
        currentAbilityElem.classList.add("ability"); 
        abilityListElem.appendChild(currentAbilityElem); //Add to DOM
    }
}
//Delete all the elements in the types list
function cleanAbilitiesList() {
    const abilityElements = document.querySelectorAll("#abilitiesList>span");
    abilityElements.forEach(abilityElem => abilityElem.remove());
}

/*---------- TYPE LISTS ----------*/

//Get an arry of string types, 
///create list elements and append them to the type list section
function createTypesList(typeList) {
    cleanTypesList();
    //Build type elements by typeList array
    for (const type of typeList) {
        const currentTypeElem = document.createElement("button");
        currentTypeElem.textContent = type;
        //classes - type for the background, current-type to know to wich type the names list belongs to
        currentTypeElem.classList.add("type", type, "current-type"); 
        currentTypeElem.addEventListener("click", showNames); //hidde and show names list
        typeListElem.appendChild(currentTypeElem); //Add to DOM

        //getTypeUrl(type); //sends the type name to find and build the names list
    }
}
//Delete all the elements in the types list
function cleanTypesList() {
    const typeElements = document.querySelectorAll("#typeList>button");
    typeElements.forEach(typeElem => typeElem.remove());
}

/*---------- NAMES LISTS ----------*/

//Get the currect URL from the poke object and sends to getType function 
//to find names list
function getTypeUrl(type) {
    const listIndex = PokemonObject.types.indexOf(type);
    const namesUrl = PokemonObject.namesRelatedToTypesUrls[listIndex];

    //getType(namesUrl);   
}
//Build name list from names arry to the DOM
function NameListToDOM(namesArr) {
    //Create the list element with the drop down class for design
    const currentNameList = document.createElement("ul");
    currentNameList.classList.add("dropDown");

    //Build li elements by name List array and append to ul element
    for (const name of namesArr) {
        const currentNameElem = document.createElement("li");
        currentNameElem.textContent = name;
        currentNameElem.addEventListener("click", reSearchPokemon); //search pokemon by name on click
        currentNameList.appendChild(currentNameElem);
    }
    //Find the current type that the names list belongs to and append the list
    const typeParantElem = document.querySelector(".current-type");
    typeParantElem.appendChild(currentNameList);
    typeParantElem.classList.remove("current-type"); //remove class - not current building type anymore
}
//Re-search pokemon by name list selestion
function reSearchPokemon(event) {
    const name = event.target.textContent;
    searchPokemon(name);
}

/*---------- POKEMON OBJECT ----------*/
//Global pokemon object
let PokemonObject = {
    id: "",
    name: "",
    height: "", 
    weight: "",
    front_pic: "./img/pokee.png",
    back_pic: "./img/pokee.png",
    types: [],
    namesRelatedToTypesUrls: [],
    abilities: []
}

//Update pokemon object by data object
function updatePokemonObject(pokemonData) {
    //Update details
    PokemonObject.id = pokemonData.id;
    PokemonObject.name = pokemonData.name;
    PokemonObject.height = pokemonData.height;
    PokemonObject.weight = pokemonData.weight;
    PokemonObject.front_pic = pokemonData.front_pic;
    PokemonObject.back_pic = pokemonData.back_pic;
    PokemonObject.types = [];
    PokemonObject.namesRelatedToTypesUrls = [];
    PokemonObject.abilities =[];

    //Update 2 arrays 1-types arry 2-types urls in the same order,
    //so we can connect type to url by index
    for (let type of pokemonData.types){
        PokemonObject.types.push(type);
        //PokemonObject.namesRelatedToTypesUrls.push(type.type.url);
    }
    //
    for (let ability of pokemonData.abilities){
        PokemonObject.abilities.push(ability);
        //PokemonObject.namesRelatedToTypesUrls.push(type.type.url);
    }
}
/*---------- ERROR HANDLERS ----------*/
function errorMessege(messege) {
    const errorElem = document.createElement("div");
    errorElem.textContent = `Sorry ${messege}, please try again! ❌`;
    errorElem.classList.add("error-messege");
    const searchArea = document.querySelector("#serach-div");
    searchArea.appendChild(errorElem);
    setTimeout(() => errorElem.remove() , 5000);
}

// //Serch pokemon by ID or Name and update the PokemonObject with the data 
// async function searchPokemon(searchValue) {
//     try {
//         playLoader();
//         //Send GET request
//         const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${searchValue}/`);
//         const data = await response;
//         const pokemonAns = data.data;

//         updatePokemonObject(pokemonAns);//Update PokemonObject

//         updatePokemonDom();//Update DOM

//         searchInput.value = ""; //clean search input

//         stopLoader();
//     } catch (error) {
//         searchInput.value = ""; //clean search input
//        errorMessege("can't find your pokemon");
//        stopLoader();
//     }
// }
//Get url, send a GET request to the poke API ,
//and return an array of names thet also have the type that the url belongs to
// async function getType(url) {
//     try {
//         const response = await fetch(url, {
//             method:"GET",
//             headers: {  
//                 Accept: "application/json",
//                 "Content-Type": "application/json" 
//             }
//         });
//         const data = await response.json();

//         //Build the names array
//         const namesByTypeArr = [];
//         for (let pokemon of data.pokemon) {
//             namesByTypeArr.push(pokemon.pokemon.name);
//         }
        
//         NameListToDOM(namesByTypeArr); //Build the names on the DOM
//     } catch (error) {
//         errorMessege("sorry something went wrong");
//     }
// }