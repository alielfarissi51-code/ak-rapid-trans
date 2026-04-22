<!DOCTYPE html>
<html lang="<?php echo e(str_replace('_', '-', app()->getLocale())); ?>">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Inscription - AK RAPID TRANS</title>
    <style>
        :root { color-scheme: light; }
        body { margin: 0; font-family: Arial, sans-serif; background: linear-gradient(135deg, #eef2ff, #f8fafc); color: #111827; }
        .container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .card { width: 100%; max-width: 560px; background: #fff; border-radius: 16px; box-shadow: 0 20px 40px rgba(15, 23, 42, .12); padding: 1.5rem; }
        h1 { margin: 0 0 .25rem; font-size: 1.75rem; }
        .muted { color: #6b7280; margin-bottom: 1.25rem; }
        .error { margin-bottom: 1rem; border: 1px solid #fecaca; background: #fef2f2; color: #b91c1c; padding: .75rem; border-radius: 12px; font-size: .95rem; }
        .field { margin-bottom: 1rem; }
        label { display: block; margin-bottom: .4rem; font-size: .92rem; font-weight: 600; }
        input[type="text"], input[type="email"], input[type="password"] { width: 100%; box-sizing: border-box; border: 1px solid #d1d5db; border-radius: 12px; padding: .85rem .9rem; font-size: 1rem; outline: none; }
        input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.12); }
        .btn { width: 100%; border: none; border-radius: 12px; padding: .9rem 1rem; background: #4f46e5; color: #fff; font-weight: 700; cursor: pointer; }
        .btn:hover { background: #4338ca; }
        .footer { margin-top: 1rem; text-align: center; font-size: .95rem; color: #4b5563; }
        .footer a { color: #4f46e5; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
        <h1>Créer un compte</h1>
        <p class="muted">Inscription client AK RAPID TRANS.</p>

        <?php if($errors->any()): ?>
            <div class="error">
                <?php echo e($errors->first()); ?>

            </div>
        <?php endif; ?>

        <form method="POST" action="<?php echo e(route('register.store')); ?>">
            <?php echo csrf_field(); ?>

            <div class="field">
                <label for="name">Nom complet</label>
                <input id="name" type="text" name="name" value="<?php echo e(old('name')); ?>" required autofocus>
            </div>

            <div class="field">
                <label for="email">Email</label>
                <input id="email" type="email" name="email" value="<?php echo e(old('email')); ?>" required>
            </div>

            <div class="field">
                <label for="telephone">Téléphone</label>
                <input id="telephone" type="text" name="telephone" value="<?php echo e(old('telephone')); ?>" required>
            </div>

            <div class="field">
                <label for="adresse">Adresse (optionnel)</label>
                <input id="adresse" type="text" name="adresse" value="<?php echo e(old('adresse')); ?>">
            </div>

            <div class="field">
                <label for="password">Mot de passe</label>
                <input id="password" type="password" name="password" required>
            </div>

            <div class="field">
                <label for="password_confirmation">Confirmation du mot de passe</label>
                <input id="password_confirmation" type="password" name="password_confirmation" required>
            </div>

            <button type="submit" class="btn">
                Créer le compte
            </button>
        </form>

        <p class="footer">
            Déjà inscrit ?
            <a href="<?php echo e(route('login')); ?>">Se connecter</a>
        </p>
        </div>
    </div>
</body>
</html>
<?php /**PATH C:\xampp\htdocs\ak-rapid-trans\resources\views/auth/register.blade.php ENDPATH**/ ?>