import { Footer } from "../components/Footer.js";
import { Nav } from "../components/Nav.js";
import { Hero } from "../components/Hero.js";

const navRoot = document.getElementById("nav-root")
const footerRoot = document.getElementById("footer-root")
const heroRoot =document.getElementById("hero-root")

navRoot.innerHTML = Nav(window.location.pathname)
footerRoot.innerHTML = Footer()
heroRoot.innerHTML = Hero()