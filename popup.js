async function getAnimeData(anime){
    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${anime}&sfw`);
        if (!response.ok){
            throw new Error(`Error : ${response.status}`);
        }
        const allData = await response.json();
        return allData.data;
    } catch (error){
        console.log(`Error : ${error}`);
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
    removeSearchAnimes();
    getAnimeData(name.toLowerCase()).then((data) => {
        useData(data);
    });
}
function addAnimeToHomeScreen(data){
    console.log(data);
    data.forEach((anime) => {
        const name = anime.title;
        const image = anime.images.webp.image_url;
        console.log(image);
        const animeContainer = document.createElement("div");
        animeContainer.style.margin = 15+"px"
        animeContainer.classList.add("searchedAnime");
        const animeTitle = document.createElement("h3");
        animeTitle.textContent = name;
        const animeBanner = document.createElement("img");
        animeBanner.src = image;
        animeBanner.loading = "lazy";
        animeContainer.append(animeTitle);
        animeContainer.append(animeBanner);
        document.body.append(animeContainer);
    });
}
function removeSearchAnimes(){
    const searchedAnimes = document.querySelectorAll(".searchedAnime");
    if (searchedAnimes){
        searchedAnimes.forEach((anime) => {
            document.body.removeChild(anime);
        });
    }
}




