window.API = window.API || "http://127.0.0.1:5000";

const style = document.createElement("style");

style.textContent = `

.search-wrapper{
position:relative;
display:inline-block;
width:100%;
}

.search-dropdown{

position:absolute;
top:calc(100% + 6px);
left:0;
right:0;

background:#1f1f1f;
border:1px solid rgba(255,255,255,.08);
border-radius:12px;

overflow:hidden;

display:none;

z-index:99999;

box-shadow:0 15px 35px rgba(0,0,0,.45);

}

.search-dropdown.open{
display:block;
}

.search-label{

padding:10px 16px;

font-size:.72rem;

font-weight:700;

letter-spacing:1px;

color:#888;

text-transform:uppercase;

background:#181818;

}

.search-item{

padding:12px 16px;

cursor:pointer;

transition:.2s;

border-bottom:1px solid rgba(255,255,255,.05);

}

.search-item:hover{

background:#282828;

}

.search-item-title{

font-size:.92rem;

font-weight:600;

color:white;

}

.search-item-title mark{

background:none;

color:#00c8ff;

}

.search-item-meta{

margin-top:4px;

font-size:.72rem;

color:#999;

}

.search-empty{

padding:20px;

text-align:center;

color:#aaa;

}

`;

document.head.appendChild(style);

function hl(text,q){

if(!q)return text;

return text.replace(

new RegExp(q,"ig"),

m=>`<mark>${m}</mark>`

);

}
async function runSearch(q,dropdown){

const res=await fetch(

`${window.API}/search?keyword=${encodeURIComponent(q)}`

);

const pdfs=await res.json();

dropdown.innerHTML="";

if(!pdfs.length){

dropdown.innerHTML=

`<div class="search-empty">

No PDFs Found

</div>`;

dropdown.classList.add("open");

return;

}

const label=document.createElement("div");

label.className="search-label";

label.innerHTML="Best Match";

dropdown.appendChild(label);

pdfs.slice(0,6).forEach(pdf=>{

const item=document.createElement("div");

item.className="search-item";

item.innerHTML=`

<div class="search-item-title">

${hl(pdf.title,q)}

</div>

<div class="search-item-meta">

${pdf.contributor||"Admin"}

· 👁 ${pdf.views||0} views

</div>

`;

item.onclick=()=>{

document.getElementById("searchInput").value=pdf.title;

dropdown.classList.remove("open");

openPDF(

pdf.id,

pdf.pdf_link,

pdf.title

);

};

dropdown.appendChild(item);

});

const academic=document.getElementById("academicContainer");

const recommended=document.getElementById("recommendedContainer");

const container=academic||recommended;

if(container){

container.innerHTML="";

pdfs.forEach(pdf=>{

container.appendChild(

makeCard(pdf)

);

});

}

dropdown.classList.add("open");

}
function setupSearch() {

    const input = document.getElementById("searchInput");

    if (!input) return;

    const wrapper = document.createElement("div");
    wrapper.className = "search-wrapper";

    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    const icon = wrapper.parentNode.querySelector("i");
    if (icon) wrapper.appendChild(icon);

    const dropdown = document.createElement("div");
    dropdown.className = "search-dropdown";
    wrapper.appendChild(dropdown);

    let timer;

    input.addEventListener("input", () => {

        clearTimeout(timer);

        const q = input.value.trim();

        if (q.length < 2) {

            dropdown.classList.remove("open");

            if (typeof loadAcademicPage === "function") {
                loadAcademicPage();
            }

            if (typeof loadRecommended === "function") {
                loadRecommended();
            }

            return;
        }

        timer = setTimeout(() => {

            runSearch(q, dropdown);

        }, 250);

    });

    document.addEventListener("click", (e) => {

        if (!wrapper.contains(e.target)) {
            dropdown.classList.remove("open");
        }

    });

    input.addEventListener("keydown", (e) => {

        if (e.key === "Escape") {
            dropdown.classList.remove("open");
        }

    });

}

document.addEventListener("DOMContentLoaded", setupSearch);