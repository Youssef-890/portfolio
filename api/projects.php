<?php
require_once __DIR__ . '/config.php';
api_cors();
api_require_method('GET');

$projects = data_read('projects', null);

// Seed defaults on first run
if ($projects === null) {
    $projects = [
        [
            'id'          => 'ecom',
            'title'       => [
                'en' => 'E-Commerce Platform',
                'fr' => 'Plateforme E-Commerce',
                'es' => 'Plataforma de comercio electrónico',
            ],
            'description' => [
                'en' => 'Full-featured online store with payments, inventory and real-time analytics.',
                'fr' => 'Boutique en ligne complète avec paiement, gestion de stock et analytique.',
                'es' => 'Tienda en línea completa con pagos, inventario y analíticas en tiempo real.',
            ],
            'image'       => 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&q=80',
            'tags'        => ['React', 'Node.js', 'MongoDB'],
            'live'        => '#',
            'code'        => '#',
            'category'    => 'web',
            'featured'    => true,
        ],
        [
            'id'          => 'dash',
            'title'       => [
                'en' => 'Analytics Dashboard',
                'fr' => 'Tableau de bord analytique',
                'es' => 'Panel de análisis',
            ],
            'description' => [
                'en' => 'Real-time data visualization dashboard with interactive charts and filters.',
                'fr' => 'Tableau de bord de visualisation en temps réel avec graphiques interactifs.',
                'es' => 'Panel de visualización en tiempo real con gráficos interactivos y filtros.',
            ],
            'image'       => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
            'tags'        => ['Vue.js', 'Python', 'Chart.js'],
            'live'        => '#',
            'code'        => '#',
            'category'    => 'web',
            'featured'    => true,
        ],
        [
            'id'          => 'fit',
            'title'       => [
                'en' => 'Fitness Tracker App',
                'fr' => 'App de fitness',
                'es' => 'App de fitness',
            ],
            'description' => [
                'en' => 'Cross-platform mobile app for workouts, nutrition, and health metrics with AI insights.',
                'fr' => 'Application mobile multiplateforme pour suivre entraînements et nutrition.',
                'es' => 'App móvil multiplataforma para entrenamientos, nutrición y salud con IA.',
            ],
            'image'       => 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80',
            'tags'        => ['React Native', 'Firebase'],
            'live'        => '#',
            'code'        => '#',
            'category'    => 'mobile',
            'featured'    => true,
        ],
    ];
    data_write('projects', $projects);
}

$category = v_string($_GET['category'] ?? '', 40);
$featured = isset($_GET['featured']) ? filter_var($_GET['featured'], FILTER_VALIDATE_BOOLEAN) : null;

$filtered = array_values(array_filter($projects, function ($p) use ($category, $featured) {
    if ($category && ($p['category'] ?? '') !== $category) return false;
    if ($featured !== null && ($p['featured'] ?? false) !== $featured) return false;
    return true;
}));

api_ok($filtered);
