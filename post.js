// skapar en variabel som inte kan tilldelas ett nytt värde.
const API_URL = "https://dummyjson.com";

// Hämta inläggets ID från URL:en
const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

const postContainer = document.querySelector("#postContainer");
const commentsContainer = document.querySelector("#commentsContainer");
const statusMessage = document.querySelector("#statusMessage");
const errorMessage = document.querySelector("#errorMessage");
const successMessage = document.querySelector("#successMessage");

const editSection = document.querySelector("#editSection");
const editForm = document.querySelector("#editForm");
const editTitle = document.querySelector("#editTitle");
const editBody = document.querySelector("#editBody");
const commentForm = document.querySelector("#commentForm");
const commentInput = document.querySelector("#commentInput");

let currentPost = null;
// Skapar en variabel som heter comments
let comments = [];

// funktion för att visa felmeddelanden
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.hidden = false;
    successMessage.textContent = "";
}
// funktion för att visa succsesmeddelande
function showSuccess(message) {
    successMessage.textContent = message;
    errorMessage.hidden = true;
}

// funktion för att hämta ett enskilt inlägg
async function fetchPost() {
    errorMessage.hidden = true;
    statusMessage.textContent = "Hämtar inlägg...";
// hämta inlägget med hjälp av fetch och await
    try {
        const response = await fetch(`${API_URL}/posts/${postId}`);
// kontrollera om svaret är ok, annars visa felmeddelande
        if (!response.ok) {
            throw new Error("Kunde inte hämta blogginlägget.");
        }
// hämta inlägget som JSON och spara det i currentPost
        currentPost = await response.json();

        renderPost(currentPost);
        statusMessage.textContent = "";
// om det inte går att hämta inlägget, visa felmeddelande
    } catch (error) {
        showError(error.message);
        statusMessage.textContent = "";
    }
}

// funktion för att visa inlägget
function renderPost(post) {
    postContainer.replaceChildren();
// skapar ett article-element för inlägget
    const article = document.createElement("article");
    article.className = "post-card";
// skapar element för rubrik, innehåll, detaljer och taggar
    const title = document.createElement("h1");
    title.textContent = post.title;
// skapar element för innehåll
    const body = document.createElement("p");
    body.textContent = post.body;
// skapar element för detaljer
    const details = document.createElement("p");
    details.className = "post-details";
    details.textContent =
        `Visningar: ${post.views} | Gillningar: ${post.reactions.likes}`;
//skapar element för taggar
    const tags = document.createElement("div");
    tags.className = "post-tags";
//loopar igenom taggar och skapar ett span-element för varje tagg
    post.tags.forEach(tag => {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = tag;
        tags.appendChild(span);
    });
//skapar en knapp för att redigera inlägg samt en eventlistener
    const editButton = document.createElement("button");
    editButton.textContent = "Redigera inlägg";
    editButton.addEventListener("click", () => {
        editTitle.value = currentPost.title;
        editBody.value = currentPost.body;
        editSection.hidden = false;
    });
// skapar en knapp för att ta bort inlägg samt en eventlistener
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Ta bort inlägg";
    deleteButton.className = "delete-button";
    deleteButton.addEventListener("click", deletePost);
// lägger till alla element på sidan
    article.append(
        title,
        body,
        tags,
        details,
        editButton,
        deleteButton
    );

    postContainer.appendChild(article);
}

// funktion för att hämta kommentarer/GET
async function fetchComments() {
    try {
        // skickar ett GET-anrop för att hämta inlägget från API
        const response = await fetch(
            `${API_URL}/comments/post/${postId}`
        );
// kontrollerar att anropet lyckades
        if (!response.ok) {
            throw new Error("Kunde inte hämta kommentarerna.");
        }
// omvandlar svaret från API till js-data
        const data = await response.json();
// hämtar svaret från API och sparar den i variabeln comments
        comments = data.comments;
        //anropar funktionen som visar kommentarerna på sidan
        renderComments();
// fångar fel och visar dem för användaren
    } catch (error) {
        showError(error.message);
    }
}

