# Dev-Web-2024-2025
# guide utilisation pour lancer le site

<!-- On clone le repo, on se rend dans le projet et on active la branche dev -->
git clone https://github.com/DevIII-2025/Projet-Groupe10.git 
cd Projet-Groupe10
git checkout dev

<!-- on crée un venv dans le dossier back/ pour éviter les conflits (seulement les projets en python) -->

cd back
python -m venv venv

<!-- on active le venv (sous window) -->
venv\\Scripts\\activate

<!-- (sous linux et mac) -->
source venv/bin/activate 

<!-- une fois dans le venv on peut maintenant installer les dépendances nécessaire 
on commence par les requirements -->
pip install -r requirements.txt

<!-- on crée la DB -->
python manage.py migrate

<!-- on crée un nouveau fichier qui s'appelle .env (toujours dans back/) et on ajoute le token api qu'il faut récupérer sur le site tmdb --> 

TMDB_API_TOKEN=VotreCleApi

<!-- voici un exemple de fichier .env :
TMDB_API_TOKEN=eyJhbGciOiJIUzI1NiJ9.....Dd7iaQKTKPb_LwIrMBJWAKtcmM
 -->

<!-- on revient dans le terminal du back et on peut importer une centaine de films de l'api tmdb -->
python manage.py import_tmdb_movies

<!-- si tout se passe bien il devrait s'afficher en vert un truc du genre : "100 films importés avec succes !"
<!-- Maintenant qu'on est bon, on peut faire tourner le back -->

python manage.py runserver

<!-- pas oublier de sauver les fichiers à chaque fois ! -->


<!-- maintenant on se rend côté frontend dans un autre terminal et on fait les installations nécessaire -->
npm install

<!-- et on peut lancer le front -->
npm start


