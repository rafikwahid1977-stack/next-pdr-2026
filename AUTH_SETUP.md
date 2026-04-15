# Configuration d'authentification

## Variables d'environnement requises

```env
# JWT Secret - Utilisé pour signer et vérifier les tokens JWT
JWT_SECRET=your-super-secret-key-here

# Supabase
SUPABASE_PROJECT_URL=your-supabase-url
SUPABASE_API_KEY=your-supabase-api-key
```

## Fonctionnalités implémentées

### 1. Route API de Connexion (`/api/auth/login`)

- Vérifie les identifiants (username et password)
- Compare le password avec le hash bcrypt
- Génère un token JWT
- Stock le token et le rôle dans les cookies
- Retourne les informations utilisateur

### 2. Route API de Déconnexion (`/api/auth/logout`)

- Efface les cookies d'authentification
- Redirige l'utilisateur vers la page de connexion

### 3. Route API Utilisateur Connecté (`/api/auth/me`)

- Vérifie l'authentication
- Retourne les informations utilisateur

### 4. Page de Connexion (`/(public)/page.tsx`)

- Formulaire de login amélioré
- Gestion des erreurs
- Redirection selon le rôle

### 5. Middleware

- Protège les routes privées
- Redirige vers login si pas authentifié
- Vérifie la validité du JWT

### 6. Layouts

- Admin layout avec bouton de déconnexion
- Machines layout avec bouton de déconnexion

### 7. Hook useAuth

- Hook React pour gérer l'authentification côté client
- Récupère les informations utilisateur
- Fournit la fonction logout
