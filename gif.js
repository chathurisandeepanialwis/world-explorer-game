$(document).ready(function() {
    var pageButtons = ["Egypt", "Japan", "Iceland", "New Zealand", "Bolivia", "United States"];
    var apiKey = "&api_key=spmJZeSndVCMYDdcytHjalTrFSqTQJ34";
    
    function makeButton() {
        $("#buttonHolder").empty();
        pageButtons.forEach(function(country) {
            var myButton = $("<button>").addClass("btn btn-info m-1 country-btn").text(country);
            myButton.attr("data-country", country).attr("data-offset", 0);
            $("#buttonHolder").append(myButton);
        });
    }
    
    $(document).on("click", ".country-btn", function() {
        var country = $(this).attr("data-country");
        var offset = $(this).attr("data-offset");
        var queryURL = "https://api.giphy.com/v1/gifs/search?q=" + country + "&limit=10&offset=" + offset + "&rating=G&lang=en" + apiKey;
        $(this).attr("data-offset", parseInt(offset) + 10);
        
        $.ajax({ url: queryURL, method: "GET" }).then(function(response) {
            response.data.forEach(function(gif) {
                var bothDiv = $("<div>").addClass("col-md-4 text-center imageP");
                var imgGif = $("<img>").attr({
                    src: gif.images.fixed_height_small_still.url,
                    "data-still": gif.images.fixed_height_small_still.url,
                    "data-moving": gif.images.fixed_height_small.url,
                    "data-state": "still",
                    alt: "country image",
                    class: "countryImage img-fluid"
                });
                bothDiv.append($("<p>").text(gif.title), imgGif, $("<p>").text("Rated: " + gif.rating));
                $("#images").prepend(bothDiv);
            });
        });
    });
    
    $(document).on("click", ".countryImage", function() {
        var state = $(this).attr("data-state");
        $(this).attr("src", $(this).attr(state === "still" ? "data-moving" : "data-still"))
            .attr("data-state", state === "still" ? "moving" : "still");
    });
    
    $("#add-country").on("click", function(event) {
        event.preventDefault();
        var country = $("#country-input").val().trim();
        if (country) {
            pageButtons.push(country);
            makeButton();
            $("#country-input").val("");
        }
    });
    
    makeButton();
});