// funktion för att visa kommentarer
function renderComments() {
    // tar bort gammla kommentarer från HTML-elemetet
    commentsContainer.replaceChildren();
// kontrollerar om det finns kommentarer, om inte visas meddelande
    if (comments.length === 0) {
        commentsContainer.textContent = "Inga kommentarer ännu.";
        return;
    }
// går igenom varje kommentar i arrayen
    comments.forEach(comment => {
        // skapar ett html element och ger den en css-class
        const article = document.createElement("article");
        article.className = "comment";
// skapar ett element som visar användarens namn i fet-stil 
        const username = document.createElement("strong");
        // hämtar användarens namn från kommentaren
        username.textContent = comment.user.username;
// skapar en paragraf och fyller den med kommentarens text
        const body = document.createElement("p");
        body.textContent = comment.body;
// lägger in info från kommentar och username i samma article-element
        article.append(username, body);
        commentsContainer.appendChild(article);
    });
}

// funktion för att lägga till en kommentar/POST
async function addComment(event) {
    // stoppar sidans deafault beteende när formulär skickas
    event.preventDefault();
// hämtar text som användaren skrivit och tar bort mellanslag i början och slutet av texten
    const commentText = commentInput.value.trim();
// kollar om kommentaren är tom
    if (!commentText) {
        // visar felmeddelande om inget skrivits i kommentaren
        showError("Du måste skriva en kommentar.");
        return;
    }

    try {
        // gör en förfrågan till API endpoint för att skapa kommentarer
        const response = await fetch(`${API_URL}/comments/add`, {
            // 
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                body: commentText,
                postId: Number(postId),
                user: {
                    id: 1,
                    username: "Jonathan"
                }
            })
        });

        if (!response.ok) {
            throw new Error("Kunde inte publicera kommentaren.");
        }

        const newComment = await response.json();

        //lägger den nya kommentaren först i arrayen
        comments.unshift(newComment);
        renderComments();

        commentForm.reset();
        showSuccess("Din kommentar har publicerats!");

    } catch (error) {
        showError(error.message);
    }
}

// funktion för att uppdatera ett inlägg/PATCH
async function updatePost(event) {
    event.preventDefault();

    const updatedPost = {
        title: editTitle.value.trim(),
        body: editBody.value.trim()
    };

    if (!updatedPost.title || !updatedPost.body) {
        showError("Rubrik och innehåll måste fyllas i.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/posts/${postId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedPost)
        });

        if (!response.ok) {
            throw new Error("Kunde inte uppdatera inlägget.");
        }

        const data = await response.json();

        // uppdaterar den lokala informationen
        currentPost = { ...currentPost, ...data };

        renderPost(currentPost);
        editSection.hidden = true;

        showSuccess("Inlägget har uppdaterats!");

    } catch (error) {
        showError(error.message);
    }
}

// funktion för att ersätta ett inlägg/PUT
async function replacePost() {
    const updatedTitle = editTitle.value.trim();
    const updatedBody = editBody.value.trim();

    if (!updatedTitle || !updatedBody) {
        showError("Rubrik och innehåll måste fyllas i.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/posts/${postId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...currentPost,
                title: updatedTitle,
                body: updatedBody
            })
        });

        if (!response.ok) {
            throw new Error("Kunde inte ersätta inlägget.");
        }

        const data = await response.json();

        currentPost = { ...currentPost, ...data };

        renderPost(currentPost);
        editSection.hidden = true;

        showSuccess("Inlägget har ersatts");

    } catch (error) {
        showError(error.message);
    }
}

// funktion för att ta bort ett inlägg/DELETE
async function deletePost() {
    const confirmed = confirm(
        "Är du säker på att du vill ta bort detta inlägg?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/posts/${postId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Kunde inte ta bort inlägget.");
        }

        await response.json();

        showSuccess("Inlägget har tagits bort!");

        // Gå tillbaka till startsidan
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);

    } catch (error) {
        showError(error.message);
    }
}

// händelser
commentForm.addEventListener("submit", addComment);
editForm.addEventListener("submit", updatePost);

document.querySelector("#putButton")
    .addEventListener("click", replacePost);

document.querySelector("#cancelEdit")
    .addEventListener("click", () => {
        editSection.hidden = true;
        errorMessage.hidden = true;
    });

// kontrollerar att ett ID finns i URL:en
if (postId && Number.isInteger(Number(postId)) && Number(postId) > 0) {
    fetchPost();
    fetchComments();
} else {
    showError("Ogiltigt inläggs-ID.");
    statusMessage.textContent = "";
    commentForm.hidden = true;
}
