<?php
require_once __DIR__ . '/config.php';
api_cors();
api_require_method('GET');

$items = data_read('testimonials', null);
if ($items === null) {
    $items = [
        [
            'id'      => 't1',
            'author'  => 'Sarah Johnson',
            'role'    => 'CEO, TechStart Inc.',
            'initials'=> 'SJ',
            'gradient'=> ['#b6e3f4', '#6c63ff'],
            'stars'   => 5,
            'text'    => [
                'en' => "Youssef delivered an exceptional e-commerce platform that exceeded all our expectations.",
                'fr' => "Youssef a livré une plateforme e-commerce exceptionnelle qui a dépassé toutes nos attentes.",
                'es' => "Youssef entregó una plataforma e-commerce excepcional que superó todas nuestras expectativas.",
            ],
        ],
        [
            'id'      => 't2',
            'author'  => 'Ahmed Benali',
            'role'    => 'Product Manager, DataFlow',
            'initials'=> 'AB',
            'gradient'=> ['#c0aede', '#ff6584'],
            'stars'   => 5,
            'text'    => [
                'en' => "Working with Youssef was a pleasure — our site went from outdated to modern, fast and beautiful.",
                'fr' => "Travailler avec Youssef a été un plaisir — notre site est passé d'obsolète à moderne et rapide.",
                'es' => "Trabajar con Youssef fue un placer — nuestro sitio pasó de obsoleto a moderno y rápido.",
            ],
        ],
        [
            'id'      => 't3',
            'author'  => 'Laura Chen',
            'role'    => 'CTO, PixelForge',
            'initials'=> 'LC',
            'gradient'=> ['#22c55e', '#6c63ff'],
            'stars'   => 5,
            'text'    => [
                'en' => "Pixel-perfect delivery, blazing fast, and great communication. We shipped two weeks ahead.",
                'fr' => "Livraison parfaite au pixel près, ultra rapide, super communication. Deux semaines d'avance.",
                'es' => "Entrega perfecta al píxel, súper rápida y gran comunicación. Dos semanas antes de lo previsto.",
            ],
        ],
    ];
    data_write('testimonials', $items);
}

api_ok($items);
