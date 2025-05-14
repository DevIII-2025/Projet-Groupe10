# Dev-Web-2024-2025
# guide utilisation pour lancer le site

<!-- On clone le repo, on se rend dans le projet et on active la branche dev -->
git clone https://github.com/DevIII-2025/Projet-Groupe10.git 
cd Projet-Groupe10
git checkout dev

<!-- on crée un venv dans le dossier back/ pour éviter les conflits (seulement les projets en python) -->

cd back
<!-- (sous linux et mac) -->
python3 -m venv venv
<!-- (sous windows) -->
python -m venv venv

<!-- on active le venv (sous window) -->
venv\\Scripts\\activate

<!-- (sous linux et mac) -->
source venv/bin/activate 

<!-- une fois dans le venv on peut maintenant installer les dépendances nécessaire 
on commence par les requirements -->
pip install -r requirements.txt

<!-- on crée la DB -->
python manage.py makemigrations
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


-----------------------

A avoir dans ses .env et .env.dev (1 fichier .env et 1 .env.dev côté back et côté front):

Fichier .env (back):
TMDB_API_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJhdWQ........cflRKPnaInfrZsGErDd7iaQKTKPb_LwIrMBJWAKtcmM
DEBUG=True
DATABASE_NAME=db.sqlite3
ALLOWED_HOSTS=localhost,149.202.49.197
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://149.202.49.197:3000



Fichier .env.dev (back):
TMDB_API_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJhdWQiO......cflRKPnaInfrZsGErDd7iaQKTKPb_LwIrMBJWAKtcmM
DEBUG=True
DATABASE_NAME=db_dev.sqlite3
ALLOWED_HOSTS=localhost,149.202.49.197
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://149.202.49.197:3000


Fichier .env (front):
REACT_APP_BACKEND_URL=http://localhost:8000 


Fichier .env.dev (front):
REACT_APP_BACKEND_URL=http://localhost:8000

c'est tout 

<!-- pour lancer la commande dans le vps et qu'il tourne tout le temps c'est : -->
python manage.py runserver &
npm start &

<!-- et pour en sortir c'est :  -->
fg

<!-- commandes déploiement production -->
<!-- 1.	On your local or CI machine, run: -->
cd ~/Project-groupe10
git archive --format=tar.gz --output=main.tar.gz main
<!-- 2.	Send it to the server: -->
scp main.tar.gz ovh2:/tmp/
<!-- 3.	SSH into server and unpack: -->
ssh ovh2
cd Projet-Groupe10
tar -xzf /tmp/main.tar.gz 