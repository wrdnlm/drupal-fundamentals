<?php

/**
 * @file
 * Lists available colors and color schemes for the Honey theme.
 */

$info = [
  // Available colors and color labels used in theme.
  'fields' => [
    'top' => t('Header background top'),
    'bottom' => t('Header background bottom'),
    'bg' => t('Main background'),
    'sidebar' => t('Sidebar background'),
    'sidebarborders' => t('Sidebar borders'),
    'footer' => t('Footer background'),
    'titleslogan' => t('Title and slogan'),
    'text' => t('Text color'),
    'link' => t('Link color'),
  ],
  // Pre-defined color schemes.
  'schemes' => [
    'default' => [
      'title' => t('Sweet Honey'),
      'colors' => [
        'top' => '#712c1e',
        'bottom' => '#ffd34e',
        'bg' => '#ffffff',
        'sidebar' => '#105b63',
        'sidebarborders' => '#fffad5',
        'footer' => '#db9e36',
        'titleslogan' => '#ffd147',
        'text' => '#333333',
        'link' => '#534400',
      ],
    ],
    'farmers' => [
      'title' => t('Farmers market(default)'),
      'colors' => [
        'top' => '#7db84a',
        'bottom' => '#c2e78b',
        'bg' => '#ffffff',
        'sidebar' => '#f8bc65',
        'sidebarborders' => '#e96b3c',
        'footer' => '#2a3524',
        'titleslogan' => '#fffeff',
        'text' => '#000000',
        'link' => '#0071b3',
      ],
    ],
  ],

  // CSS files (excluding @import) to rewrite with new color scheme.
  'css' => [
    'css/base/colors.css',
  ],

  // Files to copy.
  'copy' => [
    'logo.svg',
  ],

  // Gradient definitions.
  'gradients' => [
    [
      // (x, y, width, height).
      'dimension' => [0, 0, 0, 0],
      // Direction of gradient ('vertical' or 'horizontal').
      'direction' => 'vertical',
      // Keys of colors to use for the gradient.
      'colors' => ['top', 'bottom'],
    ],
  ],

  // Preview files.
  'preview_library' => 'honey/color.preview',
  'preview_html' => 'color/preview.html',

  // Attachments.
  '#attached' => [
    'drupalSettings' => [
      'color' => [
        // Put the logo path into JavaScript for the live preview.
        'logo' => theme_get_setting('logo.url', 'honey'),
      ],
    ],
  ],
];
