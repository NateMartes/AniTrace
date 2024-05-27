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

const searchBar = document.getElementById("searchBar");
searchBar.addEventListener("keydown",(event) => {
    if (event.key === "Enter"){
        searchAnime(searchBar.value, addAnimeToHomeScreen);
    }
});

const button = document.getElementById("searchBtn");
button.addEventListener("click", () => {
    searchAnime(searchBar.value, addAnimeToHomeScreen);
});

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
async function addAnimeToHomeScreen(data){
    const main = document.getElementsByTagName("main")[0];

    let lastSearchedAnime = null;
    try{
        await Promise.all(data.map(async (anime) => {
            console.log(anime);
            let name = anime.title_english || anime.title;
            const image = anime.images.webp.image_url;

            const animeContainer = document.createElement("div");
            animeContainer.classList.add("searchedAnime");
            animeContainer.addEventListener("click", (event) => {
                clearDOM();
                loadAnimePage(anime);
            });

            const animeTitle = document.createElement("h3");
            animeTitle.textContent = name;

            const animeBanner = document.createElement("img");
            animeBanner.src = image;
            animeBanner.loading = "lazy";

            animeContainer.append(animeTitle);

            //check if anime is already saved
            await checkForAnime(anime.mal_id).then((value) => {
                if (value){
                    const animeSaved = document.createElement("h4");
                    animeSaved.textContent = "Anime in \"Your Animes\"";
                    animeSaved.classList.add("savedAnime");
                    animeContainer.append(animeSaved);
                }
            }).catch((error) => {
                console.log(error);
            });

            animeContainer.append(animeBanner);

            main.append(animeContainer);

            lastSearchedAnime = animeContainer;
        }));
    }catch (error){
        console.log(error);
    }

    lastSearchedAnime.style.marginBottom = 100+"px";

    const spinner = document.getElementsByClassName("spinner")[0];
    spinner.classList.remove("loading");
    
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

function loadAnimePage(anime){
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
        //Note : Ensure 'malId' is a string and not a number
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




