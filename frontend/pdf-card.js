async function toggleFavorite(pdfId, btn) {

    try {

        if (favoriteIds.has(pdfId)) {

            await fetch(
                `${API}/favorites/user/${userId}/pdf/${pdfId}`,
                {
                    method: "DELETE"
                }
            );

            favoriteIds.delete(pdfId);

const icon = btn.querySelector("i");

icon.classList.remove("fa-solid");
icon.classList.add("fa-regular");

        } else {

            await fetch(`${API}/favorites`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    user_id: userId,
                    pdf_id: pdfId

                })

            });

            favoriteIds.add(pdfId);

const icon = btn.querySelector("i");

icon.classList.remove("fa-regular");
icon.classList.add("fa-solid");
        }

    } catch (err) {

        console.log(err);

    }

}
async function toggleReadingList(pdfId, btn){

    try{

        const icon =
        btn.querySelector("i");

        if(readingListIds.has(pdfId)){

            await fetch(

                `${API}/reading-list/${userId}/${pdfId}`,

                {
                    method:"DELETE"
                }

            );

            readingListIds.delete(pdfId);

            icon.classList.remove("fa-solid");
            icon.classList.add("fa-regular");

        }else{

            await fetch(

                `${API}/readinglist`,

                {

                    method:"POST",

                    headers:{
                        "Content-Type":"application/json"
                    },

                    body:JSON.stringify({

                        user_id:userId,
                        pdf_id:pdfId

                    })

                }

            );

            readingListIds.add(pdfId);

            icon.classList.remove("fa-regular");
            icon.classList.add("fa-solid");

        }

    }catch(err){

        console.log(err);

    }

}
// ─── MAKE PDF CARD ────────────────────────────────────────────────────────────
function makeCard(pdf, rank) {

    const card =
    document.createElement("div");

    card.className =
    "pdf-card";

    card.innerHTML = `

        ${rank ?
        `<div class="rank-badge">#${rank}</div>`
        : ""}
<button
class="fav-btn"
onclick="
event.stopPropagation();
toggleFavorite(${pdf.id}, this);
">
<i class="${favoriteIds.has(pdf.id)
    ? 'fa-solid fa-heart'
    : 'fa-regular fa-heart'}"></i>
</button>

        <div class="pdf-icon">
            PDF
        </div>

        <div>

            <span class="views-badge">
                👁 ${pdf.views || 0} views
            </span>

            <h3>
                ${pdf.title}
            </h3>

            <p style="
                font-size:0.8rem;
                color:#aaa;
                margin-top:4px;
            ">
                ${pdf.contributor || "Unknown"}
            </p>

        </div>
        <button
class="list-btn"
onclick="
event.stopPropagation();
toggleReadingList(${pdf.id}, this);
">
<i class="${
readingListIds.has(pdf.id)
? 'fa-solid fa-bookmark'
: 'fa-regular fa-bookmark'
}"></i>
</button>
    `;

    card.onclick = () => {

        openPDF(
            pdf.id,
            pdf.pdf_link,
            pdf.title
        );

    };

    return card;

}
async function loadFavoriteIds() {

    try {

        const response = await fetch(`${API}/favorites/${userId}`);

        const favorites = await response.json();

        favoriteIds.clear();

        favorites.forEach(item => {

            favoriteIds.add(item.pdf_id);

        });

    } catch (err) {

        console.log(err);

    }

}
async function loadReadingListIds(){

    try{

        const response =
        await fetch(`${API}/reading-list/${userId}`);

        const data =
        await response.json();

        readingListIds.clear();

        data.forEach(pdf=>{

            readingListIds.add(pdf.id);

        });

    }catch(err){

        console.log(err);

    }

}
async function openPDF(pdfId, fileUrl, title) {


  const userId = localStorage.getItem("userId");

  if (fileUrl && fileUrl !== 'null' && fileUrl !== 'undefined') {

    try {

      await fetch(`${API}/pdfs/${pdfId}/view`, {

        method: 'POST',

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          userId: userId
        })

      });

    } catch(e) {}

  localStorage.setItem(
    "returnPage",
    window.location.pathname.split("/").pop()
);
window.location.href =
`reader.html?pdf_id=${pdfId}&file=${fileUrl}&page=1`;
  } else {

    alert(`"${title}" — PDF file not available yet`);

  }
}




