if(!utils) throw "Utils not imported";

const global = {
    
    observer: new IntersectionObserver((entries, obs) => {
        for(const entry of entries) {
            entry.target.classList.toggle("visible", entry.isIntersecting);
        }
    })
};

window.addEventListener("load", async () => {

    // --== Auto header and footer insertion ==--

    // Prepare
    const header = document.getElementsByTagName("header")[0];
    const footer = document.getElementsByTagName("footer")[0];

    document.body.prepend(header);
    document.body.append(footer);

    // Request header and footer
    const headerHtml = await utils.httpGet("/components/header.html");
    header.innerHTML = headerHtml.replace("<header>", "").replace("</header>", "");

    const footerHtml = await utils.httpGet("/components/footer.html");
    footer.innerHTML = footerHtml.replace("<footer>", "").replace("</footer>", "");

    // Set page title (if present)
    const title = document.body.getAttribute("data-title");
    const mainPage = document.body.getAttribute("data-main-page") || "";
    
    if(title) {
        const headerPageTitle = document.getElementById("header-page-title");
        headerPageTitle.style.display = "";
        headerPageTitle.href = mainPage;

        headerPageTitle.children[0].innerText = title;
    }

    // --== Observe all elements with the 'observing' class ==--
    for(const observing of document.getElementsByClassName("observing")) {
        global.observer.observe(observing);
    }

    // --== Display switch class ==--

    for(const btn of document.getElementsByClassName("switch")) {
        const targetId = btn.getAttribute("data-target");
        if(!targetId) {
            console.warn("No data-target specified for switch, ignoring.", btn);
            continue;
        }

        const target = document.getElementById(targetId);
        if(!target) {
            console.warn(`Element #${targetId} not found, ignoring.`, btn);
            continue;
        }

        let visible = false;

        function show() {
            visible = true;
            target.style.removeProperty("display");
        }

        function hide() {
            visible = false;
            target.style.display = "none";
        }

        btn.addEventListener("click", () => {
            if(visible) hide();
            else show()
        });

        hide();
    }
});