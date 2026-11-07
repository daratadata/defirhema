# Défi Rhema — feuille de route de déploiement

## 1. Base de données et comptes (Supabase, gratuit, ~15 min)
1. Créez un compte sur supabase.com puis un projet (région proche, ex. Europe).
2. SQL Editor > New query > collez `schema.sql` > Run.
3. Authentication > Providers > Email : **désactivez « Confirm email »** (obligatoire : la connexion se fait avec le contact téléphonique, il n'y a pas d'email réel).
4. Project Settings > API : copiez « Project URL » et la clé « anon public ».
5. Ouvrez `config.js` et remplacez les deux valeurs.

## 2. Hébergement (Netlify, ~10 min)
1. L'appel audio utilise une fonction Netlify : déployez via GitHub (mettez le dossier dans un dépôt, puis netlify.com > Add new site > Import from Git). Le glisser-déposer ne garantit pas les fonctions.
2. Notez l’adresse obtenue (ex. https://defi-rhema.netlify.app). Vous pouvez la renommer ou ajouter votre domaine.
3. Supabase > Authentication > URL Configuration : mettez cette adresse dans « Site URL ».

## 2 bis. Appel audio (LiveKit Cloud, offre gratuite)
1. Créez un compte sur livekit.io/cloud et un projet. Notez l'URL (wss://...), l'API Key et l'API Secret.
2. Netlify > Site configuration > Environment variables, ajoutez :
   SUPABASE_URL, SUPABASE_ANON_KEY (mêmes valeurs que config.js), LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET.
3. Redéployez. Onglet « Rencontre » : tout le monde rejoint la même salle audio. L'administrateur voit un bouton « Couper » sous chaque participant et « Couper tous les micros » (un participant peut réactiver son micro).

## 2 ter. Texte de la Bible TOB
La TOB est protégée par des droits d'auteur : son texte n'est pas fourni ici. Il faut l'autorisation de ses éditeurs (à ce que je sais, l'Alliance biblique française et les Éditions du Cerf : à vérifier auprès d'eux) pour l'installer sur le site.
1. Une fois autorisé, préparez le texte : une ligne par verset, « Matthieu 1:1 texte… ».
2. Exécutez : python3 tools/import_bible.py texte_tob.txt tob (crée le dossier bible/tob).
3. Redéployez. Onglet « Bible » : le chapitre s'affiche, les chapitres du jour sont cliquables.
Autres versions plus tard : même méthode (ex. python3 tools/import_bible.py louis_segond.txt lsg), puis ajoutez-la dans bible/versions.json.
Avant l'autorisation, pour tester l'affichage, vous pouvez importer un texte du domaine public (ex. Louis Segond 1910) : donnez-le-moi et je le mets au bon format.

## 3. Compte administrateur
1. Ouvrez le site, inscrivez-vous avec votre contact (téléphone avec indicatif, chiffres seulement, ex. 22507000000).
2. Supabase > SQL Editor, exécutez (avec votre email) :
   update profiles set role='admin' where contact='VOTRE_CONTACT_EN_CHIFFRES';
3. Rechargez le site : les onglets Tableau de bord, Pointage, Participants, Réglages apparaissent.
4. Réglages : choisissez la date de début quand elle sera connue.

## 4. Test réel (avant le lancement)
- Faites créer 3 à 5 comptes (hommes et femmes, pays différents).
- Attribuez une lecture à un participant ; faites-le modifier sa lecture et son intention.
- Faites cocher « J’ai lu », puis validez la présence dans Pointage ; vérifiez le tableau de bord.
- Installer sur téléphone : ouvrir le lien > « Ajouter à l’écran d’accueil ».

## 5. Lancement
- Partagez le lien aux participants désignés. Mot de passe oublié : à ajouter (phase suivante).
- Mot de passe oublié : pas de récupération automatique (pas d'email). L'administrateur peut le réinitialiser dans Supabase > Authentication > Users.

## Phase suivante (après le test)
- Déroulement de la prière dans l'écran Rencontre, outils de modération (couper un micro).
- Rappels quotidiens (notifications), mot de passe oublié, export Excel des statistiques.
