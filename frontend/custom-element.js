export class CustomElement extends HTMLDivElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    const htmlUrl = this.getAttribute("html-url");
    const cssUrl = this.getAttribute("css-url");
    const moduleUrl = this.getAttribute("module-url");

    if (!htmlUrl || !cssUrl || !moduleUrl) {
      console.error("Missing required attributes: html-url, css-url, or module-url");
      return;
    }

    try {
      // Load CSS
      await this.loadCSS(cssUrl);

      // Load HTML
      await this.loadHTML(htmlUrl);

      // Ensure the element's height is recalculated
      this.style.display = "block"; // Ensure proper block-level behavior
      this.style.height = "auto"; // Let the content dictate height
      this.style.position = "relative"; // Make sure it's in the flow of the document

      // Load and initialize the module
      const module = await import(location.pathname.slice(0,location.pathname.length-1)+moduleUrl);
      
      if (module.initUI && typeof module.initUI === "function") {
        module.initUI(document);
      } else {
        console.error(`No valid 'initUI' function found in ${moduleUrl}`);
      }
      // Trigger layout recalculation
      this.dispatchEvent(new Event("contentLoaded"));
    } catch (error) {
      console.error("Error initializing CustomElement:", error);
    }
  }

  loadCSS(cssUrl) {
    return new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = './'+cssUrl;
      link.onload = resolve;
      link.onerror = () => reject(`Failed to load CSS from ${cssUrl}`);
      document.head.appendChild(link);
    });
  }

  async loadHTML(htmlUrl) {
    const response = await fetch('./'+htmlUrl);
    if (!response.ok) throw new Error(`Failed to load HTML from ${htmlUrl}`);
    const htmlContent = await response.text();
    let newDiv = document.createElement('div');
    newDiv.innerHTML = htmlContent;
    this.insertAdjacentElement('afterend', newDiv);
  }
}

// Define the custom element
customElements.define("custom-element", CustomElement, { extends: "div" });

export function insertCustomElement(rootPath, target) {
  // empty the content of the target
  target.innerHTML = '' 
  // add the custom element inside it
  // step 1 : create it:
  let ce = document.createElement('div', { is: 'custom-element' })
  // step 2 : setIt's paths
  ce.setAttribute('html-url', rootPath+'/index.html')
  ce.setAttribute('css-url', rootPath+'/style.css')
  ce.setAttribute('module-url', rootPath+'/main.js')
  // step 3 : add it
  target.appendChild(ce)
}