const searchBox = document.getElementById("projectSearch");

if (searchBox) {
    searchBox.addEventListener("input", () => {

        const query = searchBox.value.toLowerCase().trim();

        document.querySelectorAll(".project-card").forEach(card => {

            const nameEl = card.querySelector(".project-name");
            const descEl = card.querySelector("p");

            const name = nameEl ? nameEl.textContent.toLowerCase() : "";
            const description = descEl ? descEl.textContent.toLowerCase() : "";

            const visible =
                name.includes(query) ||
                description.includes(query);

            card.style.display = visible ? "block" : "none";
        });

    });
}