async function getAnimeData(anime){
    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${anime}&sfw`);
        if (!response.ok){
            console.log("hit");
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
    .catch(() => {
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
function addAnimeToHomeScreen(data){
    const main = document.getElementsByTagName("main")[0];

    let lastSearchedAnime = null;
    data.forEach((anime) => {
        console.log(anime);
        let name = anime.title;
        if (anime.title_english){
            name = anime.title_english;
        }
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
        animeContainer.append(animeBanner);
        main.append(animeContainer);

        lastSearchedAnime = animeContainer;
        
    });

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

function loadAnimePage(anime){
    const {title, title_english, images, synopsis, trailer, genres, episodes, status} = anime;

    let prevContainer = loadButtons();
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

function loadButtons(){
     const container = document.createElement("div");
     container.classList.add("buttons");

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

    const h2 = document.createElement("h2");
    h2.textContent = title;

    container.appendChild(h2);
    
    prevContainer.insertAdjacentElement("afterEnd", container);

    return container;
}
function loadImage(image, prevContainer){
    const container = document.createElement("div");
    container.classList.add("animeImage");

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

    const p = document.createElement("p");
    p.textContent = `Episodes : ${episodes}`;

    const p2 = document.createElement("p");
    p2.textContent = `Status : ${status}`;

    container.appendChild(p);
    container.appendChild(p2);

    prevContainer.insertAdjacentElement("afterEnd", container);

    return container;

}




