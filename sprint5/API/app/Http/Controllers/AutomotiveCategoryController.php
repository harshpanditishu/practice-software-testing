<?php

namespace App\Http\Controllers;

use App\Services\CategoryService;
use App\Services\ProductService;
use Illuminate\Http\Request;

class AutomotiveCategoryController extends Controller
{
    private $categoryService;
    private $productService;

    public function __construct(CategoryService $categoryService, ProductService $productService)
    {
        $this->categoryService = $categoryService;
        $this->productService = $productService;
    }

    public function index()
    {
        $categories = $this->categoryService->getCategoriesTree('automotive-tools');

        return $this->preferredFormat($categories);
    }

    public function products(Request $request)
    {
        $filters = array_merge($request->all(), ['by_category_slug' => 'automotive-tools']);
        $products = $this->productService->getAllProducts($filters);

        return $this->preferredFormat($products);
    }
}

