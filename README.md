#  Setup rapide (Laravel)

## 1. Cloner le projet

```bash
git clone <repo_url>
cd ak-rapid-trans
```

## 2. Installer les dépendances

```bash
composer install
```

## 3. Configurer .env

```bash
cp .env.example .env
```

Modifier :

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rapid_trans
DB_USERNAME=rapid_trans_app
DB_PASSWORD=StrongPasswordHere

CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
```

Important securite: utilisez un utilisateur MySQL dedie (pas `root`) avec des privileges limites a la base `rapid_trans`.

## 4. Générer la clé

```bash
php artisan key:generate
```

## 5. Lancer les migrations

```bash
php artisan migrate
```

## 6. Démarrer le serveur

```bash
php artisan serve
```

✅ Done
