const searchBox = document.getElementById("projectSearch");

if (searchBox) {
searchBox.addEventListener("input", () => {


    const query = searchBox.value.toLowerCase();

    document.querySelectorAll(".project-card").forEach(card => {

        const name =
            card.querySelector(".project-name")
                .textContent
                .toLowerCase();

        const description =
            card.querySelector("p")
                .textContent
                .toLowerCase();

        const visible =
            name.includes(query) ||
            description.includes(query);

        card.style.display = visible ? "" : "none";
    });
});


}
