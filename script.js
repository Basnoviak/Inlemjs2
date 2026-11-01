
const API_URL = "https://dummyjson.com";

const postsContainer = document.querySelector("#postsContainer");
const searchInput = document.querySelector("#searchInput");
const tagFilter = document.querySelector("#tagFilter");
const sortSelect = document.querySelector("#sortSelect");
const statusMessage = document.querySelector("#statusMessage");
const errorMessage = document.querySelector("#errorMessage");

let posts = [];

// hämta alla inlägg/GET
async function fetchPosts() {
    statusMessage.textContent = "Hämtar inlägg...";
    errorMessage.hidden = true;

    try {
        const response = await fetch(`${API_URL}/posts?limit=30`);

        if (!response.ok) {
            throw new Error("Kunde inte hämta inläggen.");
        }

        const data = await response.json();

        posts = data.posts;

        populateTagFilter();
        filterAndSortPosts();

        statusMessage.textContent =
            `${posts.length} inlägg har hämtats.`;

    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.hidden = false;
        statusMessage.textContent = "";
    }
}

// funktion för taggfilter
function populateTagFilter() {
    const allTags = [...new Set(posts.flatMap(post => post.tags))];

    tagFilter.replaceChildren();

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Alla taggar";
    tagFilter.appendChild(defaultOption);

    allTags.sort().forEach(tag => {
        const option = document.createElement("option");
        option.value = tag;
        option.textContent = tag;
        tagFilter.appendChild(option);
    });
}

// funktion för sökning, filtrering och sortering av inlägg
function filterAndSortPosts() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedTag = tagFilter.value;
    const sortBy = sortSelect.value;

    let filteredPosts = posts.filter(post => {
        const matchesSearch =
            post.title.toLowerCase().includes(searchTerm) ||
            post.body.toLowerCase().includes(searchTerm);

        const matchesTag =
            selectedTag === "" || post.tags.includes(selectedTag);

        return matchesSearch && matchesTag;
    });

    if (sortBy === "views") {
        filteredPosts.sort((a, b) => b.views - a.views);
    }

    if (sortBy === "likes") {
        filteredPosts.sort(
            (a, b) => b.reactions.likes - a.reactions.likes
        );
    }

    if (sortBy === "title") {
        filteredPosts.sort((a, b) =>
            a.title.localeCompare(b.title, "sv")
        );
    }

    renderPosts(filteredPosts);
}

// Visa blogginlägg på sidan
function renderPosts(postsToRender) {
    postsContainer.replaceChildren();

    if (postsToRender.length === 0) {
        statusMessage.textContent = "Inga inlägg hittades.";
        return;
    }

    postsToRender.forEach(post => {
        const article = document.createElement("article");
        article.className = "post-card";

        const title = document.createElement("h2");
        title.textContent = post.title;

        const body = document.createElement("p");
        body.textContent = post.body.slice(0, 160) + "...";

        const tags = document.createElement("div");
        tags.className = "post-tags";

        post.tags.forEach(tag => {
            const span = document.createElement("span");
            span.className = "tag";
            span.textContent = tag;
            tags.appendChild(span);
        });

        const details = document.createElement("p");
        details.className = "post-details";
        details.textContent =
            `Visningar: ${post.views} | Gillningar: ${post.reactions.likes}`;

        const link = document.createElement("a");
        link.href = `post.html?id=${post.id}`;
        link.className = "read-button";
        link.textContent = "Läs inlägg";

        article.append(title, body, tags, details, link);
        postsContainer.appendChild(article);
    });

    statusMessage.textContent =
        `${postsToRender.length} inlägg visas.`;
}

// Händelser för sökning och filtrering
searchInput.addEventListener("input", filterAndSortPosts);
tagFilter.addEventListener("change", filterAndSortPosts);
sortSelect.addEventListener("change", filterAndSortPosts);

// Starta applikationen
fetchPosts();
