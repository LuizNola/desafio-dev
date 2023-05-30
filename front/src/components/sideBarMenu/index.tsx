import {  useState } from "react";
import "./style.css"
import { Link } from "react-router-dom";

export const SideBarMenu = ({children}: {children?: React.ReactNode}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(true);
    const [activeLink, setActiveLink] = useState("item1");

    const handleLinkClick = (link: string) => {
        setActiveLink(link);
      };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
      };
    
      return (
        <div className="page"> 
            <div className="container">
                <div className={`sidebar ${isMenuOpen ? "" : "closed"}`}>
                <Link
                    to="/dashboard/transactions"
                    className={`menu-item ${activeLink === "item1" ? "active" : ""}`}
                    onClick={() => handleLinkClick("item1")}
                >
                    <span className="icon">📊</span>
                    {isMenuOpen && <span className="text">Transações</span>}
                </Link>  
                <Link
                    to="/dashboard/dataimport"
                    className={`menu-item ${activeLink === "item2" ? "active" : ""}`}
                    onClick={() => handleLinkClick("item2")}
                >
                    <span className="icon">📄</span>
                    {isMenuOpen && <span className="text">Planilhas</span>}
                </Link>
                <Link
                    to="/dashboard/transactions/byshop"
                    className={`menu-item ${activeLink === "item3" ? "active" : ""}`}
                    onClick={() => handleLinkClick("item3")}
                >
                    <span className="icon">🏪</span>
                    {isMenuOpen && <span className="text">Transações por loja</span>}
                </Link>
                </div>
                <div className={`close-button ${isMenuOpen ? "" : "closeo"}`} onClick={toggleMenu}>
                {isMenuOpen ? "⬅️" : "➡️"}
                </div>
            </div>
            {children}
        </div>
        )
}