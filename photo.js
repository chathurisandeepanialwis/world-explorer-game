
// Day/Night Theme Function
const dayNightTheme = () => {
  let date = new Date();
  let hour = date.getHours();
  
  if(hour >= 7 && hour < 19){
    document.body.style.backgroundColor = 'white';
    document.body.style.color = 'black';
  } else {
    document.body.style.backgroundColor = 'black';
    document.body.style.color = 'white';
  }
};

window.addEventListener('load', dayNightTheme);

// Search Event Listeners
document.querySelector("#input").addEventListener("keydown", (event) => {
  if (event.key == "Enter")
    apiRequest();
});

document.querySelector("#search").addEventListener("click", () => {
  apiRequest();
});

// API Request Function
const apiRequest = () => {
  document.querySelector("#grid").textContent = "";
  const url = 'https://api.unsplash.com/search/photos?query='+input.value+'&per_page=30&client_id=SouHY7Uul-OxoMl3LL3c0NkxUtjIrKwf3tsGk1JaiVo';
  
  fetch(url)
  .then(response => {
    if (!response.ok) throw Error(response.statusText);
    return response.json();
  })
  .then(data => {
    loadImages(data);
  })
  .catch(error => console.log(error));
};

// Load Images Function
const loadImages = (data) => {
  for(let i = 0; i < data.results.length; i++){
    let colDiv = document.createElement("div");
    colDiv.className = "col-md-4 col-sm-6";
    
    let image = document.createElement("div");
    image.className = "img-container";
    image.style.backgroundImage = "url("+data.results[i].urls.raw + "&w=600&h=400" +")";
    
    image.addEventListener("dblclick", function(){
      window.open(data.results[i].links.download, '_blank');
    });
    
    colDiv.appendChild(image);
    document.querySelector("#grid").appendChild(colDiv);
  }
};
