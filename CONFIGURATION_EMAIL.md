# Configuration des notifications email

## Comment obtenir la clé Resend API

### Étape 1 : Créer un compte Resend
1. Va sur https://resend.com
2. Clique sur **"Sign Up"** ou **"Get Started"**
3. Inscris-toi avec ton email (ou utilise Google/GitHub)

### Étape 2 : Vérifier ton email
- Vérifie ta boîte mail et clique sur le lien de confirmation

### Étape 3 : Créer une API Key
1. Une fois connecté, va dans **"API Keys"** (dans le menu de gauche)
2. Clique sur **"Create API Key"**
3. Donne un nom (ex: "Fase Notifications")
4. Sélectionne les permissions : **"Sending access"** (permission d'envoi)
5. Clique sur **"Add"**
6. **IMPORTANT** : Copie la clé API qui s'affiche (elle ne sera plus visible après !)
   - Format : `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Étape 4 : Vérifier ton domaine (optionnel mais recommandé)
- Pour envoyer depuis un email personnalisé (ex: prefecture@fase.app), tu dois vérifier ton domaine
- Pour les tests, tu peux utiliser l'email par défaut de Resend

## Configuration sur Vercel

### Étape 1 : Accéder aux variables d'environnement
1. Va sur https://vercel.com et connecte-toi
2. Sélectionne ton projet **fase** (ou le nom de ton projet)
3. Va dans **Settings** (Paramètres)
4. Clique sur **Environment Variables** (Variables d'environnement)

### Étape 2 : Ajouter RESEND_API_KEY
1. Clique sur **"Add New"**
2. **Name** : `RESEND_API_KEY`
3. **Value** : Colle la clé API que tu as copiée (ex: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
4. **Environment** : Coche **Production**, **Preview**, et **Development** (ou au moins Production)
5. Clique sur **"Save"**

### Étape 3 : Ajouter ADMIN_EMAILS
1. Clique sur **"Add New"**
2. **Name** : `ADMIN_EMAILS`
3. **Value** : `daviddebuze020@gmail.com` (ou plusieurs emails séparés par des virgules : `email1@mail.com,email2@mail.com`)
4. **Environment** : Coche **Production**, **Preview**, et **Development**
5. Clique sur **"Save"**

### Étape 4 : Redéployer
- Après avoir ajouté les variables, Vercel va automatiquement redéployer ton projet
- Ou tu peux aller dans **Deployments** et cliquer sur **"Redeploy"** sur le dernier déploiement

## Test

Une fois configuré :
1. Va sur ton site
2. Connecte-toi en tant qu'étudiant
3. Pose une question via le formulaire
4. Vérifie que l'email arrive bien à `daviddebuze020@gmail.com`

## Dépannage

- **Email non reçu** : Vérifie les logs Vercel (Deployments > Dernier déploiement > Functions > Logs)
- **Erreur "missing_env"** : Les variables d'environnement ne sont pas correctement configurées
- **Erreur "resend_failed"** : La clé API est invalide ou expirée, crée-en une nouvelle

## Plan gratuit Resend

- 100 emails/jour gratuitement
- Parfait pour commencer avec 3000 étudiants (si pas plus de 100 questions/jour)

