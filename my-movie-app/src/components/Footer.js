import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* À propos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">À propos</h3>
            <p className="text-gray-300 text-sm">
              My Movie App est votre plateforme pour découvrir, organiser et partager vos films préférés.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white text-sm">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/lists" className="text-gray-300 hover:text-white text-sm">
                  Mes listes
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-300 hover:text-white text-sm">
                  Mon profil
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Légal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/mentions-legales" className="text-gray-300 hover:text-white text-sm">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link to="/confidentialite" className="text-gray-300 hover:text-white text-sm">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-gray-300 hover:text-white text-sm">
                  Politique des cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:contact@mymovieapp.com" className="text-gray-300 hover:text-white text-sm">
                  contact@mymovieapp.com
                </a>
              </li>
              <li>
                <a href="https://twitter.com/mymovieapp" className="text-gray-300 hover:text-white text-sm">
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://github.com/mymovieapp" className="text-gray-300 hover:text-white text-sm">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300 text-sm">
            © {new Date().getFullYear()} My Movie App. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 