import { Footer } from "../components/Footer.js";
import { Nav } from "../components/Nav.js";

const navRoot = document.getElementById("nav-root")
const footerRoot = document.getElementById("footer-root")


navRoot.innerHTML = Nav(window.location.pathname)
footerRoot.innerHTML = Footer()