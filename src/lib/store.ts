import { useState, useEffect, useCallback } from "react";

export interface Product {
  id: string;
  product_name: string;
  category: string;
  quantity: number;
  price: number;
  supplier_name: string;
  date_added: string;
}

export interface Asset {
  id: string;
  asset_name: string;
  asset_id: string;
  assigned_to: string;
  purchase_date: string;
  condition: string;
  status: "Active" | "In Repair" | "Retired";
}

export interface Transaction {
  id: string;
  product_id: string;
  type: "in" | "out";
  quantity: number;
  date: string;
}

export interface Activity {
  id: string;
  message: string;
  type: "product" | "asset" | "alert";
  date: string;
}

const PRODUCTS_KEY = "ims_products";
const ASSETS_KEY = "ims_assets";
const ACTIVITIES_KEY = "ims_activities";

function load<T>(key: string, fallback: T[]): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Seed data
const seedProducts: Product[] = [
  { id: "p1", product_name: "Wireless Mouse", category: "Electronics", quantity: 45, price: 29.99, supplier_name: "TechSupply Co", date_added: "2024-01-15" },
  { id: "p2", product_name: "USB-C Cable", category: "Electronics", quantity: 3, price: 12.99, supplier_name: "CableWorld", date_added: "2024-02-01" },
  { id: "p3", product_name: "Office Chair", category: "Furniture", quantity: 12, price: 249.99, supplier_name: "FurniPro", date_added: "2024-01-20" },
  { id: "p4", product_name: "A4 Paper (500 sheets)", category: "Office Supplies", quantity: 2, price: 8.99, supplier_name: "PaperMart", date_added: "2024-03-01" },
  { id: "p5", product_name: "Webcam HD 1080p", category: "Electronics", quantity: 20, price: 59.99, supplier_name: "TechSupply Co", date_added: "2024-02-15" },
  { id: "p6", product_name: "Standing Desk", category: "Furniture", quantity: 8, price: 399.99, supplier_name: "FurniPro", date_added: "2024-03-10" },
];

const seedAssets: Asset[] = [
  { id: "a1", asset_name: "MacBook Pro 14\"", asset_id: "AST-001", assigned_to: "John Smith", purchase_date: "2023-06-15", condition: "Good", status: "Active" },
  { id: "a2", asset_name: "Dell Monitor 27\"", asset_id: "AST-002", assigned_to: "Jane Doe", purchase_date: "2023-08-20", condition: "Excellent", status: "Active" },
  { id: "a3", asset_name: "HP LaserJet Printer", asset_id: "AST-003", assigned_to: "Office", purchase_date: "2022-11-10", condition: "Fair", status: "In Repair" },
  { id: "a4", asset_name: "Ergonomic Keyboard", asset_id: "AST-004", assigned_to: "Mike Johnson", purchase_date: "2024-01-05", condition: "Excellent", status: "Active" },
  { id: "a5", asset_name: "Old Desktop PC", asset_id: "AST-005", assigned_to: "Storage", purchase_date: "2020-03-12", condition: "Poor", status: "Retired" },
];

const seedActivities: Activity[] = [
  { id: "act1", message: "New product added: Standing Desk", type: "product", date: "2024-03-10" },
  { id: "act2", message: "Low stock alert: USB-C Cable (3 remaining)", type: "alert", date: "2024-03-09" },
  { id: "act3", message: "Asset AST-003 status changed to In Repair", type: "asset", date: "2024-03-08" },
  { id: "act4", message: "Low stock alert: A4 Paper (2 remaining)", type: "alert", date: "2024-03-07" },
  { id: "act5", message: "New product added: Webcam HD 1080p", type: "product", date: "2024-02-15" },
];

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(() => load(PRODUCTS_KEY, seedProducts));

  useEffect(() => { save(PRODUCTS_KEY, products); }, [products]);

  const addProduct = useCallback((p: Omit<Product, "id">) => {
    const newP = { ...p, id: crypto.randomUUID() };
    setProducts(prev => [...prev, newP]);
    addActivity(`New product added: ${p.product_name}`, "product");
    return newP;
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  return { products, addProduct, updateProduct, deleteProduct };
}

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>(() => load(ASSETS_KEY, seedAssets));

  useEffect(() => { save(ASSETS_KEY, assets); }, [assets]);

  const addAsset = useCallback((a: Omit<Asset, "id">) => {
    const newA = { ...a, id: crypto.randomUUID() };
    setAssets(prev => [...prev, newA]);
    addActivity(`New asset added: ${a.asset_name}`, "asset");
    return newA;
  }, []);

  const updateAsset = useCallback((id: string, updates: Partial<Asset>) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const deleteAsset = useCallback((id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  }, []);

  return { assets, addAsset, updateAsset, deleteAsset };
}

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>(() => load(ACTIVITIES_KEY, seedActivities));
  useEffect(() => { save(ACTIVITIES_KEY, activities); }, [activities]);
  return activities;
}

function addActivity(message: string, type: Activity["type"]) {
  const activities = load<Activity>(ACTIVITIES_KEY, []);
  const newAct: Activity = { id: crypto.randomUUID(), message, type, date: new Date().toISOString().slice(0, 10) };
  save(ACTIVITIES_KEY, [newAct, ...activities].slice(0, 20));
}

export const LOW_STOCK_THRESHOLD = 5;
