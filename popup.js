async function getAnimeData(anime){
    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${anime}&sfw`);
        if (!response.ok){
            const error = new Error(`Error : ${response.status}`);
            error.status = response.status;
            throw error;
        }
        const allData = await response.json();
        return allData.data;
    } catch (error){
        console.log(`Error : ${error.status}`);
    }
    
}

function searchAnime(name, useData){
    
    removeSearchedAnimes();

    const searchTextHeader = document.getElementById("searchTextHeader");
    searchTextHeader.style.display = "none";

    const spinner = document.getElementsByClassName("spinner")[0];
    spinner.classList.add("loading");

    const errorContainer = document.getElementsByClassName("error")[0];
    errorContainer.style.display = "none";

    getAnimeData(name.toLowerCase()).then((data) => {
        if (data.length){
            console.log(data);
            useData(data);
        } else {
            showErrorMsg("Anime Not Found");
        }
        
    })
    .catch((error) => {
        showErrorMsg("An Unkown Error Occured");
        console.log(error);
    });         
}
function showErrorMsg(message){
    const errorContainer = document.getElementsByClassName("error")[0];
    const errorMsg = document.getElementById("errorMsg");
    const spinner = document.getElementsByClassName("spinner")[0];
    spinner.classList.remove("loading");
    errorMsg.textContent = message;
    errorContainer.style.display = "block";

}
async function addAnimeToScreen(data){
    const main = document.getElementsByTagName("main")[0];

    let lastSearchedAnime = null;
    try{
        await Promise.all(data.map(async (anime) => {
            lastSearchedAnime = await loadSearchedAnime(anime, main);
        }));
    }catch (error){
        console.log(error);
    }

    lastSearchedAnime.style.marginBottom = 100+"px";

    const spinner = document.getElementsByClassName("spinner")[0];
    spinner.classList.remove("loading");
    
}
async function loadSearchedAnime(anime, main, yourAnimes){
    let name = anime.title_english || anime.title;
    const image = anime.images.webp.image_url;

    const animeContainer = document.createElement("div");
    animeContainer.classList.add("searchedAnime");
    animeContainer.classList.add("fadein");
    animeContainer.addEventListener("click", (event) => {
        clearDOM();
        loadAnimeElements(anime);
    });

    const animeTitle = document.createElement("h3");
    animeTitle.textContent = name;

    const animeBanner = document.createElement("img");
    animeBanner.src = image;
    animeBanner.loading = "lazy";

    animeContainer.append(animeTitle);

    //if 'yourAnimes' is true, this means that the anime is know already to be in user's data
    //if false, this means that we aren't sure if the anime is in user's data so we should probably check
    if (!yourAnimes){
        await checkForAnime(anime.mal_id).then((value) => {
            if (value){
                const animeSaved = document.createElement("h4");
                animeSaved.textContent = "In \"Your Animes\"";
                animeSaved.classList.add("savedAnime");
                animeContainer.append(animeSaved);
            }
        }).catch((error) => {
            console.log(error);
        });
    }

    animeContainer.append(animeBanner);

    main.append(animeContainer);

    return animeContainer;
}

function removeSearchedAnimes(){
    const main = document.getElementsByTagName("main")[0];
    const searchedAnimes = document.querySelectorAll(".searchedAnime");
    if (searchedAnimes){
        searchedAnimes.forEach((anime) => {
            main.removeChild(anime);
        });
    }

}

function clearDOM(){
    //clear DOM but the footer
    const footer = document.getElementsByTagName("footer")[0];

    document.body.textContent = "";

    const main = document.createElement("main");
    document.body.appendChild(main);
    document.body.appendChild(footer);
}

//Anime Page load Functions ===============================================

function loadAnimeElements(anime){
    const {title, title_english, images, synopsis, trailer, genres, episodes, status} = anime;

    let prevContainer = loadButtons(anime);
    title_english ? prevContainer = loadTitle(title_english, prevContainer) : prevContainer = loadTitle(title, prevContainer);
    prevContainer = loadImage(images, prevContainer);
    prevContainer = loadDetails(synopsis, prevContainer);
    prevContainer = loadGenres(genres, prevContainer);
    if (trailer.embed_url){
        prevContainer = loadTrailer(trailer.embed_url, prevContainer);
    }
    prevContainer = loadEpisodes(episodes, status, prevContainer);
    prevContainer.style.marginBottom = 100+"px";
}

function loadButtons(animeObj){
     const container = document.createElement("div");
     container.classList.add("buttons");
     container.classList.add("fadein");

     const backBtn = document.createElement("button");
     backBtn.id = "backBtn";

     const backBtnImage = document.createElement("img");
     backBtnImage.src = "arrow-left-solid.svg";
     backBtnImage.alt = "Back Arrow";

     backBtn.appendChild(backBtnImage);

     const addAnimeBtn = document.createElement("button");
     addAnimeBtn.id = "addAnimeBtn";
     addAnimeBtn.textContent = "Add";

     backBtn.addEventListener("click", () => {

        location.reload();

     });
     addAnimeBtn.addEventListener("click", () => {

        //save to local browser storage using Chrome Storage API
        console.log(`mal id : ${animeObj.mal_id}`)
        saveAnime(animeObj.mal_id,{
            "title" : animeObj.title,
            "title_english" : animeObj.title_english,
            "images" : animeObj.images,
            "status" : animeObj.status,
            "episodes" : animeObj.episodes
        }).then(() => {

        }).catch((error) => {
            console.log(error);
        }); 
     });

     container.appendChild(backBtn);
     container.appendChild(addAnimeBtn);

     const main = document.getElementsByTagName("main")[0];
     main.prepend(container);

     return container;
}

function loadTitle(title, prevContainer){
    const container = document.createElement("div");
    container.classList.add("animeName");
    container.classList.add("fadein");

    const h2 = document.createElement("h2");
    h2.textContent = title;

    container.appendChild(h2);
    
    prevContainer.insertAdjacentElement("afterEnd", container);

    return container;
}
function loadImage(image, prevContainer){
    const container = document.createElement("div");
    container.classList.add("animeImage");
    container.classList.add("fadein");

    const img = document.createElement("img");
    img.src = image.webp.image_url;
    img.loading = "lazy";

    container.appendChild(img);

    prevContainer.insertAdjacentElement("afterEnd",container);

    return container;
}
function loadDetails(synopsis, prevContainer){
    const container = document.createElement("div");
    container.classList.add("animeContent");
    container.classList.add("fadein");

    const h3 = document.createElement("h3");
    h3.textContent = "Summary";

    const p = document.createElement("p");
    p.textContent = synopsis;

    container.appendChild(h3);
    container.appendChild(p);

    prevContainer.insertAdjacentElement("afterEnd", container);

    return container;
}

function loadGenres(genres, prevContainer){
    const container = document.createElement("div");
    container.classList.add("animeContent");
    container.classList.add("fadein");

    const h3 = document.createElement("h3");
    h3.textContent = "Genres";

    const ul = document.createElement("ul");

    genres.forEach((genre) => {
        const li = document.createElement("li");
        li.textContent = genre.name;
        console.log(genre.name);
        ul.appendChild(li);
    });

    container.appendChild(h3);
    container.appendChild(ul);

    prevContainer.insertAdjacentElement("afterEnd",container);

    return container;
}

function loadTrailer(url, prevContainer){
    const container = document.createElement("div");
    container.classList.add("animeContent");
    container.classList.add("fadein");

    //turn url autoplay off
    url = url.slice(0, url.length - 1) + "0";

    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.id = "trailerVideo";
    iframe.width = "100%";
    iframe.style.borderColor = "transparent";

    container.appendChild(iframe);

    prevContainer.insertAdjacentElement("afterEnd", container);

    return container;

}

function loadEpisodes(episodes, status, prevContainer){
    const container = document.createElement("div");
    container.classList.add("animeContent");
    container.classList.add("fadein");

    const p = document.createElement("p");
    p.textContent = `Episodes : ${episodes}`;

    const p2 = document.createElement("p");
    p2.textContent = `Status : ${status}`;

    container.appendChild(p);
    container.appendChild(p2);

    prevContainer.insertAdjacentElement("afterEnd", container);

    return container;

}

//END OF Anime Page load Functions ========================================

// AniTrace Search Screen

document.getElementById("homeRowSearchBtn").addEventListener("click", (event) => {
    event.target.classList.add("active");

    const yourAnimesBtn = document.getElementById("yourAnimesBtn");
    yourAnimesBtn.classList.remove("active");

    clearDOM();
    loadSearchElements();
})

function loadSearchElements(){
    const main = document.getElementsByTagName("main")[0];

    const mainHeader = document.createElement("h2");
    mainHeader.id = "header";
    mainHeader.classList.add("fadein");
    mainHeader.textContent = "AniTrace";

    main.appendChild(mainHeader);

    const searchContainer = document.createElement("div");
    searchContainer.classList.add("search");
    searchContainer.classList.add("fadein");
    
    const searchBtn = document.createElement("button");
    searchBtn.id = "searchBtn";

    searchBtn.addEventListener("click", () => {
        searchAnime(document.getElementById("searchBar").value, addAnimeToScreen);
    });

    const img = document.createElement("img");
    img.src = "magnifying-glass-solid.svg";
    img.style.width = 22+"px";

    searchBtn.appendChild(img);

    searchContainer.appendChild(searchBtn);

    const textbox = document.createElement("input");
    textbox.type = "text";
    textbox.id = "searchBar";
    textbox.autocomplete = "off";

    textbox.addEventListener("keydown",(event) => {
        if (event.key === "Enter"){
            searchAnime(textbox.value, addAnimeToScreen);
        }
    });

    searchContainer.appendChild(textbox);

    main.appendChild(searchContainer);

    const searchTextHeader = document.createElement("div");
    searchTextHeader.classList.add("fadein");
    searchTextHeader.style.display = "flex";
    searchTextHeader.style.justifyContent = "center";
    searchTextHeader.style.alignItems = "center";
    searchTextHeader.id = "searchTextHeader";

    const h2 = document.createElement("h2");
    h2.style.fontSize = 30+"px";
    h2.style.textAlign = "center";
    h2.textContent = "Search for Your Favorite Animes!";

    searchTextHeader.appendChild(h2);
    
    main.appendChild(searchTextHeader);

    const spinner = document.createElement("div");
    spinner.classList.add("spinner");

    main.appendChild(spinner);

    const error = document.createElement("div");
    error.classList.add("error");

    const h3 = document.createElement("h3");
    h3.id = "errorMsg";

    error.appendChild(h3);

    main.appendChild(error);

}


//Chrome Storage API functions ============================================

function saveAnime(malId, value){
    const anime = {
        [malId] : value
    }
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set(anime, () => {
            if (chrome.runtime.lastError){
                reject(chrome.runtime.Error);
            } else {
                resolve();
            }
        });
    });
    
}

function removeAnime(malId){
    return new Promise((resolve, reject) => {
        chrome.storage.sync.remove([malId], () => {
            if (chrome.runtime.lastError){
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}

function getAllSavedAnime(){
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(null, (result) => {
            if (chrome.runtime.lastError){
                reject(chrome.runtime.lastError);
            } else {
                return resolve(result);
            }
        });
    });
}
function getSavedAnime(malId){
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(null, (result) => {
            if (chrome.runtime.lastError){
                reject(chrome.runtime.lastError);
            } else {
                return resolve(result[malId]);
            }
        });
    });
}

async function checkForAnime(malId){
    const result = await getSavedAnime(malId);
    if (result){
        return true;
    } else {
        return false;
    }
}

//END OF Chrome Storage API functions =====================================


//onload

async function loadUserAnimes(){
    const result = await getAllSavedAnime();
    if (!result){
        return
    }
    let prevAnime = null;

    const main = document.getElementsByTagName("main")[0];
    try{
        await Promise.all(Object.keys(result).map(async (anime) => {
            animeContainer = await loadSearchedAnime(result[anime], main, true);
            userAnimes[(result[anime].title_english || result[anime].title)] = animeContainer;
            prevAnime = animeContainer;
            console.log(userAnimes);
        }));
    } catch (error){
        console.log(error);
    }
    

    prevAnime.style.marginBottom = 100+"px";
}

let userAnimes = {};

loadUserAnimes();

document.getElementById("searchUserAnimeBar").addEventListener("keyup", (event) => {
    const text = new RegExp(`^${event.target.value}`)
    Object.keys(userAnimes).forEach((animeName) => {
        if (animeName.match(text)){
            userAnimes[animeName].style.display = "flex";
        } else {
            userAnimes[animeName].style.display = "none";
        }
        
    });
})




