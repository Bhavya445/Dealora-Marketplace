import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProductSchema, insertPurchaseRequestSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from 'express';

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  })
});

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Image upload endpoint
  app.post("/api/upload", upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Products
  app.get("/api/products", async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get("/api/products/category/:category", async (req, res) => {
    const products = await storage.getProductsByCategory(req.params.category);
    res.json(products);
  });

  app.get("/api/products/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).send("Invalid product ID");
    }
    const product = await storage.getProduct(id);
    if (!product) return res.status(404).send("Product not found");
    res.json(product);
  });

  app.post("/api/products", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const result = insertProductSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const product = await storage.createProduct(result.data, req.user.id);
    res.status(201).json(product);
  });

  app.patch("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).send("Invalid product ID");
    }

    const product = await storage.getProduct(id);
    if (!product) return res.status(404).send("Product not found");
    if (product.sellerId !== req.user.id) return res.sendStatus(403);

    const updated = await storage.updateProduct(id, req.body);
    res.json(updated);
  });

  app.get("/api/products/seller", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const products = await storage.getProductsBySeller(req.user.id);
    res.json(products);
  });

  app.delete("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).send("Invalid product ID");
    }

    const product = await storage.getProduct(id);
    if (!product) return res.status(404).send("Product not found");
    if (product.sellerId !== req.user.id) return res.sendStatus(403);

    await storage.deleteProduct(id);
    res.sendStatus(200);
  });

  // Purchase Requests
  app.post("/api/products/:id/request", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).send("Invalid product ID");
    }

    const product = await storage.getProduct(id);
    if (!product) return res.status(404).send("Product not found");
    if (product.sold) return res.status(400).send("Product already sold");
    if (product.sellerId === req.user.id) return res.status(403).send("Cannot request to buy your own product");

    const result = insertPurchaseRequestSchema.safeParse({
      productId: id,
      message: req.body.message,
    });

    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const request = await storage.createPurchaseRequest(result.data, req.user.id);
    res.status(201).json(request);
  });

  app.get("/api/purchase-requests/seller", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const requests = await storage.getPurchaseRequestsForSeller(req.user.id);
    res.json(requests);
  });

  app.get("/api/purchase-requests/buyer", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const requests = await storage.getPurchaseRequestsForBuyer(req.user.id);
    res.json(requests);
  });

  app.post("/api/purchase-requests/:id/approve", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).send("Invalid request ID");
    }

    const request = await storage.updatePurchaseRequest(id, "approved");
    const product = await storage.updateProduct(request.productId, { sold: true });

    res.json({ request, product });
  });

  app.post("/api/purchase-requests/:id/reject", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).send("Invalid request ID");
    }

    const request = await storage.updatePurchaseRequest(id, "rejected");
    res.json(request);
  });

  const httpServer = createServer(app);
  return httpServer;
}