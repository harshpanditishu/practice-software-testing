<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Symfony\Component\HttpFoundation\Response as ResponseAlias;

uses(DatabaseMigrations::class);

test('retrieve automotive categories tree endpoint', function () {
    $rootCategory = Category::factory()->create([
        'name' => 'Automotive Tools',
        'slug' => 'automotive-tools',
        'parent_id' => null,
    ]);

    Category::factory()->create([
        'name' => 'Automotive Sub Category',
        'slug' => 'automotive-sub-category',
        'parent_id' => $rootCategory->id,
    ]);

    $response = $this->getJson('/categories/tree?by_category_slug=automotive-tools');

    $response
        ->assertStatus(ResponseAlias::HTTP_OK)
        ->assertJsonStructure([
            '*' => [
                'name',
                'slug',
                'sub_categories',
            ]
        ])
        ->assertJsonFragment([
            'name' => 'Automotive Tools',
            'slug' => 'automotive-tools',
        ]);
});

test('retrieve automotive category products endpoint', function () {
    $brand = Brand::factory()->create();
    $productImage = ProductImage::factory()->create();

    $automotiveCategory = Category::factory()->create([
        'name' => 'Automotive Tools',
        'slug' => 'automotive-tools',
        'parent_id' => null,
    ]);

    $nonAutomotiveCategory = Category::factory()->create([
        'name' => 'Other Category',
        'slug' => 'other-category',
        'parent_id' => null,
    ]);

    Product::factory()->create([
        'name' => 'Automotive Product',
        'brand_id' => $brand->id,
        'category_id' => $automotiveCategory->id,
        'product_image_id' => $productImage->id,
        'is_rental' => false,
    ]);

    Product::factory()->create([
        'name' => 'Non Automotive Product',
        'brand_id' => $brand->id,
        'category_id' => $nonAutomotiveCategory->id,
        'product_image_id' => $productImage->id,
        'is_rental' => false,
    ]);

    $response = $this->getJson('/products?by_category_slug=automotive-tools');

    $response
        ->assertStatus(ResponseAlias::HTTP_OK)
        ->assertJsonPath('total', 1)
        ->assertJsonFragment([
            'name' => 'Automotive Product',
        ]);
});
