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
    const errorContainer = document.getElementsByClassName("error")[0];
    errorContainer.style.display = "none";
    const spinner = document.getElementsByClassName("spinner")[0];
    spinner.classList.add("loading");
    getAnimeData(name.toLowerCase()).then((data) => {
        if (data.length){
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
    data.forEach((anime) => {
        const name = anime.title;
        const image = anime.images.webp.image_url;

        const animeContainer = document.createElement("div");
        animeContainer.classList.add("searchedAnime");
        animeContainer.addEventListener("click", (event) => {
            console.error(anime.mal_id);
        });

        const animeTitle = document.createElement("h3");
        animeTitle.textContent = name;

        const animeBanner = document.createElement("img");
        animeBanner.src = image;
        animeBanner.loading = "lazy";

        animeContainer.append(animeTitle);
        animeContainer.append(animeBanner);
        main.append(animeContainer);
        
    });
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



