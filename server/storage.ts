import session from "express-session";
import { db } from "./db";
import { users, products, purchaseRequests, type User, type InsertUser, type Product, type InsertProduct, type PurchaseRequest, type InsertPurchaseRequest } from "@shared/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getProducts(): Promise<(Product & { seller: User })[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<(Product & { seller: User })[]>;
  getProductsBySeller(sellerId: number): Promise<(Product & { seller: User })[]>;
  createProduct(product: InsertProduct, sellerId: number): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  createPurchaseRequest(request: InsertPurchaseRequest, buyerId: number): Promise<PurchaseRequest>;
  getPurchaseRequestsForProduct(productId: number): Promise<PurchaseRequest[]>;
  getPurchaseRequestsForSeller(sellerId: number): Promise<(PurchaseRequest & { product: Product, buyer: User })[]>;
  getPurchaseRequestsForBuyer(buyerId: number): Promise<(PurchaseRequest & { product: Product, seller: User })[]>;
  updatePurchaseRequest(id: number, status: string): Promise<PurchaseRequest>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getProducts(): Promise<(Product & { seller: User })[]> {
    const result = await db
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        price: products.price,
        category: products.category,
        image: products.image,
        sellerId: products.sellerId,
        sold: products.sold,
        createdAt: products.createdAt,
        seller: users,
      })
      .from(products)
      .innerJoin(users, eq(products.sellerId, users.id))
      .orderBy(
        asc(products.sold),
        desc(products.createdAt)
      );

    return result;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductsByCategory(category: string): Promise<(Product & { seller: User })[]> {
    return await db
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        price: products.price,
        category: products.category,
        image: products.image,
        sellerId: products.sellerId,
        sold: products.sold,
        createdAt: products.createdAt,
        seller: users,
      })
      .from(products)
      .innerJoin(users, eq(products.sellerId, users.id))
      .where(eq(products.category, category))
      .orderBy(
        asc(products.sold),
        desc(products.createdAt)
      );
  }

  async getProductsBySeller(sellerId: number): Promise<(Product & { seller: User })[]> {
    return await db
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        price: products.price,
        category: products.category,
        image: products.image,
        sellerId: products.sellerId,
        sold: products.sold,
        createdAt: products.createdAt,
        seller: users,
      })
      .from(products)
      .innerJoin(users, eq(products.sellerId, users.id))
      .where(eq(products.sellerId, sellerId))
      .orderBy(desc(products.createdAt));
  }

  async createProduct(insertProduct: InsertProduct, sellerId: number): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values({ ...insertProduct, sellerId })
      .returning();
    return product;
  }

  async updateProduct(id: number, update: Partial<Product>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set(update)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async createPurchaseRequest(request: InsertPurchaseRequest, buyerId: number): Promise<PurchaseRequest> {
    const [purchaseRequest] = await db
      .insert(purchaseRequests)
      .values({ ...request, buyerId })
      .returning();
    return purchaseRequest;
  }

  async getPurchaseRequestsForProduct(productId: number): Promise<PurchaseRequest[]> {
    return await db
      .select()
      .from(purchaseRequests)
      .where(eq(purchaseRequests.productId, productId));
  }

  async getPurchaseRequestsForSeller(sellerId: number): Promise<(PurchaseRequest & { product: Product, buyer: User })[]> {
    const result = await db
      .select({
        id: purchaseRequests.id,
        productId: purchaseRequests.productId,
        buyerId: purchaseRequests.buyerId,
        status: purchaseRequests.status,
        message: purchaseRequests.message,
        createdAt: purchaseRequests.createdAt,
        product: products,
        buyer: users,
      })
      .from(purchaseRequests)
      .innerJoin(products, eq(purchaseRequests.productId, products.id))
      .innerJoin(users, eq(purchaseRequests.buyerId, users.id))
      .where(eq(products.sellerId, sellerId))
      .orderBy(desc(purchaseRequests.createdAt));

    return result;
  }

  async getPurchaseRequestsForBuyer(buyerId: number): Promise<(PurchaseRequest & { product: Product, seller: User })[]> {
    const result = await db
      .select({
        id: purchaseRequests.id,
        productId: purchaseRequests.productId,
        buyerId: purchaseRequests.buyerId,
        status: purchaseRequests.status,
        message: purchaseRequests.message,
        createdAt: purchaseRequests.createdAt,
        product: products,
        seller: users,
      })
      .from(purchaseRequests)
      .innerJoin(products, eq(purchaseRequests.productId, products.id))
      .innerJoin(users, eq(products.sellerId, users.id))
      .where(eq(purchaseRequests.buyerId, buyerId))
      .orderBy(desc(purchaseRequests.createdAt));

    return result;
  }

  async updatePurchaseRequest(id: number, status: string): Promise<PurchaseRequest> {
    const [request] = await db
      .update(purchaseRequests)
      .set({ status })
      .where(eq(purchaseRequests.id, id))
      .returning();

    if (status === "approved") {
      const [approvedRequest] = await db
        .select()
        .from(purchaseRequests)
        .where(eq(purchaseRequests.id, id));

      if (approvedRequest) {
        // Reject all other pending requests for this product
        await db
          .update(purchaseRequests)
          .set({ status: "rejected" })
          .where(
            and(
              eq(purchaseRequests.productId, approvedRequest.productId),
              eq(purchaseRequests.status, "pending")
            )
          );
      }
    }

    const [currentRequest] = await db
      .select()
      .from(purchaseRequests)
      .where(eq(purchaseRequests.id, id));

    if (currentRequest && (status === "approved" || status === "rejected")) {
      // Update all requests from the same user for this product
      await db
        .update(purchaseRequests)
        .set({ status })
        .where(
          and(
            eq(purchaseRequests.productId, currentRequest.productId),
            eq(purchaseRequests.buyerId, currentRequest.buyerId),
            eq(purchaseRequests.status, "pending")
          )
        );
    }

    return request;
  }
}

export const storage = new DatabaseStorage();